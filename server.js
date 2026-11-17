
// server.js - Countdown Fix + Existing Features Preserved
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HIGHLIGHTLY API KEY
const HIGHLIGHTLY_KEY = '9dbd25b8-570b-458e-be8e-65128cc3edb2';

const BASE_URL = 'https://cricket.highlightly.net';
const MASTER_ADMIN_KEY = process.env.MASTER_ADMIN_KEY || '';

const safestr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
        return val.name || val.longName || val.description ||
            val.shortName || val.text || val.runs || val.score || fallback;
    }
    return String(val);
};

const esc = (s) => String(safestr(s)).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function getRawMatch(json) {
    if (Array.isArray(json)) return json[0] || null;
    if (Array.isArray(json?.data)) return json.data[0] || null;
    if (json?.data && typeof json.data === 'object') return json.data;
    if (Array.isArray(json?.matches)) return json.matches[0] || null;
    return json || null;
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
        if (!value) continue;
        const timestamp = new Date(value).getTime();
        if (Number.isFinite(timestamp)) return timestamp;
    }

    return null;
}

function getStateName(match) {
    const state = match?.state || match?.status || {};
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
    ) return 'FINISHED';

    if (
        stateName.includes('stumps') ||
        stateName.includes('lunch') ||
        stateName.includes('tea') ||
        stateName.includes('drinks') ||
        stateName.includes('break') ||
        stateName.includes('innings break')
    ) return 'BREAK';

    if (
        stateName.includes('scheduled') ||
        stateName.includes('not started') ||
        stateName.includes('upcoming') ||
        stateName.includes('yet to begin')
    ) return 'UPCOMING';

    if (match?.isLive === true) return 'LIVE';

    if (
        stateName.includes('live') ||
        stateName.includes('in progress') ||
        stateName.includes('inplay') ||
        stateName.includes('in play')
    ) return 'LIVE';

    return match?.isLive ? 'LIVE' : 'UPCOMING';
}

async function hl(endpoint) {
    try {
        if (!HIGHLIGHTLY_KEY) {
            console.error('HIGHLIGHTLY_KEY is missing.');
            return null;
        }

        console.log(`[API REQUEST] Fetching: ${BASE_URL}${endpoint}`);

        const r = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'x-rapidapi-key': HIGHLIGHTLY_KEY }
        });

        const text = await r.text();

        console.log(`[API RESPONSE] ${endpoint} - HTTP ${r.status}`);

        if (!r.ok) {
            console.error('API Error Response:', text.slice(0, 300));
            return null;
        }

        return JSON.parse(text);
    } catch (e) {
        console.error('Fetch Exception:', e.message);
        return null;
    }
}

