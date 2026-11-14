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

// Bulletproof string extractor (Prevents [object Object] forever)
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

// Safe API Fetcher with detailed debugging
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

// Advanced Recursive Property Finder (Automatically hunts down scores/overs anywhere in JSON)
function deepFind(obj, keywords) {
    if (!obj || typeof obj !== 'object') return null;
    for (const k of Object.keys(obj)) {
        const lowerK = k.toLowerCase();
        if (keywords.some(kw => lowerK.includes(kw))) {
            const val = obj[k];
            if (val !== null && val !== undefined && val !== '' && typeof val !== 'object') {
                return val;
            }
            if (val && typeof val === 'object') {
                // If it's an object with runs/score inside it
                const subR = val.runs ?? val.score ?? val.r ?? val.value;
                if (subR !== undefined && subR !== '') return subR;
            }
        }
        if (typeof obj[k] === 'object') {
            const found = deepFind(obj[k], keywords);
            if (found !== null && found !== undefined && found !== '') return found;
        }
    }
    return null;
}

// Smart Normalizer with Automatic Deep Score & Overs Extractor
function normalizeMatch(m) {
    const status = getMatchStatus(m);
    const stateText = safestr(m.status?.longName || m.status?.description || m.status?.name || m.status || m.state || 'In Progress');

    // Extract Score for Home / Away using deep inspection
    const getTeamScore = (teamObj, teamNameFallback) => {
        if (!teamObj) return '-';
        
        // 1. Check direct properties
        let runs = teamObj.runs ?? teamObj.score ?? teamObj.r ?? teamObj.totalRuns;
        let wickets = teamObj.wickets ?? teamObj.w ?? teamObj.totalWickets;

        // 2. If not found directly, use deep search inside the team object
        if (runs === undefined || runs === null) {
            runs = deepFind(teamObj, ['run', 'score', 'total']);
        }
        if (wickets === undefined || wickets === null) {
            wickets = deepFind(teamObj, ['wicket', 'wkts', 'wkt']);
        }

        if (runs !== null && runs !== undefined && runs !== '') {
            return wickets !== null && wickets !== undefined && wickets !== '' ? `${runs}/${wickets}` : String(runs);
        }
        return '-';
    };

    const getTeamOvers = (teamObj) => {
        if (!teamObj) return '-';
        let overs = teamObj.overs ?? teamObj.ov ?? teamObj.over;
        if (overs === undefined || overs === null) {
            overs = deepFind(teamObj, ['over']);
        }
        return overs !== null && overs !== undefined && overs !== '' ? String(overs) : '-';
    };

    const scoreA = getTeamScore(m.homeTeam, 'Team A');
    const scoreB = getTeamScore(m.awayTeam, 'Team B');

    const oversA = getTeamOvers(m.homeTeam);
    const oversB = getTeamOvers(m.awayTeam);

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
