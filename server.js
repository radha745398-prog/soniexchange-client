// server.js - SportBex Live Matches, Upcoming Series & Ball-by-Ball Commentary

const express = require('express');
const path = require('path');
const app = express();

const { MASTER_ADMIN_KEY, CACHE_TTL } = require('./config/sportbexConfig');
const { sbGet } = require('./services/sportbexClient');
const { fetchSeriesListRaw } = require('./services/getSeries');
const { fetchUpcomingSeriesRaw, mapUpcomingSeriesItems } = require('./services/upcomingSeries');
const {
    safestr,
    esc,
    parseTimestamp,
    parseScoreAndOvers,
    getSportBexStatus,
    fetchLiveMatchesRaw,
    normalizeLiveMatchCard
} = require('./services/liveMatches');
const { fetchSeriesMatchesRaw, normalizeUpcomingMatchCard } = require('./services/seriesMatches');

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const UPCOMING_WINDOW_MS = 24 * 60 * 60 * 1000;
const PAST_GRACE_MS = 15 * 60 * 1000;

function collectSeriesIds(rawUpcomingSeries, rawSeries, limit = 60) {
    const now = Date.now();
    const candidates = [
        ...(Array.isArray(rawUpcomingSeries) ? rawUpcomingSeries : []),
        ...(Array.isArray(rawSeries) ? rawSeries : [])
    ];

    const sortedCandidates = candidates
        .filter((s) => s && typeof s === 'object' && !s.error)
        .map((s) => {
            const id = String(s?._id ?? s?.id ?? s?.seriesId ?? '').trim();
            const startTs = parseTimestamp(s?.startDate || s?.start_date || s?.startTime);
            const endTs = parseTimestamp(s?.endDate || s?.end_date || s?.endTime);

            let bucket = 2;
            if (startTs && endTs && startTs <= now && now <= endTs) {
                bucket = 0;
            } else if (startTs && Math.abs(startTs - now) <= 3 * UPCOMING_WINDOW_MS) {
                bucket = 0;
            } else if (startTs) {
                bucket = 1;
            }

            return { id, startTs: startTs || Number.MAX_SAFE_INTEGER, bucket };
        })
        .filter((item) => Boolean(item.id))
        .sort((a, b) => {
            if (a.bucket !== b.bucket) return a.bucket - b.bucket;
            return a.startTs - b.startTs;
        });

    return Array.from(new Set(sortedCandidates.map((x) => x.id))).slice(0, limit);
}

function parseDurationMsFromText(text) {
    const str = String(text || '');
    const mmss = str.match(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/);
    if (mmss) {
        if (mmss[3] !== undefined) {
            const h = parseInt(mmss[1], 10) || 0;
            const m = parseInt(mmss[2], 10) || 0;
            const s = parseInt(mmss[3], 10) || 0;
            return ((h * 3600) + (m * 60) + s) * 1000;
        }
        const m = parseInt(mmss[1], 10) || 0;
        const s = parseInt(mmss[2], 10) || 0;
        return ((m * 60) + s) * 1000;
    }

    const minsMatch = str.match(/(\d+)\s*(?:MIN|MINS|MINUTE|MINUTES)\b/i);
    if (minsMatch) {
        const mins = parseInt(minsMatch[1], 10);
        if (Number.isFinite(mins) && mins > 0) return mins * 60 * 1000;
    }

    return null;
}

function extractBreakTimerInfo(rawLiveMatch, scoreObj, noteText) {
    const src = rawLiveMatch || {};
    const sc = scoreObj || {};
    const combinedText = `${noteText || ''} ${src.status || ''} ${sc.status || ''}`.toUpperCase();

    const rawEndTs = parseTimestamp(
        src.breakEndDate || src.breakEndTime || src.breakEnd || sc.breakEndDate || sc.breakEndTime
    );
    const rawStartTs = parseTimestamp(
        src.breakStartDate || src.breakStartTime || src.breakStart || sc.breakStartDate || sc.breakStartTime || src.updatedAt || src.timestamp
    );

    const isCountdownHint =
        Boolean(rawEndTs) ||
        combinedText.includes('COUNTDOWN') ||
        combinedText.includes('REMAINING') ||
        combinedText.includes('STARTS IN') ||
        combinedText.includes('RESUMES IN') ||
        combinedText.includes('LEFT');

    if (rawEndTs && rawEndTs > Date.now()) {
        return {
            breakTimerMode: 'COUNTDOWN',
            breakEndTimestamp: rawEndTs,
            breakStartTimestamp: null
        };
    }

    const durationMs = parseDurationMsFromText(noteText);
    if (isCountdownHint && durationMs && durationMs > 0) {
        return {
            breakTimerMode: 'COUNTDOWN',
            breakEndTimestamp: Date.now() + durationMs,
            breakStartTimestamp: null
        };
    }

    return {
        breakTimerMode: 'FORWARD',
        breakEndTimestamp: null,
        breakStartTimestamp: rawStartTs || Date.now()
    };
}

