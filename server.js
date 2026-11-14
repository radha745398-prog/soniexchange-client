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

// Safe API Fetcher
async function hl(endpoint) {
    try {
        const r = await fetch(`${BASE_URL}${endpoint}`, {
            headers: { 'x-rapidapi-key': HIGHLIGHTLY_KEY }
        });
        const text = await r.text();
        if (!r.ok) {
            console.error('API Error:', text);
            return null;
        }
        return JSON.parse(text);
    } catch (e) {
        console.error('Fetch Exception:', e.message);
        return null;
    }
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
        
        matches = list.map((m) => ({
            id: esc(m.id),
            tournament: esc(m.league?.name || m.tournament || 'Live Cricket'),
            teamA: esc(m.homeTeam?.name || m.home_team || 'Team A'),
            teamB: esc(m.awayTeam?.name || m.away_team || 'Team B'),
            scoreA: esc(m.scoreA || '-'),
            scoreB: esc(m.scoreB || '-'),
            status: esc(m.status?.shortName || 'LIVE'),
            isLive: true,
            matchStateText: esc(m.status?.longName || 'In Progress'),
            dateTime: 'LIVE',
            venue: esc(m.venue?.name || 'Stadium'),
            odds: { 
                teamA_back: '1.98', teamA_lay: '2.00', 
                draw_back: '-', draw_lay: '-', 
                teamB_back: '1.98', teamB_lay: '2.00' 
            }
        }));
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
        scoreA: '-',
        scoreB: '-',
        matchStateText: 'Live',
        venue: 'Stadium',
        status: 'LIVE'
    };

    try {
        const json = await hl(`/matches/${matchId}`);
        const found = Array.isArray(json) ? json[0] : json;
        
        if (found && found.id) {
            matchData.tournament = esc(found.league?.name || 'Live Match');
            matchData.teamA = esc(found.homeTeam?.name || 'Team A');
            matchData.teamB = esc(found.awayTeam?.name || 'Team B');
            matchData.venue = esc(found.venue?.name || 'Live Ground');
            matchData.matchStateText = esc(found.status?.longName || 'Live');
        }
    } catch (err) {
        console.error("Match Detail Error:", err.message);
    }

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
