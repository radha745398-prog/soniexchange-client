// server.js - Final Accurate Score Extractor with No-Cache & Live JSON API for SoniExchange
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Prevent Caching globally across all responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

const HIGHLIGHTLY_KEY = '4cfda7fc-7c4d-49fb-b04c-8b0acdbe3853';
const BASE_URL = 'https://cricket.highlightly.net';

const safestr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
        return val.name || val.longName || val.description || val.shortName || val.text || val.runs || val.score || fallback;
    }
    return String(val);
};

const esc = (s) => String(safestr(s)).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

async function hl(endpoint) {
    try {
        // Cache-busting timestamp to completely bypass server-side/network caching
        const separator = endpoint.includes('?') ? '&' : '?';
        const freshUrl = `${BASE_URL}${endpoint}${separator}_t=${Date.now()}`;

        console.log(`[API REQUEST] Fetching: ${freshUrl}`);
        const r = await fetch(freshUrl, {
            headers: { 
                'x-rapidapi-key': HIGHLIGHTLY_KEY,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        const text = await r.text();
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

// Exact Parser based on Highlightly API Logs (match.state.teams)
function extractScoreAndOvers(teamObj, matchObj, isHome = true) {
    let runs = '';
    let wickets = '';
    let overs = '';

    // 1. Direct check from match.state.teams (Confirmed from API logs)
    const teamsState = matchObj.state?.teams || matchObj.inplayData?.state?.teams;
    if (teamsState) {
        const teamKey = isHome ? 'home' : 'away';
        const tState = teamsState[teamKey] || teamsState[isHome ? 'localteam' : 'visitorteam'];
        if (tState) {
            const rawScore = safestr(tState.score); // e.g. "68/3"
            if (rawScore && rawScore !== 'null' && rawScore !== '') {
                if (rawScore.includes('/')) {
                    const parts = rawScore.split('/');
                    runs = parts[0];
                    wickets = parts[1];
                } else {
                    runs = rawScore;
                }
            }
            const rawInfo = safestr(tState.info); // e.g. "14.0/50 ov"
            if (rawInfo && rawInfo !== 'null' && rawInfo !== '') {
                overs = rawInfo;
            }
        }
    }

    // 2. Fallback to inplayData.scoreboard
    if (runs === '') {
        const teamName = safestr(teamObj?.name || teamObj).toLowerCase();
        const scoreboard = matchObj.inplayData?.scoreboard || matchObj.scoreboard || [];
        if (Array.isArray(scoreboard) && scoreboard.length > 0) {
            const matched = scoreboard.find(s => {
                const sName = safestr(s.team?.name || s.name || s.teamName || '').toLowerCase();
                return sName && teamName && (sName.includes(teamName) || teamName.includes(sName));
            }) || (isHome ? scoreboard[0] : scoreboard[1] || scoreboard[scoreboard.length - 1]);

            if (matched) {
                runs = matched.runs ?? matched.score ?? matched.r ?? matched.total ?? '';
                wickets = matched.wickets ?? matched.w ?? matched.wkt ?? '';
                overs = matched.overs ?? matched.ov ?? matched.over ?? '';
            }
        }
    }

    // 3. Fallback to direct team object properties
    if (runs === '' && teamObj && typeof teamObj === 'object') {
        runs = teamObj.runs ?? teamObj.score ?? teamObj.r ?? teamObj.total ?? '';
        wickets = teamObj.wickets ?? teamObj.w ?? '';
        overs = teamObj.overs ?? teamObj.ov ?? '';
    }

    let finalScore = '-';
    if (runs !== '' && runs !== null && runs !== undefined && runs !== '-') {
        finalScore = (wickets !== '' && wickets !== null && wickets !== undefined && String(wickets) !== '') ? `${runs}/${wickets}` : String(runs);
    }
    let finalOvers = (overs !== '' && overs !== null && overs !== undefined) ? String(overs) : '';

    return { score: finalScore, overs: finalOvers };
}

function normalizeMatch(m) {
    if (!m) return {};

    const teamAObj = m.homeTeam || m.localteam || m.teamA || m.team_a || { name: m.teamA || 'Team A' };
    const teamBObj = m.awayTeam || m.visitorteam || m.teamB || m.team_b || { name: m.teamB || 'Team B' };

    const teamAName = safestr(teamAObj.name || teamAObj.longName || teamAObj);
    const teamBName = safestr(teamBObj.name || teamBObj.longName || teamBObj);
    const logoA = safestr(teamAObj.logo || teamAObj.image || '');
    const logoB = safestr(teamBObj.logo || teamBObj.image || '');

    const resA = extractScoreAndOvers(teamAObj, m, true);
    const resB = extractScoreAndOvers(teamBObj, m, false);

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
        status: 'LIVE',
        isLive: true,
        matchStateText: esc(m.status?.name || m.status?.longName || 'Live'),
        dateTime: esc(m.dateTime || m.time || 'LIVE'),
        venue: esc(m.venue?.name || 'Stadium'),
        odds: { teamA_back: '1.98', teamA_lay: '2.00', draw_back: '-', draw_lay: '-', teamB_back: '1.98', teamB_lay: '2.00' }
    };
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/dashboard', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    let matches = [];
    try {
        // Fetching directly from /matches without restrictive date query parameters to prevent 400 errors
        const json = await hl(`/matches`);
        const list = Array.isArray(json) ? json : (json?.data || json?.matches || []);
        matches = list.filter(m => m && (m.id || m.match_id)).map(normalizeMatch);
    } catch (err) {
        console.error("Dashboard Error:", err.message);
    }
    res.send(renderDashboardPage(user, matches));
});

// Lightweight JSON API endpoint for real-time frontend polling (No page reload needed)
app.get('/api/match/:id', async (req, res) => {
    const matchId = req.params.id;
    try {
        const json = await hl(`/matches/${matchId}`);
        let found = json?.data || json?.[0] || json;
        if (found && (found.id || found.matchId || found.match_id)) {
            const normalized = normalizeMatch(found);
            return res.json({ success: true, match: normalized });
        }
    } catch (err) {
        console.error("API Match Error:", err.message);
    }
    res.status(404).json({ success: false, message: 'Match not found' });
});

app.get('/match/:id', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    const matchId = req.params.id;
    let matchData = {
        id: esc(matchId), tournament: 'Live Match', teamA: 'Team A', teamB: 'Team B',
        logoA: '', logoB: '', scoreA: '-', oversA: '', scoreB: '-', oversB: '',
        status: 'LIVE', isLive: true, matchStateText: 'Live', venue: 'Stadium', dateTime: 'LIVE'
    };

    try {
        const json = await hl(`/matches/${matchId}`);
        let found = json?.data || json?.[0] || json;
        if (found && (found.id || found.matchId || found.match_id)) {
            matchData = normalizeMatch(found);
        }
    } catch (err) {
        console.error("Match Detail Error:", err.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