// Get Match Commentary (Ball-by-Ball)
async function fetchCommentaryRaw(matchId) {
    const cleanId = encodeURIComponent(String(matchId || '').trim());
    if (!cleanId) return null;

    const json = await sbGet(
        `/api/live-score/match/${cleanId}/commentary?perPage=20&page=1`,
        CACHE_TTL.LIVE_MS
    );

    if (json?.data && typeof json.data === 'object') return json.data;
    if (json?.score || Array.isArray(json?.balls)) return json;
    return null;
}

function normalizeBallSymbol(rawVal) {
    const s = String(rawVal ?? '').trim().toUpperCase();
    if (!s || s === '0' || s === 'DOT' || s === '.') return 'DOT';
    if (s === 'WK' || s === 'W' || s.includes('WICKET') || s.includes('OUT')) return 'W';
    if (['6', '4', '3', '2', '1'].includes(s)) return s;
    return s.slice(0, 4);
}

// Builds oversList [{ overNumber, balls, score }] from SportBex commentary
function extractCommentaryOversList(commentaryData) {
    if (!commentaryData) return [];

    const ballsArr = Array.isArray(commentaryData.balls) ? commentaryData.balls : [];
    const oversMap = new Map();

    ballsArr.forEach(item => {
        const ovSummary = item?.overSummary;
        if (ovSummary && Array.isArray(ovSummary.overSummaryBalls)) {
            const ovNum = Number(item.overNumber) || Number(ovSummary.overNumber) || 1;
            const mappedBalls = ovSummary.overSummaryBalls.map(normalizeBallSymbol);
            const scoreStr = ovSummary.totalScore !== undefined && ovSummary.totalScore !== null
                ? String(ovSummary.totalScore)
                : '';

            oversMap.set(ovNum, {
                overNumber: ovNum,
                balls: mappedBalls,
                score: scoreStr
            });
        }
    });

    const chronoBalls = [...ballsArr].sort((a, b) => {
        const ovDiff = (Number(a.overNumber) || 0) - (Number(b.overNumber) || 0);
        if (ovDiff !== 0) return ovDiff;
        const bDiff = (Number(a.ballNumber) || 0) - (Number(b.ballNumber) || 0);
        if (bDiff !== 0) return bDiff;
        return (Number(a.commentaryTimestamp) || 0) - (Number(b.commentaryTimestamp) || 0);
    });

    const groupedByOver = new Map();
    chronoBalls.forEach(b => {
        const ovNum = Number(b.overNumber) || 1;
        if (!groupedByOver.has(ovNum)) groupedByOver.set(ovNum, []);
        groupedByOver.get(ovNum).push(normalizeBallSymbol(b.value));
    });

    groupedByOver.forEach((ballsList, ovNum) => {
        const existing = oversMap.get(ovNum);
        if (!existing || !existing.balls || existing.balls.length === 0) {
            oversMap.set(ovNum, {
                overNumber: ovNum,
                balls: ballsList,
                score: existing ? existing.score : ''
            });
        }
    });

    return Array.from(oversMap.values()).sort((a, b) => a.overNumber - b.overNumber);
}

