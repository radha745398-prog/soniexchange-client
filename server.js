// server.js - Final Countdown and Live Match Fix

const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API Key successfully configured
const HIGHLIGHTLY_KEY = 'ce943b6f-f248-4e33-a914-a02e0be48433';

const BASE_URL = 'https://cricket.highlightly.net';
const MASTER_ADMIN_KEY = process.env.MASTER_ADMIN_KEY || '';

// Keep cache disabled/near-zero so polling always gets fresh match data
const apiCache = new Map();
const API_CACHE_TTL_MS = 0;

const safestr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;

    if (typeof val === 'object') {
        return val.name || val.longName || val.description ||
            val.shortName || val.text || val.runs || val.score || fallback;
    }

    return String(val);
};

const esc = (s) => String(safestr(s)).replace(/[&<>"']/g, (c) => (
    {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]
));

function getShortTeamName(name) {
    const clean = String(name || '').trim();
    if (!clean) return 'TEAM';

    const upper = clean.toUpperCase();
    const known = {
        'INDIA': 'IND',
        'PAKISTAN': 'PAK',
        'AUSTRALIA': 'AUS',
        'ENGLAND': 'ENG',
        'SOUTH AFRICA': 'SA',
        'NEW ZEALAND': 'NZ',
        'SRI LANKA': 'SL',
        'BANGLADESH': 'BAN',
        'AFGHANISTAN': 'AFG',
        'WEST INDIES': 'WI',
        'IRELAND': 'IRE',
        'ZIMBABWE': 'ZIM',
        'SCOTLAND': 'SCO',
        'NETHERLANDS': 'NED',
        'UNITED ARAB EMIRATES': 'UAE',
        'UAE': 'UAE'
    };

    if (known[upper]) return known[upper];

    const words = clean
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    if (words.length === 1) {
        return words[0].slice(0, 4).toUpperCase();
    }

    const lastWord = words[words.length - 1].toUpperCase();
    const hasWomen = words.some(w => w.toUpperCase() === 'WOMEN' || w.toUpperCase() === 'W');
    const initials = words
        .filter(w => !['WOMEN', 'W', 'MEN', 'M', 'XI', 'A'].includes(w.toUpperCase()))
        .map(w => w[0])
        .join('')
        .toUpperCase();

    if (lastWord === 'W' || hasWomen) {
        return `${initials || words[0].slice(0, 3).toUpperCase()} W`;
    }

    return (initials || words.map(w => w.slice(0, 2)).join('')).slice(0, 5).toUpperCase();
}

function getRawMatch(json) {
    if (Array.isArray(json)) return json[0] || null;
    if (Array.isArray(json?.data)) return json.data[0] || null;
    if (json?.data && typeof json.data === 'object') return json.data;
    if (Array.isArray(json?.matches)) return json.matches[0] || null;
    return json || null;
}

function parseTimestamp(value) {
    if (!value) return null;

    let timestamp;

    if (typeof value === 'number') {
        timestamp = value < 1000000000000 ? value * 1000 : value;
    } else {
        timestamp = new Date(value).getTime();
    }

    return Number.isFinite(timestamp) ? timestamp : null;
}

function getStartTimestamp(match) {
    if (!match) return null;

    const possibleTimes = [
        match.startTime,
        match.starting_at,
        match.startingAt,
        match.startDate,
        match.dateTime,
        match.time
    ];

    for (const value of possibleTimes) {
        const timestamp = parseTimestamp(value);
        if (timestamp) return timestamp;
    }

    return null;
}

function getStateName(match) {
    const state = match?.state ?? match?.status ?? {};

    if (typeof state === 'string') {
        return state.toLowerCase();
    }

    return String(
        state.description ||
        state.name ||
        state.longName ||
        state.shortName ||
        match?.matchState ||
        ''
    ).toLowerCase();
}

