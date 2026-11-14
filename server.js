// server.js
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

// Bulletproof string extractor
const safestr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
        return val.name || val.longName || val.description || val.shortName || val.text || val.runs || val.score || fallback;
    }
    return String(val);
};

// HTML escape utility
const esc = (s) => String(safestr(s)).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Safe API Fetcher
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
        console.log(`[API SUCCESS] Data received for ${endpoint}`);
        return json;
    } catch (e) {
        console.error('Fetch Exception:', e.message);
        return null;
    }
}

// Status classifier
function getMatchStatus(m) {
    const raw = safestr(m.status?.shortName || m.status?.name || m.status?.description || m.status || m.state || '').toUpperCase();
    if (/FIN|COMP|RESULT|WON|ABANDON|CANCEL/.test(raw)) return 'FINISHED';
    if (/LIVE|PROG|INNINGS|ONGOING|BREAK|TOSS|STUMP|TEA|LUNCH/.test(raw)) return 'LIVE';
    if (/SCHED|UPCOMING|NOT|YET/.test(raw)) return 'SCHEDULED';
    return 'LIVE';
}

// Final Smart Normalizer with Innings Scanner
function normalizeMatch(m) {
    const status = getMatchStatus(m);
    const stateText = safestr(m.status?.longName || m.status?.description || m.status?.name || m.status || m.state || 'In Progress');

    // Extract score from innings array if available
    const extractFromInnings = (teamId, teamName) => {
        if (!m.innings || !Array.isArray(m.innings)) return null;
        const teamInnings = m.innings.filter(inn => 
            inn.teamId === teamId || inn.team === teamName || inn.battingTeam === teamName
        );
        if (teamInnings.length === 0) return null;
        
        const latest = teamInnings[teamInnings.length - 1];
        const r = latest.runs ?? latest.score ?? latest.r ?? '';
        const w = latest.wickets ?? latest.w ?? '';
        const o = latest.overs ?? latest.ov ?? '';
        
        if (r !== '') {
            return {
                score: w !== '' ? `${r}/${w}` : String(r),
                overs: o !== '' ? String(o) : '-'
            };
        }
        return null;
    };

    const getTeamScoreAndOvers = (teamObj, teamName) => {
        if (!teamObj) return { score: '-', overs: '-' };
        
        const fromInn = extractFromInnings(teamObj.id, teamObj.name || teamName);
        if (fromInn) return fromInn;

        let r = teamObj.runs ?? teamObj.score?.runs ?? teamObj.score ?? teamObj.r;
        let w = teamObj.wickets ?? teamObj.score?.wickets ?? teamObj.w;
        let o = teamObj.overs ?? teamObj.score?.overs ?? teamObj.ov;

        if (r !== undefined && r !== null && r !== '') {
            const scoreStr = w !== undefined && w !== null && w !== '' ? `${r}/${w}` : String(r);
            return { score: scoreStr, overs: o !== undefined && o !== null ? String(o) : '-' };
        }

        return { score: '-', overs: '-' };
    };

    const homeRes = getTeamScoreAndOvers(m.homeTeam, 'Home');
    const awayRes = getTeamScoreAndOvers(m.awayTeam, 'Away');

    const scoreA = homeRes.score !== '-' ? homeRes.score : (m.scoreA || '-');
    const oversA = homeRes.overs !== '-' ? homeRes.overs : (m.oversA || '-');

    const scoreB = awayRes.score !== '-' ? awayRes.score : (m.scoreB || '-');
    const oversB = awayRes.overs !== '-' ? awayRes.overs : (m.oversB || '-');

    return {
        id: esc(m.id),
        tournament: esc(m.league?.name || m.tournament || m.series || 'Live Cricket'),
        teamA: esc(m.homeTeam?.name || m.home_team || m.teamA || 'Team A'),
        teamB: esc(m.awayTeam?.name || m.away_team || m.teamB || 'Team B'),
        logoA: esc(m.homeTeam?.logo || m.home_logo || ''),
        logoB: esc(m.awayTeam?.logo || m.away_logo || ''),
        scoreA: esc(scoreA),
        oversA: esc(oversA),
        scoreB: esc(scoreB),
        oversB: esc(oversB),
        status: status,
        isLive: status === 'LIVE' || scoreA !== '-' || scoreB !== '-',
        matchStateText: esc(stateText),
        dateTime: esc(m.dateTime || m.time || 'LIVE'),
        venue: esc(m.venue?.name || m.venue || 'Stadium'),
        odds: { 
            teamA_back: '1.98', teamA_lay: '2.00', 
            draw_back: '-', draw_lay: '-', 
            teamB_back: '1.98', teamB_lay: '2.00' 
        }
    };
}

// 1. Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Switch Route
app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    res.redirect(`/dashboard?user=${encodeURIComponent(targetUser)}`);
});

// 3. Dashboard Route
app.get('/dashboard', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    
    let matches = [];
    try {
        const today = new Date().toISOString().slice(0, 10);
        const json = await hl(`/matches?date=${today}`);
        const list = Array.isArray(json) ? json : (json?.data || json?.matches || []);
        
        matches = list.filter(m => m && m.id).map(normalizeMatch);
    } catch (err) {
        console.error("Dashboard Render Error:", err.message);
    }

    try {
        const html = renderDashboardPage(user, matches);
        res.send(html);
    } catch (renderErr) {
        console.error("Dashboard View Crash:", renderErr.message);
        res.status(500).send("Dashboard View Crash: " + renderErr.message);
    }
});

// 4. Match Detail Route
app.get('/match/:id', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
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
        dateTime: 'LIVE'
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
        
        if (found && (found.id || found.matchId)) {
            matchData = normalizeMatch(found);
        }
    } catch (err) {
        console.error("Match Detail Error:", err.message);
    }

    try {
        const html = renderMatchDetailPage(user, matchData);
        res.send(html);
    } catch (renderErr) {
        console.error("Match Detail View Crash:", renderErr.message);
        res.status(500).send("Match Detail View Crash: " + renderErr.message);
    }
});

// 5. Extra Debug Route
app.get('/match/:id/debug-json', async (req, res) => {
    const matchId = req.params.id;
    const json = await hl(`/matches/${matchId}`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(json, null, 2));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