// Robust Score Extractor with "Yet to Bat" Support
function extractScoreAndOvers(teamObj, matchObj, isHome = true) {
    let runs = '';
    let wickets = '';
    let overs = '';
    let isYetToBat = false;

    const teamsState = matchObj.state?.teams || matchObj.inplayData?.state?.teams;

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
                rawScore !== '' &&
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
            if (rawInfo && rawInfo !== 'null' && rawInfo !== '') {
                overs = rawInfo;
            }
        }
    }

    if (!isYetToBat && runs === '') {
        const teamName = safestr(teamObj?.name || teamObj).toLowerCase();
        const scoreboard = matchObj.inplayData?.scoreboard ||
            matchObj.scoreboard || [];

        if (Array.isArray(scoreboard) && scoreboard.length > 0) {
            const matched = scoreboard.find(s => {
                const sName = safestr(
                    s.team?.name || s.name || s.teamName || ''
                ).toLowerCase();

                return sName && teamName &&
                    (sName.includes(teamName) || teamName.includes(sName));
            }) || (isHome ? scoreboard[0] :
                scoreboard[1] || scoreboard[scoreboard.length - 1]);

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

    const finalOvers = (
        overs !== '' && overs !== null && overs !== undefined
    ) ? String(overs) : '';

    return { score: finalScore, overs: finalOvers };
}

// Dynamic Match State Text Parser
function getMatchStateText(m) {
    const status = getMatchStatus(m);
    const stateObj = m.state || m.status || {};

    if (status === 'UPCOMING') return 'UPCOMING';

    if (status === 'FINISHED') {
        return safestr(stateObj.description || stateObj.name, 'FINISHED').toUpperCase();
    }

    if (status === 'BREAK') {
        return safestr(stateObj.description || stateObj.name, 'BREAK').toUpperCase();
    }

    return 'BOWLER RUNNING IN';
}

function normalizeMatch(m) {
    if (!m) return {};

    const teamAObj = m.homeTeam || m.localteam || m.teamA ||
        m.team_a || { name: m.teamA || 'Team A' };

    const teamBObj = m.awayTeam || m.visitorteam || m.teamB ||
        m.team_b || { name: m.teamB || 'Team B' };

    const teamAName = safestr(teamAObj.name || teamAObj.longName || teamAObj);
    const teamBName = safestr(teamBObj.name || teamBObj.longName || teamBObj);

    const logoA = safestr(teamAObj.logo || teamAObj.image || '');
    const logoB = safestr(teamBObj.logo || teamBObj.image || '');

    const resA = extractScoreAndOvers(teamAObj, m, true);
    const resB = extractScoreAndOvers(teamBObj, m, false);

    const matchStatus = getMatchStatus(m);
    const startTimestamp = getStartTimestamp(m);

    const countdownTimestamp = matchStatus === 'UPCOMING'
        ? startTimestamp
        : (matchStatus === 'BREAK' && m.resumes_at
            ? new Date(m.resumes_at).getTime()
            : null);

    const startTimeValue = m.startTime || m.starting_at ||
        m.startingAt || m.dateTime || m.time || '';

    return {
        id: esc(m.id || m.match_id),
        tournament: esc(m.league?.name || m.tournament || m.series || 'Live Cricket'),
        teamA: esc(teamAName),
        teamB: esc(teamBName),
        logoA: esc(logoA),
        logoB: esc(logoB),
        scoreA: esc(resA.score),
        oversA: esc(resA.overs),
        scoreB: esc(resB.score),
        oversB: esc(resB.overs),

        status: matchStatus,
        isLive: matchStatus === 'LIVE',
        matchStateText: esc(getMatchStateText(m)),

        dateTime: esc(startTimeValue || (matchStatus === 'LIVE' ? 'LIVE' : '')),
        countdownTimestamp: countdownTimestamp,

        venue: esc(m.venue?.name || 'Stadium'),

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
    const autoRefreshScript = `
    <script>
        setInterval(() => {
            fetch(window.location.href)
                .then(response => response.text())
                .then(html => {
                    console.log("[AUTO-REFRESH] Background check completed successfully.");
                })
                .catch(err => console.error("Auto-refresh error:", err));
        }, 15000);
    </script>
    `;

    if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', autoRefreshScript + '</body>');
    } else {
        htmlContent += autoRefreshScript;
    }

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
    const adminToken = req.query.admin_token;
    const targetUser = req.query.user || 'Client';

    if (adminToken !== MASTER_ADMIN_KEY && !targetUser) {
        return res.redirect('/');
    }

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
            : (json?.data || json?.matches || []);

        matches = list
            .filter(m => m && (m.id || m.match_id))
            .map(normalizeMatch);

    } catch (err) {
        console.error('Dashboard Error:', err.message);
    }

    sendWithAutoRefresh(res, renderDashboardPage(user, matches));
});

// Shared match data loader
async function loadMatchData(matchId) {
    const json = await hl(`/matches/${encodeURIComponent(matchId)}`);
    const found = getRawMatch(json);

    if (!found || !(found.id || found.matchId || found.match_id)) {
        return null;
    }

    return normalizeMatch(found);
}

// LIVE MATCH DATA API - Required by matchHeader.js polling
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
        tournament: 'Live Match',
        teamA: 'Team A',
        teamB: 'Team B',
        logoA: '',
        logoB: '',
        scoreA: '-',
        oversA: '-',
        scoreB: '-',
        oversB: '-',
        status: 'LIVE',
        isLive: true,
        matchStateText: 'Live',
        venue: 'Stadium',
        dateTime: 'LIVE',
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

    sendWithAutoRefresh(res, renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