function getMatchStatus(match) {
    const stateName = getStateName(match);

    if (
        stateName.includes('finished') ||
        stateName.includes('completed') ||
        stateName.includes('result') ||
        stateName.includes('abandoned')
    ) {
        return 'FINISHED';
    }

    if (
        stateName.includes('stumps') ||
        stateName.includes('lunch') ||
        stateName.includes('tea') ||
        stateName.includes('drinks') ||
        stateName.includes('break')
    ) {
        return 'BREAK';
    }

    if (
        stateName.includes('scheduled') ||
        stateName.includes('not started') ||
        stateName.includes('upcoming') ||
        stateName.includes('yet to begin')
    ) {
        return 'UPCOMING';
    }

    if (
        match?.isLive === true ||
        stateName.includes('live') ||
        stateName.includes('in progress') ||
        stateName.includes('inplay') ||
        stateName.includes('in play')
    ) {
        return 'LIVE';
    }

    return 'UPCOMING';
}

async function hl(endpoint) {
    try {
        if (!HIGHLIGHTLY_KEY.trim()) {
            console.error('HIGHLIGHTLY_KEY is missing. Add your API key in server.js.');
            return null;
        }

        const now = Date.now();
        const cached = apiCache.get(endpoint);
        if (API_CACHE_TTL_MS > 0 && cached && (now - cached.timestamp) < API_CACHE_TTL_MS) {
            return cached.data;
        }

        console.log(`[API REQUEST] ${BASE_URL}${endpoint}`);

        const r = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'x-rapidapi-key': HIGHLIGHTLY_KEY.trim(),
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        const responseText = await r.text();

        console.log(`[API RESPONSE] ${endpoint} - HTTP ${r.status}`);

        if (!r.ok) {
            console.error('API Error:', responseText.slice(0, 300));
            return cached ? cached.data : null;
        }

        const parsed = JSON.parse(responseText);
        if (API_CACHE_TTL_MS > 0) {
            apiCache.set(endpoint, {
                data: parsed,
                timestamp: now
            });
        }

        return parsed;

    } catch (e) {
        console.error('Fetch Exception:', e.message);
        const cached = apiCache.get(endpoint);
        return cached ? cached.data : null;
    }
}

// SCORE EXTRACTOR
function extractScoreAndOvers(teamObj, matchObj, isHome = true) {
    let runs = '';
    let wickets = '';
    let overs = '';
    let isYetToBat = false;

    const teamsState =
        matchObj.state?.teams ||
        matchObj.inplayData?.state?.teams;

    if (teamsState) {
        const teamKey = isHome ? 'home' : 'away';

        const tState = teamsState[teamKey] ||
            teamsState[isHome ? 'localteam' : 'visitorteam'];

        if (tState) {
            if (
                tState.status === 'yet_to_bat' ||
                tState.isYetToBat ||
                tState.score === 'Yet to bat' ||
                tState.score === null
            ) {
                isYetToBat = true;
            }

            const rawScore = safestr(tState.score);

            if (
                rawScore &&
                rawScore !== 'null' &&
                rawScore !== 'Yet to bat'
            ) {
                if (rawScore.includes('/')) {
                    const parts = rawScore.split('/');
                    runs = parts[0];
                    wickets = parts[1];
                } else {
                    runs = rawScore;
                }
            }

            const rawInfo = safestr(tState.info);

            if (rawInfo && rawInfo !== 'null') {
                overs = rawInfo;
            }
        }
    }

    if (!isYetToBat && runs === '') {
        const teamName = safestr(teamObj?.name || teamObj).toLowerCase();

        const scoreboard =
            matchObj.inplayData?.scoreboard ||
            matchObj.scoreboard ||
            [];

        if (Array.isArray(scoreboard) && scoreboard.length > 0) {
            const matched = scoreboard.find(s => {
                const sName = safestr(
                    s.team?.name || s.name || s.teamName || ''
                ).toLowerCase();

                return sName && teamName &&
                    (sName.includes(teamName) || teamName.includes(sName));
            }) || (
                isHome
                    ? scoreboard[0]
                    : scoreboard[1] || scoreboard[scoreboard.length - 1]
            );

            if (matched) {
                runs = matched.runs ?? matched.score ??
                    matched.r ?? matched.total ?? '';

                wickets = matched.wickets ?? matched.w ?? matched.wkt ?? '';
                overs = matched.overs ?? matched.ov ?? matched.over ?? '';
            }
        }
    }

    let finalScore = '-';

    if (isYetToBat) {
        finalScore = 'Yet to bat';
    } else if (
        runs !== '' &&
        runs !== null &&
        runs !== undefined &&
        runs !== '-'
    ) {
        finalScore = (
            wickets !== '' &&
            wickets !== null &&
            wickets !== undefined &&
            String(wickets) !== ''
        ) ? `${runs}/${wickets}` : String(runs);
    }

    return {
        score: finalScore,
        overs: overs !== null && overs !== undefined ? String(overs) : ''
    };
}

