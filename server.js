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

// HTML escape utility
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// Safe API Fetcher with error handling
async function hl(endpoint) {
    try {
        const r = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'x-rapidapi-key': HIGHLIGHTLY_KEY }
        });
        const text = await r.text();
        if (!r.ok) {
            console.error('API Error:', text.slice(0, 300));
            return null;
        }
        return JSON.parse(text);
    } catch (e) {
        console.error('Fetch Exception:', e.message);
        return null;
    }
}

// Status classifier jo header component ke mutabiq 'LIVE', 'SCHEDULED', ya 'FINISHED' return karega
function getMatchStatus(m) {
    const raw = String(m.status?.shortName || m.status?.name || m.state || m.status || '').toUpperCase();
    if (/FIN|COMP|RESULT|WON|ABANDON|CANCEL/.test(raw)) return 'FINISHED';
    if (/LIVE|PROG|INNINGS|ONGOING|BREAK|TOSS|STUMP|TEA|LUNCH/.test(raw)) return 'LIVE';
    if (/SCHED|UPCOMING|NOT|YET/.test(raw)) return 'SCHEDULED';
    if (m.isLive === true || m.live === true) return 'LIVE';
    return 'LIVE';
}

// Normalizer to prepare clean data for views
function normalizeMatch(m) {
    const status = getMatchStatus(m);
    return {
        id: esc(m.id),
        tournament: esc(m.league?.name || m.tournament || 'Live Cricket'),
        teamA: esc(m.homeTeam?.name || m.home_team || 'Team A'),
        teamB: esc(m.awayTeam?.name || m.away_team || 'Team B'),
        logoA: esc(m.homeTeam?.logo || ''),
        logoB: esc(m.awayTeam?.logo || ''),
        scoreA: esc(m.scoreA || m.homeTeam?.score || '-'),
        oversA: esc(m.oversA || ''),
        scoreB: esc(m.scoreB || m.awayTeam?.score || '-'),
        oversB: esc(m.oversB || ''),
        status: status,
        isLive: status === 'LIVE',
        matchStateText: esc(m.status?.longName || m.status?.description || 'In Progress'),
        dateTime: esc(m.dateTime || 'LIVE'),
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
        const json = await hl('/matches/list');
        const list = Array.isArray(json) ? json : (json?.data || json?.matches || []);
        
        matches = list.filter(m => m && m.id).map(normalizeMatch);
    } catch (err) {
        console.error("Dashboard Render Error:", err.message);
    }

    res.send(renderDashboardPage(user, matches));
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
        oversA: '',
        scoreB: '-',
        oversB: '',
        status: 'LIVE',
        isLive: true,
        matchStateText: 'Live',
        venue: 'Stadium',
        dateTime: 'LIVE'
    };

    try {
        const json = await hl(`/matches/${matchId}`);
        const found = Array.isArray(json) ? json[0] : json;
        
        if (found && found.id) {
            matchData = normalizeMatch(found);
        }
    } catch (err) {
        console.error("Match Detail Error:", err.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
