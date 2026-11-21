// server.js - SportBex Live Matches, Upcoming Series & Match Commentary

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// SportBex Trial API Configuration
const SPORTBEX_API_KEY = process.env.SPORTBEX_API_KEY || 'QTkiVDvw56VkWQwsx43lQ8BHaH71ycC5ZAN2wVur';
const SPORTBEX_BASE_URL = process.env.SPORTBEX_BASE_URL || 'https://trial-api.sportbex.com';
const MASTER_ADMIN_KEY = process.env.MASTER_ADMIN_KEY || '';

// Short cache for smooth live polling without hitting trial rate limits
const apiCache = new Map();
const LIVE_CACHE_TTL_MS = 1500;
const SERIES_CACHE_TTL_MS = 30000;

const safestr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
        return val.name || val.short_name || val.shortName || val.text || val.score || fallback;
    }
    return String(val);
};

const esc = (s) => String(safestr(s)).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

function parseTimestamp(value) {
    if (!value) return null;
    let ts;
    if (typeof value === 'number') {
        ts = value < 1000000000000 ? value * 1000 : value;
    } else {
        ts = new Date(value).getTime();
    }
    return Number.isFinite(ts) ? ts : null;
}

// Parses strings like "59/1 (9.3)" or "61/3 (23.0) & 235/10 (60.3)"
function parseScoreAndOvers(rawScoreText) {
    const raw = String(rawScoreText || '').trim();
    if (!raw) return { score: '-', overs: '' };

    const parts = raw.split('&').map(s => s.trim()).filter(Boolean);
    const latestPart = parts[parts.length - 1] || raw;

    const overMatch = latestPart.match(/\(([^)]+)\)\s*$/);
    const overs = overMatch ? overMatch[1].trim() : '';

    const cleanScores = parts.map(p => p.replace(/\s*\([^)]*\)\s*$/, '').trim()).filter(Boolean);
    const score = cleanScores.length > 0 ? cleanScores.join(' & ') : '-';

    return { score, overs };
}

function getSportBexStatus(rawStatus, isLive) {
    const st = String(rawStatus || '').trim().toUpperCase();
    if (
        st.includes('FINISH') ||
        st.includes('COMPLET') ||
        st.includes('RESULT') ||
        st.includes('END')
    ) {
        return 'FINISHED';
    }
    if (
        st.includes('BREAK') ||
        st.includes('LUNCH') ||
        st.includes('TEA') ||
        st.includes('STUMP') ||
        st.includes('DRINK')
    ) {
        return 'BREAK';
    }
    if (isLive === true || st === 'LIVE' || st.includes('INPLAY') || st.includes('IN PROGRESS')) {
        return 'LIVE';
    }
    return 'UPCOMING';
}

async function sbGet(endpoint, ttlMs = LIVE_CACHE_TTL_MS) {
    try {
        const now = Date.now();
        const cached = apiCache.get(endpoint);
        if (ttlMs > 0 && cached && (now - cached.timestamp) < ttlMs) {
            return cached.data;
        }

        const url = `${SPORTBEX_BASE_URL}${endpoint}`;
        console.log(`[SPORTBEX REQUEST] ${url}`);

        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'sportbex-api-key': SPORTBEX_API_KEY.trim(),
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        const text = await resp.text();
        console.log(`[SPORTBEX RESPONSE] ${endpoint} - HTTP ${resp.status}`);

        if (!resp.ok) {
            console.error('[SPORTBEX ERROR]', text.slice(0, 300));
            return cached ? cached.data : null;
        }

        const json = JSON.parse(text);
        if (ttlMs > 0) {
            apiCache.set(endpoint, { data: json, timestamp: now });
        }
        return json;
    } catch (err) {
        console.error('[SPORTBEX FETCH EXCEPTION]', err.message);
        const cached = apiCache.get(endpoint);
        return cached ? cached.data : null;
    }
}

// 1. Get All Live Matches
async function fetchLiveMatchesRaw() {
    const json = await sbGet('/api/live-score/match/live', LIVE_CACHE_TTL_MS);
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
}

// 2. Get Upcoming Series
async function fetchSeriesListRaw() {
    const json = await sbGet('/api/live-score/series/upcoming', SERIES_CACHE_TTL_MS);
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
}

// 3. Get Match Commentary
async function fetchCommentaryRaw(matchId) {
    const cleanId = encodeURIComponent(String(matchId || '').trim());
    if (!cleanId) return null;

    const json = await sbGet(
        `/api/live-score/match/${cleanId}/commentary?perPage=10&page=1`,
        LIVE_CACHE_TTL_MS
    );

    if (json?.data && typeof json.data === 'object') return json.data;
    if (json?.score || Array.isArray(json?.balls)) return json;
    return null;
}