// REAL OVERS & BALLS EXTRACTOR (FROM API RESPONSE ONLY)
function extractRealOversAndBalls(matchObj) {
    const rawList =
        (Array.isArray(matchObj?.oversList) && matchObj.oversList) ||
        (Array.isArray(matchObj?.overs) && matchObj.overs) ||
        (Array.isArray(matchObj?.recentOvers) && matchObj.recentOvers) ||
        (Array.isArray(matchObj?.inplayData?.overs) && matchObj.inplayData.overs) ||
        (Array.isArray(matchObj?.inplayData?.recentOvers) && matchObj.inplayData.recentOvers) ||
        null;

    if (rawList && rawList.length > 0) {
        return rawList.map((item, idx) => {
            const overNumber = Number(
                item?.overNumber ?? item?.over ?? item?.number ?? (idx + 1)
            );
            const ballsRaw = Array.isArray(item?.balls)
                ? item.balls
                : (Array.isArray(item?.deliveries) ? item.deliveries : []);

            const balls = ballsRaw.map(b => {
                if (typeof b === 'string' || typeof b === 'number') {
                    return String(b);
                }
                if (b?.isWicket || b?.wicket) return 'W';
                const val = b?.ball ?? b?.runs ?? b?.symbol ?? b?.value ?? b?.event ?? '';
                return safestr(val);
            }).filter(Boolean);

            const scoreVal = item?.score ?? item?.runs ?? item?.total ?? '';

            return {
                overNumber: Number.isFinite(overNumber) && overNumber > 0 ? overNumber : (idx + 1),
                balls,
                score: scoreVal !== null && scoreVal !== undefined ? String(scoreVal) : ''
            };
        });
    }

    const flatBalls =
        (Array.isArray(matchObj?.balls) && matchObj.balls) ||
        (Array.isArray(matchObj?.inplayData?.balls) && matchObj.inplayData.balls) ||
        null;

    if (flatBalls && flatBalls.length > 0) {
        const grouped = new Map();

        flatBalls.forEach((b, idx) => {
            const ovNumRaw = Number(b?.overNumber ?? b?.over ?? (Math.floor(idx / 6) + 1));
            const ovNum = Number.isFinite(ovNumRaw) && ovNumRaw > 0 ? ovNumRaw : (Math.floor(idx / 6) + 1);
            const current = grouped.get(ovNum) || { overNumber: ovNum, balls: [], score: '' };

            let symbol = '';
            if (typeof b === 'string' || typeof b === 'number') {
                symbol = String(b);
            } else if (b?.isWicket || b?.wicket) {
                symbol = 'W';
            } else {
                symbol = safestr(b?.ball ?? b?.runs ?? b?.symbol ?? b?.value ?? b?.event ?? '');
            }

            if (symbol) {
                current.balls.push(symbol);
            }
            if (b?.score || b?.totalScore) {
                current.score = String(b.score || b.totalScore);
            }

            grouped.set(ovNum, current);
        });

        return Array.from(grouped.values());
    }

    return [];
}

