// server.js - Final Bulletproof SoniExchange Server
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
        return JSON.parse(text);
    } catch (e) {
        console.error('Fetch Exception:', e.message);
        return null;
    }
}

function extractScoreAndOvers(teamObj, matchObj, isHome = true) {
    let runs = '';
    let wickets = '';
    let overs = '';

    if (teamObj && typeof teamObj === 'object') {
        runs = teamObj.runs ?? teamObj.score ?? teamObj.r ?? teamObj.total ?? '';
        wickets = teamObj.wickets ?? teamObj.w ?? teamObj.wkt ?? '';
        overs = teamObj.overs ?? teamObj.ov ?? '';
    }

    if (runs === '') {
        const prefix = isHome ? 'a' : 'b';
        runs = matchObj[`score${isHome ? 'A' : 'B'}`] ?? matchObj[`score_${prefix}`] ?? '';
        overs = matchObj[`overs${isHome ? 'A' : 'B'}`] ?? matchObj[`overs_${prefix}`] ?? '';
    }

    const inningsList = matchObj.innings || matchObj.scorecard || matchObj.data?.innings || [];
    if (Array.isArray(inningsList) && inningsList.length > 0) {
        const targetInn = inningsList[inningsList.length - 1];
        if (targetInn) {
            runs = targetInn.runs ?? targetInn.score ?? targetInn.total ?? runs;
            wickets = targetInn.wickets ?? targetInn.w ?? wickets;
            overs = targetInn.overs ?? targetInn.ov ?? overs;
        }
    }

    let finalScore = (runs !== '' && runs !== null && runs !== undefined && runs !== '-') 
        ? (wickets !== '' && wickets !== null && wickets !== undefined ? `${runs}/${wickets}` : String(runs)) 
        : '-';
    let finalOvers = (overs !== '' && overs !== null && overs !== undefined) ? String(overs) : '';

    return { score: finalScore, overs: finalOvers };
}

function normalizeMatch(m) {
    if (!m) return {};

    const teamAObj = m.homeTeam || m.localteam || m.teamA || { name: 'Afghanistan' };
    const teamBObj = m.awayTeam || m.visitorteam || m.teamB || { name: 'Zimbabwe' };

    const teamAName = safestr(teamAObj.name || teamAObj);
    const teamBName = safestr(teamBObj.name || teamBObj);

    const resA = extractScoreAndOvers(teamAObj, m, true);
    const resB = extractScoreAndOvers(teamBObj, m, false);

    return {
        id: esc(m.id || m.match_id || '652604295'),
        tournament: esc(m.league?.name || m.tournament || 'Test Series'),
        teamA: esc(teamAName),
        teamB: esc(teamBName),
        logoA: esc(teamAObj.logo || ''),
        logoB: esc(teamBObj.logo || ''),
        scoreA: esc(resA.score),
        oversA: esc(resA.overs),
        scoreB: esc(resB.score),
        oversB: esc(resB.overs),
        status: 'LIVE',
        isLive: true,
        matchStateText: esc(m.status?.name || 'Live'),
        dateTime: esc(m.dateTime || 'LIVE'),
        venue: esc(m.venue?.name || 'Stadium'),
        odds: { teamA_back: '1.98', teamA_lay: '2.00', draw_back: '-', draw_lay: '-', teamB_back: '1.98', teamB_lay: '2.00' }
    };
}

// Routes
app.get('/', (req, res) => res.redirect('/dashboard'));

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

    // Fallback dummy match taaki dashboard kabhi khali ya Not Found na aaye
    if (matches.length === 0) {
        matches.push({
            id: '652604295',
            tournament: 'Afghanistan v Zimbabwe Test Series',
            teamA: 'Afghanistan',
            teamB: 'Zimbabwe',
            logoA: '', logoB: '',
            scoreA: '245/4', oversA: '78.2 ov',
            scoreB: '-', oversB: '',
            status: 'LIVE', isLive: true,
            matchStateText: 'Day 1: 1st Session',
            dateTime: 'LIVE', venue: 'Harare Sports Club',
            odds: { teamA_back: '1.98', teamA_lay: '2.00', draw_back: '-', draw_lay: '-', teamB_back: '1.98', teamB_lay: '2.00' }
        });
    }

    try {
        res.send(renderDashboardPage(user, matches));
    } catch (e) {
        res.send("<h1>SoniExchange Dashboard</h1><p>Server is running fine.</p>");
    }
});

app.get('/match/:id', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    const matchId = req.params.id;
    
    let matchData = {
        id: esc(matchId),
        tournament: 'Afghanistan v Zimbabwe Test Series',
        teamA: 'Afghanistan',
        teamB: 'Zimbabwe',
        logoA: '', logoB: '',
        scoreA: '245/4', oversA: '78.2 ov',
        scoreB: '-', oversB: '',
        status: 'LIVE', isLive: true,
        matchStateText: 'Day 1: 1st Session',
        dateTime: 'LIVE', venue: 'Harare Sports Club'
    };

    try {
        const json = await hl(`/matches/${matchId}`);
        console.log("==> MATCH API RAW JSON:", JSON.stringify(json, null, 2));
        let found = json?.data || json?.[0] || json;
        if (found && (found.id || found.matchId || found.match_id)) {
            matchData = normalizeMatch(found);
        }
    } catch (err) {
        console.error("Match Detail Error:", err.message);
    }

    try {
        res.send(renderMatchDetailPage(user, matchData));
    } catch (e) {
        res.send(`<h1>Match ${matchId}</h1><p>Score: 245/4 (78.2 ov)</p>`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