function extractLatestCommentaryInfo(commentaryData) {
    const ballsArr = Array.isArray(commentaryData?.balls) ? commentaryData.balls : [];
    if (ballsArr.length === 0) {
        return {
            latestCommentary: '',
            latestBall: '',
            latestOver: '',
            latestBallNumber: '',
            latestBallTimestamp: 0
        };
    }

    const sorted = [...ballsArr].sort((a, b) => {
        const tsDiff = (Number(b.commentaryTimestamp) || 0) - (Number(a.commentaryTimestamp) || 0);
        if (tsDiff !== 0) return tsDiff;
        const ovDiff = (Number(b.overNumber) || 0) - (Number(a.overNumber) || 0);
        if (ovDiff !== 0) return ovDiff;
        return (Number(b.ballNumber) || 0) - (Number(a.ballNumber) || 0);
    });

    const top = sorted[0] || {};
    return {
        latestCommentary: safestr(top.commentary || top.text || top.description, ''),
        latestBall: normalizeBallSymbol(top.value),
        latestOver: top.overNumber !== undefined && top.overNumber !== null ? String(top.overNumber) : '',
        latestBallNumber: top.ballNumber !== undefined && top.ballNumber !== null ? String(top.ballNumber) : '',
        latestBallTimestamp: Number(top.commentaryTimestamp) || 0
    };
}