function normalizeLiveMatchCard(m) {
    const id = String(m._id || m.id || m.matchId || '').trim();
    const t1 = m.teams?.t1 || {};
    const t2 = m.teams?.t2 || {};

    const teamA = safestr(t1.name, 'Team A');
    const teamB = safestr(t2.name, 'Team B');
    const shortA = safestr(t1.short_name || t1.shortName, teamA.slice(0, 4).toUpperCase());
    const shortB = safestr(t2.short_name || t2.shortName, teamB.slice(0, 4).toUpperCase());

    const p1 = parseScoreAndOvers(t1.score);
    const p2 = parseScoreAndOvers(t2.score);

    const status = getSportBexStatus(m.status, m.isLive);
    const startTs = parseTimestamp(m.startDate || m.timestamp);

    const scoreSummary = [
        p1.score !== '-' ? `${shortA}: ${p1.score}${p1.overs ? ` (${p1.overs})` : ''}` : '',
        p2.score !== '-' ? `${shortB}: ${p2.score}${p2.overs ? ` (${p2.overs})` : ''}` : ''
    ].filter(Boolean).join('  |  ');

    return {
        id: esc(id),
        eventId: esc(m.eventId || ''),
        tournament: esc([m.seriesName, m.name].filter(Boolean).join(' • ') || 'Cricket'),
        teamA: esc(teamA),
        teamB: esc(teamB),
        shortA: esc(shortA),
        shortB: esc(shortB),
        logoA: esc(t1.logo || ''),
        logoB: esc(t2.logo || ''),
        scoreA: esc(p1.score),
        oversA: esc(p1.overs),
        scoreB: esc(p2.score),
        oversB: esc(p2.overs),
        scoreSummary: esc(scoreSummary),
        status,
        isLive: status === 'LIVE',
        dateTime: esc(m.sessionStatus || m.status || (startTs ? new Date(startTs).toLocaleString('en-IN') : '')),
        venue: esc(m.ground || 'Stadium'),
        countdownTimestamp: status === 'UPCOMING' ? startTs : null
    };
}

function mapUpcomingSeriesItems(seriesList) {
    const now = Date.now();
    return (Array.isArray(seriesList) ? seriesList : [])
        .map(s => {
            const startTs = parseTimestamp(s.startDate);
            const endTs = parseTimestamp(s.endDate);
            return {
                id: esc(s._id || s.id || ''),
                title: esc(s.name || 'Series'),
                tournament: s.isPopular ? 'Popular Series' : 'Series',
                dateTime: esc(
                    startTs
                        ? `Starts: ${new Date(startTs).toLocaleDateString('en-IN')}`
                        : ''
                ),
                startTs,
                endTs
            };
        })
        .filter(item => {
            if (!item.startTs) return true;
            return item.startTs > now || (!item.endTs || item.endTs >= now);
        });
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

    // 1. Use overSummary.overSummaryBalls when present
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

    // 2. Group individual balls chronologically by overNumber
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

// Merge Live Match metadata + Commentary score/balls into matchHeader format
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
        return null;
    }

    const scoreObj = commentary?.score || {};
    const teamsObj = scoreObj.teams || {};
    const cTeam1 = teamsObj.team1 || null;
    const cTeam2 = teamsObj.team2 || null;

    const lT1 = rawLiveMatch?.teams?.t1 || {};
    const lT2 = rawLiveMatch?.teams?.t2 || {};

    const teamAName = safestr(cTeam1?.name || lT1.name, 'Team A');
    const teamBName = safestr(cTeam2?.name || lT2.name, 'Team B');

    const shortA = safestr(cTeam1?.shortName || lT1.short_name, teamAName.slice(0, 4).toUpperCase());
    const shortB = safestr(cTeam2?.shortName || lT2.short_name, teamBName.slice(0, 4).toUpperCase());

    const logoA = safestr(cTeam1?.logo || lT1.logo, '');
    const logoB = safestr(cTeam2?.logo || lT2.logo, '');

    // Team 1 score/overs
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

    // Team 2 score/overs
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

    const status = getSportBexStatus(
        scoreObj.status || rawLiveMatch?.status,
        rawLiveMatch?.isLive ?? (scoreObj.status === 'LIVE')
    );

    const startTs = parseTimestamp(rawLiveMatch?.startDate || rawLiveMatch?.timestamp);
    const matchNote = safestr(
        rawLiveMatch?.sessionStatus || scoreObj.tossDecision || '',
        ''
    );
    const resultText = safestr(rawLiveMatch?.result?.message || '', '');
    const oversList = extractCommentaryOversList(commentary);

    return {
        id: esc(cleanId),
        eventId: esc(rawLiveMatch?.eventId || ''),
        tournament: esc([rawLiveMatch?.seriesName, rawLiveMatch?.name].filter(Boolean).join(' • ') || 'Cricket'),
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
        liveEvent: null,
        matchNote: esc(matchNote),
        resultText: esc(resultText),
        status,
        isLive: status === 'LIVE',
        matchStateText: esc(status === 'LIVE' ? 'BOWLER RUNNING IN' : status),
        dateTime: esc(matchNote || (startTs ? new Date(startTs).toLocaleString('en-IN') : '')),
        venue: esc(rawLiveMatch?.ground || 'Stadium'),
        countdownTimestamp: status === 'UPCOMING' ? startTs : null
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

// DASHBOARD (Live Matches + Upcoming Series)
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
        const [rawLive, rawSeries] = await Promise.all([
            fetchLiveMatchesRaw(),
            fetchSeriesListRaw()
        ]);

        liveMatches = rawLive
            .filter(m => m && (m._id || m.id || m.matchId))
            .map(normalizeLiveMatchCard);

        upcomingItems = mapUpcomingSeriesItems(rawSeries);
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
        tournament: 'Cricket Match',
        teamA: 'Team A',
        teamB: 'Team B',
        shortA: 'TEAM A',
        shortB: 'TEAM B',
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
        matchNote: '',
        resultText: '',
        status: 'UPCOMING',
        isLive: false,
        matchStateText: 'UPCOMING',
        venue: 'Stadium',
        dateTime: '',
        countdownTimestamp: null
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