function extractLiveEventStats(matchObj) {
    const inplay = matchObj?.inplayData || {};
    const batsmen = Array.isArray(inplay.batsmen) ? inplay.batsmen : [];
    const bowlers = Array.isArray(inplay.bowlers) ? inplay.bowlers : [];

    let totalRuns = 0;
    let totalBalls = 0;
    let totalFours = 0;
    let totalSixes = 0;
    let totalWickets = 0;

    batsmen.forEach(bat => {
        totalRuns += Number(bat?.runs ?? bat?.r ?? 0) || 0;
        totalBalls += Number(bat?.balls ?? bat?.b ?? 0) || 0;
        totalFours += Number(bat?.fours ?? bat?.['4s'] ?? 0) || 0;
        totalSixes += Number(bat?.sixes ?? bat?.['6s'] ?? 0) || 0;
    });

    bowlers.forEach(bowl => {
        totalWickets += Number(bowl?.wickets ?? bowl?.w ?? 0) || 0;
        const bBalls = Number(bowl?.balls ?? 0) || 0;
        if (bBalls > totalBalls) totalBalls = bBalls;
    });

    const report = safestr(
        inplay?.state?.report ||
        matchObj?.state?.report ||
        matchObj?.note ||
        matchObj?.result ||
        ''
    );

    return {
        totalRuns,
        totalBalls,
        totalFours,
        totalSixes,
        totalWickets,
        report
    };
}

function extractMatchNoteAndResult(matchObj, teamAName, teamBName) {
    const shortA = getShortTeamName(teamAName);
    const shortB = getShortTeamName(teamBName);

    const rawNote = safestr(
        matchObj?.inplayData?.state?.report ||
        matchObj?.state?.report ||
        matchObj?.state?.note ||
        matchObj?.note ||
        matchObj?.result ||
        matchObj?.statusText ||
        ''
    ).trim();

    let matchNote = rawNote;
    let resultText = '';

    const upperNote = rawNote.toUpperCase();
    if (
        upperNote.includes('WON BY') ||
        upperNote.includes('TIED') ||
        upperNote.includes('NO RESULT') ||
        upperNote.includes('ABANDONED')
    ) {
        resultText = rawNote
            .replace(new RegExp(teamAName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), shortA)
            .replace(new RegExp(teamBName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), shortB)
            .toUpperCase();
    }

    return {
        shortA,
        shortB,
        matchNote,
        resultText
    };
}

// MATCH STATE TEXT
function getMatchStateText(match) {
    const status = getMatchStatus(match);
    const stateObj = match.state || match.status || {};

    if (status === 'UPCOMING') return 'UPCOMING';

    if (status === 'FINISHED') {
        return safestr(
            match?.inplayData?.state?.report ||
            stateObj.report ||
            stateObj.description ||
            stateObj.name ||
            stateObj,
            'FINISHED'
        ).toUpperCase();
    }

    if (status === 'BREAK') {
        return safestr(
            stateObj.description || stateObj.name || stateObj,
            'BREAK'
        ).toUpperCase();
    }

    const rawLiveText = safestr(
        match?.inplayData?.state?.report ||
        match.lastBall ||
        match.currentBall ||
        match.ballEvent ||
        match.statusText ||
        match.matchState ||
        (typeof stateObj === 'object' ? (stateObj.description || stateObj.statusText || stateObj.note || '') : '')
    ).trim();

    if (
        rawLiveText &&
        rawLiveText.toLowerCase() !== 'live' &&
        rawLiveText.toLowerCase() !== 'in play' &&
        rawLiveText.toLowerCase() !== 'inprogress' &&
        rawLiveText.toLowerCase() !== 'in progress'
    ) {
        return rawLiveText.toUpperCase();
    }

    return 'BOWLER RUNNING IN';
}