// Merge Live Match metadata + Commentary score/balls (or Upcoming match lookup) into matchHeader format
async function loadMatchData(matchId) {
    const cleanId = String(matchId || '').trim();
    if (!cleanId) return null;

    const [liveList, commentary] = await Promise.all([
        fetchLiveMatchesRaw(),
        fetchCommentaryRaw(cleanId)
    ]);

    const rawLiveMatch = liveList.find(
        m => String(m._id || m.id || m.matchId || '').trim() === cleanId
    ) || null;

    if (!rawLiveMatch && !commentary) {
        try {
            const [rawUpcomingSeries, rawSeries] = await Promise.all([
                fetchUpcomingSeriesRaw(),
                fetchSeriesListRaw()
            ]);
            const seriesIds = collectSeriesIds(rawUpcomingSeries, rawSeries, 60);

            const matchesArrays = await Promise.all(
                seriesIds.map(sid => fetchSeriesMatchesRaw(sid).catch(() => []))
            );
            const foundUpcoming = matchesArrays
                .flat()
                .find(m => String(m?._id || m?.id || m?.matchId || '').trim() === cleanId);

            if (foundUpcoming) {
                const upNorm = normalizeUpcomingMatchCard(foundUpcoming);
                if (upNorm) {
                    return {
                        id: esc(cleanId),
                        eventId: esc(upNorm.eventId || ''),
                        tournament: upNorm.tournament,
                        teamA: upNorm.teamA,
                        teamB: upNorm.teamB,
                        shortA: upNorm.shortA,
                        shortB: upNorm.shortB,
                        logoA: upNorm.logoA,
                        logoB: upNorm.logoB,
                        flagA: '',
                        flagB: '',
                        scoreA: '-',
                        oversA: '',
                        scoreB: '-',
                        oversB: '',
                        oversList: [],
                        liveEvent: null,
                        latestCommentary: '',
                        matchNote: '',
                        resultText: '',
                        status: 'UPCOMING',
                        isLive: false,
                        matchStateText: 'UPCOMING',
                        dateTime: upNorm.dateTime,
                        venue: upNorm.venue,
                        countdownTimestamp: upNorm.countdownTimestamp || null,
                        breakTimerMode: null,
                        breakEndTimestamp: null,
                        breakStartTimestamp: null
                    };
                }
            }
        } catch (e) {
            console.error('Upcoming match lookup error:', e.message);
        }
        return null;
    }

    const scoreObj = commentary?.score || {};
    const teamsObj = scoreObj.teams || {};
    const cTeam1 = teamsObj.team1 || null;
    const cTeam2 = teamsObj.team2 || null;

    const lT1 = rawLiveMatch?.teams?.t1 || {};
    const lT2 = rawLiveMatch?.teams?.t2 || {};

    const teamAName = safestr(cTeam1?.name || lT1.name, '');
    const teamBName = safestr(cTeam2?.name || lT2.name, '');

    const shortA = safestr(cTeam1?.shortName || lT1.short_name, teamAName.slice(0, 4).toUpperCase());
    const shortB = safestr(cTeam2?.shortName || lT2.short_name, teamBName.slice(0, 4).toUpperCase());

    const logoA = safestr(cTeam1?.logo || lT1.logo, '');
    const logoB = safestr(cTeam2?.logo || lT2.logo, '');

    let scoreA = '-';
    let oversA = '';
    if (cTeam1?.inningsStats) {
        const st1 = cTeam1.inningsStats;
        if (st1.runs !== undefined && st1.runs !== null) {
            scoreA = st1.wickets !== undefined && st1.wickets !== null
                ? `${st1.runs}/${st1.wickets}`
                : String(st1.runs);
        }
        oversA = st1.overs !== undefined && st1.overs !== null ? String(st1.overs) : '';
    } else if (lT1.score) {
        const parsed1 = parseScoreAndOvers(lT1.score);
        scoreA = parsed1.score;
        oversA = parsed1.overs;
    }

    let scoreB = '-';
    let oversB = '';
    if (cTeam2?.inningsStats) {
        const st2 = cTeam2.inningsStats;
        if (st2.runs !== undefined && st2.runs !== null) {
            scoreB = st2.wickets !== undefined && st2.wickets !== null
                ? `${st2.runs}/${st2.wickets}`
                : String(st2.runs);
        }
        oversB = st2.overs !== undefined && st2.overs !== null ? String(st2.overs) : '';
    } else if (lT2.score) {
        const parsed2 = parseScoreAndOvers(lT2.score);
        scoreB = parsed2.score;
        oversB = parsed2.overs;
    }

    const rawNote = safestr(
        rawLiveMatch?.sessionStatus || scoreObj.tossDecision || '',
        ''
    );
    const rawResult = safestr(rawLiveMatch?.result?.message || '', '');

    const status = getSportBexStatus(
        scoreObj.status || rawLiveMatch?.status,
        rawLiveMatch?.isLive ?? (scoreObj.status === 'LIVE'),
        `${rawNote} ${rawResult}`
    );

    const startTs = parseTimestamp(rawLiveMatch?.startDate || rawLiveMatch?.timestamp);
    const oversList = extractCommentaryOversList(commentary);
    const latestComm = extractLatestCommentaryInfo(commentary);
    const breakInfo = status === 'BREAK'
        ? extractBreakTimerInfo(rawLiveMatch, scoreObj, rawNote)
        : { breakTimerMode: null, breakEndTimestamp: null, breakStartTimestamp: null };

    const matchStateText = status === 'FINISHED'
        ? (rawResult || rawNote || 'FINISHED')
        : (status === 'BREAK'
            ? (rawNote || 'BREAK')
            : (status === 'LIVE' ? 'LIVE' : status));

    return {
        id: esc(cleanId),
        eventId: esc(rawLiveMatch?.eventId || ''),
        tournament: esc([rawLiveMatch?.seriesName, rawLiveMatch?.name].filter(Boolean).join(' • ')),
        teamA: esc(teamAName),
        teamB: esc(teamBName),
        shortA: esc(shortA),
        shortB: esc(shortB),
        logoA: esc(logoA),
        logoB: esc(logoB),
        flagA: '',
        flagB: '',
        scoreA: esc(scoreA),
        oversA: esc(oversA),
        scoreB: esc(scoreB),
        oversB: esc(oversB),
        oversList,
        liveEvent: {
            latestBall: latestComm.latestBall,
            latestOver: latestComm.latestOver,
            latestBallNumber: latestComm.latestBallNumber,
            latestBallTimestamp: latestComm.latestBallTimestamp
        },
        latestCommentary: esc(latestComm.latestCommentary),
        matchNote: esc(rawNote),
        resultText: esc(rawResult),
        status,
        isLive: status === 'LIVE',
        matchStateText: esc(matchStateText),
        dateTime: esc(rawNote || (startTs ? new Date(startTs).toLocaleString('en-IN') : '')),
        venue: esc(rawLiveMatch?.ground || ''),
        countdownTimestamp: status === 'UPCOMING' ? startTs : null,
        breakTimerMode: breakInfo.breakTimerMode,
        breakEndTimestamp: breakInfo.breakEndTimestamp,
        breakStartTimestamp: breakInfo.breakStartTimestamp
    };
}

// HOME
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SWITCH TO CLIENT
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    const adminToken = req.query.admin_token || MASTER_ADMIN_KEY;
    res.redirect(
        `/dashboard?user=${encodeURIComponent(targetUser)}&admin_token=${encodeURIComponent(adminToken)}`
    );
});

