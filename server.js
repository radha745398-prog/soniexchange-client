// server.js - Ultimate Bulletproof Version
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
        console.log(`[API REQUEST] Fetching: ${BASE_URL}${endpoint}`);
        const r = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'x-rapidapi-key': HIGHLIGHTLY_KEY }
        });
        const text = await r.text();
        if (!r.ok) {
            console.error('API Error Response:', text.slice(0, 300));
            return null;
        }
        const json = JSON.parse(text);
        return json;
    } catch (e) {
        console.error('Fetch Exception:', e.message);
        return null;
    }
}

// Ultimate Deep Extractor to scan any object or innings array for score & overs
function extractScoreAndOvers(teamObj, matchObj, isHome = true) {
    let runs = '';
    let wickets = '';
    let overs = '';

    // 1. Check direct team object properties
    if (teamObj && typeof teamObj === 'object') {
        runs = teamObj.runs ?? teamObj.score ?? teamObj.r ?? teamObj.total ?? teamObj.runs_scored ?? '';
        wickets = teamObj.wickets ?? teamObj.w ?? teamObj.wkt ?? '';
        overs = teamObj.overs ?? teamObj.ov ?? teamObj.over ?? '';
    }

    // 2. Check matchObj direct properties (e.g. scoreA, score_a, oversA, etc.)
    if (runs === '') {
        const prefix = isHome ? 'a' : 'b';
        runs = matchObj[`score${isHome ? 'A' : 'B'}`] ?? matchObj[`score_${prefix}`] ?? matchObj[`runs_${prefix}`] ?? '';
        overs = matchObj[`overs${isHome ? 'A' : 'B'}`] ?? matchObj[`overs_${prefix}`] ?? matchObj[`ovr_${prefix}`] ?? '';
    }

    // 3. Check innings array deeply
    const inningsList = matchObj.innings || matchObj.scorecard || matchObj.runs_array || matchObj.data?.innings || [];
    if (Array.isArray(inningsList) && inningsList.length > 0) {
        const teamName = safestr(teamObj?.name || (isHome ? matchObj.teamA : matchObj.teamB)).toLowerCase();
        const matchedInnings = inningsList.filter(inn => {
            const tName = safestr(inn.team?.name || inn.team || inn.battingTeam || '').toLowerCase();
            return tName && teamName && (tName.includes(teamName) || teamName.includes(tName));
        });

        const targetInn = matchedInnings.length > 0 ? matchedInnings[matchedInnings.length - 1] : (isHome ? inningsList[0] : inningsList[1] || inningsList[inningsList.length - 1]);
        
        if (targetInn) {
            const iRuns = targetInn.runs ?? targetInn.score ?? targetInn.total ?? targetInn.r ?? '';
            const iWickets = targetInn.wickets ?? targetInn.w ?? targetInn.wkt ?? '';
            const iOvers = targetInn.overs ?? targetInn.ov ?? targetInn.over ?? '';
            if (iRuns !== '') {
                runs = iRuns;
                wickets = iWickets;
                overs = iOvers;
            }
        }
    }

    let finalScore = '-';
    if (runs !== '' && runs !== null && runs !== undefined && runs !== '-') {
        finalScore = (wickets !== '' && wickets !== null && wickets !== undefined) ? `${runs}/${wickets}` : String(runs);
    }
    let finalOvers = (overs !== '' && overs !== null && overs !== undefined) ? String(overs) : '';

    return { score: finalScore, overs: finalOvers };
}

function normalizeMatch(m) {
    if (!m) return {};

    const teamAObj = m.homeTeam || m.localteam || m.teamA || m.team_a || { name: m.teamA || 'Team A', logo: m.logoA };
    const teamBObj = m.awayTeam || m.visitorteam || m.teamB || m.team_b || { name: m.teamB || 'Team B', logo: m.logoB };

    const teamAName = safestr(teamAObj.name || teamAObj.longName || teamAObj);
    const teamBName = safestr(teamBObj.name || teamBObj.longName || teamBObj);
    const logoA = safestr(teamAObj.logo || teamAObj.image || '');
    const logoB = safestr(teamBObj.logo || teamBObj.image || '');

    const resA = extractScoreAndOvers(teamAObj, m, true);
    const resB = extractScoreAndOvers(teamBObj, m, false);

    const rawStatus = safestr(m.status?.shortName || m.status?.name || m.status || m.state || '').toUpperCase();
    let status = 'LIVE';
    if (/FIN|COMP|RESULT|WON|ABANDON|CANCEL/.test(rawStatus)) status = 'FINISHED';
    else if (/SCHED|UPCOMING|NOT|YET/.test(rawStatus) && resA.score === '-' && resB.score === '-') status = 'SCHEDULED';

    const stateText = safestr(m.status?.longName || m.status?.description || m.status?.name || m.status || m.state || rawStatus || 'Live');

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
        status: status,
        isLive: status === 'LIVE' || resA.score !== '-' || resB.score !== '-',
        matchStateText: esc(stateText),
        dateTime: esc(m.dateTime || m.time || m.starting_at || 'LIVE'),
        venue: esc(m.venue?.name || m.venue || 'Stadium'),
        odds: { 
            teamA_back: '1.98', teamA_lay: '2.00', 
            draw_back: '-', draw_lay: '-', 
            teamB_back: '1.98', teamB_lay: '2.00' 
        }
    };
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/dashboard', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    let matches = [];
    try {
        const today = new Date().toISOString().slice(0, 10);
        const json = await hl(`/matches?date=${today}`);
        const list = Array.isArray(json) ? json : (json?.data || json?.matches || []);
        matches = list.filter(m => m && (m.id || m.match_id)).map(normalizeMatch);
    } catch (err) {
        console.error("Dashboard Error:", err.message);
    }
    res.send(renderDashboardPage(user, matches));
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
        let found = null;
        if (json) {
            if (Array.isArray(json)) found = json[0];
            else if (json.data && Array.isArray(json.data)) found = json.data[0];
            else if (json.data) found = json.data;
            else found = json;
        }
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