// NORMALIZE MATCH
function normalizeMatch(m) {
    if (!m) return {};

    const teamAObj = m.homeTeam || m.localteam || m.teamA ||
        m.team_a || { name: m.teamA || 'Team A' };

    const teamBObj = m.awayTeam || m.visitorteam || m.teamB ||
        m.team_b || { name: m.teamB || 'Team B' };

    const teamAName = safestr(
        teamAObj.name || teamAObj.longName || teamAObj
    );

    const teamBName = safestr(
        teamBObj.name || teamBObj.longName || teamBObj
    );

    const logoA = safestr(teamAObj.logo || teamAObj.image || '');
    const logoB = safestr(teamBObj.logo || teamBObj.image || '');
    const flagA = safestr(teamAObj.flag || teamAObj.countryFlag || '');
    const flagB = safestr(teamBObj.flag || teamBObj.countryFlag || '');

    const resA = extractScoreAndOvers(teamAObj, m, true);
    const resB = extractScoreAndOvers(teamBObj, m, false);

    const matchStatus = getMatchStatus(m);
    const startTimestamp = getStartTimestamp(m);

    // Countdown only for scheduled/upcoming matches
    const countdownTimestamp =
        matchStatus === 'UPCOMING' ? startTimestamp : null;

    const startTimeValue =
        m.startTime ||
        m.starting_at ||
        m.startingAt ||
        m.dateTime ||
        m.time ||
        '';

    const oversList = extractRealOversAndBalls(m);
    const liveEvent = extractLiveEventStats(m);
    const noteInfo = extractMatchNoteAndResult(m, teamAName, teamBName);

    return {
        id: esc(m.id || m.matchId || m.match_id),

        tournament: esc(
            m.league?.name ||
            m.tournament ||
            m.series ||
            'Live Cricket'
        ),

        teamA: esc(teamAName),
        teamB: esc(teamBName),

        shortA: esc(noteInfo.shortA),
        shortB: esc(noteInfo.shortB),

        logoA: esc(logoA),
        logoB: esc(logoB),

        flagA: esc(flagA),
        flagB: esc(flagB),

        scoreA: esc(resA.score),
        oversA: esc(resA.overs),

        scoreB: esc(resB.score),
        oversB: esc(resB.overs),

        oversList,
        liveEvent,
        matchNote: esc(noteInfo.matchNote),
        resultText: esc(noteInfo.resultText),

        status: matchStatus,
        isLive: matchStatus === 'LIVE',

        matchStateText: esc(getMatchStateText(m)),

        dateTime: esc(
            startTimeValue ||
            (matchStatus === 'LIVE' ? 'LIVE' : '')
        ),

        countdownTimestamp,

        venue: esc(m.venue?.name || m.venue || 'Stadium'),

        odds: {
            teamA_back: '1.98',
            teamA_lay: '2.00',
            draw_back: '-',
            draw_lay: '-',
            teamB_back: '1.98',
            teamB_lay: '2.00'
        }
    };
}

function sendWithAutoRefresh(res, htmlContent) {
    res.send(htmlContent);
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

// DASHBOARD
app.get('/dashboard', async (req, res) => {
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const targetUser = req.query.user || 'Client';

    const user = {
        username: esc(targetUser),
        points: 50000,
        exposure: 1200
    };

    let matches = [];

    try {
        const today = new Date().toISOString().slice(0, 10);
        const json = await hl(`/matches?date=${today}`);

        const list = Array.isArray(json)
            ? json
            : (
                Array.isArray(json?.data)
                    ? json.data
                    : (
                        Array.isArray(json?.matches)
                            ? json.matches
                            : []
                    )
            );

        matches = list
            .filter(m => m && (m.id || m.matchId || m.match_id))
            .map(normalizeMatch);

    } catch (err) {
        console.error('Dashboard Error:', err.message);
    }

    sendWithAutoRefresh(res, renderDashboardPage(user, matches));
});

// SHARED MATCH DATA LOADER
async function loadMatchData(matchId) {
    const json = await hl(
        `/matches/${encodeURIComponent(matchId)}`
    );

    const found = getRawMatch(json);

    if (!found || !(found.id || found.matchId || found.match_id)) {
        return null;
    }

    console.log('RAW MATCH KEYS:', Object.keys(found || {}));
    console.log(
        'RAW BALL/OVER FIELDS:',
        JSON.stringify({
            state: found?.state,
            lastBall: found?.lastBall,
            currentBall: found?.currentBall,
            balls: found?.balls,
            overs: found?.overs,
            inplayData: found?.inplayData
        }).slice(0, 1200)
    );

    return normalizeMatch(found);
}

// LIVE MATCH DATA API
app.get('/api/match/:id', async (req, res) => {
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

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
    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

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
        const loadedMatch = await loadMatchData(matchId);

        if (loadedMatch) {
            matchData = loadedMatch;
        }

    } catch (err) {
        console.error('Match Detail Error:', err.message);
    }

    sendWithAutoRefresh(
        res,
        renderMatchDetailPage(user, matchData)
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