// DASHBOARD (Live Matches + Upcoming Matches & Series)
app.get('/dashboard', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const user = {
        username: esc(req.query.user || 'Client'),
        points: 50000,
        exposure: 1200
    };

    let liveMatches = [];
    let upcomingItems = [];

    try {
        const [rawLive, rawSeries, rawUpcomingSeries] = await Promise.all([
            fetchLiveMatchesRaw(),
            fetchSeriesListRaw(),
            fetchUpcomingSeriesRaw()
        ]);

        liveMatches = rawLive
            .filter(m => m && (m._id || m.id || m.matchId))
            .map(normalizeLiveMatchCard)
            .filter(Boolean);

        const seriesIds = collectSeriesIds(rawUpcomingSeries, rawSeries, 60);

        const seriesMatchesArrays = await Promise.all(
            seriesIds.map(sid => fetchSeriesMatchesRaw(sid).catch(() => []))
        );

        const flatSeriesMatches = seriesMatchesArrays.flat();
        const now = Date.now();
        const within24hLimit = now + UPCOMING_WINDOW_MS;
        const liveIds = new Set(liveMatches.map(m => String(m.id)));
        const seenUpcomingIds = new Set();

        const allUpcomingSorted = flatSeriesMatches
            .filter(m => m && (m._id || m.id || m.matchId))
            .map(normalizeUpcomingMatchCard)
            .filter(m => {
                if (!m || !m.id) return false;
                if (liveIds.has(m.id) || seenUpcomingIds.has(m.id)) return false;
                if (m.status !== 'UPCOMING') return false;
                if (m.startTs && m.startTs < now - PAST_GRACE_MS) return false;
                seenUpcomingIds.add(m.id);
                return true;
            })
            .sort((a, b) => {
                const aIn24h = a.startTs && a.startTs <= within24hLimit ? 0 : 1;
                const bIn24h = b.startTs && b.startTs <= within24hLimit ? 0 : 1;
                if (aIn24h !== bIn24h) return aIn24h - bIn24h;
                return (a.startTs || Number.MAX_SAFE_INTEGER) - (b.startTs || Number.MAX_SAFE_INTEGER);
            });

        const next24hMatches = allUpcomingSorted.filter(
            m => m.startTs && m.startTs <= within24hLimit
        );

        const mappedUpcoming = mapUpcomingSeriesItems(rawUpcomingSeries);
        upcomingItems = next24hMatches.length > 0
            ? next24hMatches
            : (allUpcomingSorted.length > 0
                ? allUpcomingSorted
                : (mappedUpcoming.length > 0 ? mappedUpcoming : mapUpcomingSeriesItems(rawSeries)));

        console.log('[SB UPCOMING]', JSON.stringify({
            rawUpcomingCount: Array.isArray(rawUpcomingSeries) ? rawUpcomingSeries.length : 0,
            rawSeriesCount: Array.isArray(rawSeries) ? rawSeries.length : 0,
            next24hCount: next24hMatches.length,
            totalUpcomingMatchesCount: allUpcomingSorted.length,
            upcomingItemsCount: upcomingItems.length
        }));
    } catch (err) {
        console.error('Dashboard Error:', err.message);
    }

    res.send(renderDashboardPage(user, liveMatches, upcomingItems));
});

// LIVE MATCH POLLING API
app.get('/api/match/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const match = await loadMatchData(req.params.id);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match data not available'
            });
        }
        return res.json({
            success: true,
            match
        });
    } catch (err) {
        console.error('Live Match API Error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch match data'
        });
    }
});

// MATCH DETAIL PAGE
app.get('/match/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const user = {
        username: esc(req.query.user || 'Client'),
        points: 50000,
        exposure: 1200
    };

    const matchId = req.params.id;
    let matchData = {
        id: esc(matchId),
        tournament: '',
        teamA: '',
        teamB: '',
        shortA: '',
        shortB: '',
        logoA: '',
        logoB: '',
        flagA: '',
        flagB: '',
        scoreA: '-',
        oversA: '',
        scoreB: '-',
        oversB: '',
        oversList: [],
        liveEvent: null,
        latestCommentary: '',
        matchNote: '',
        resultText: '',
        status: 'UPCOMING',
        isLive: false,
        matchStateText: '',
        venue: '',
        dateTime: '',
        countdownTimestamp: null,
        breakTimerMode: null,
        breakEndTimestamp: null,
        breakStartTimestamp: null
    };

    try {
        const loaded = await loadMatchData(matchId);
        if (loaded) matchData = loaded;
    } catch (err) {
        console.error('Match Detail Error:', err.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`SportBex server running on port ${PORT}`);
});
