// server.js - Fully Verified Deep-Scanning SoniExchange Server
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

// Deep extractor scanning all possible nests (inplayData, scoreboard, innings, direct objects)
function extractScoreAndOvers(teamName, matchObj) {
    if (!matchObj) return { score: '-', overs: '-' };

    let runs = '';
    let wickets = '';
    let overs = '';

    // Collect all potential array sources where scores might live
    const sources = [
        matchObj.inplayData?.scoreboard,
        matchObj.scoreboard,
        matchObj.innings,
        matchObj.scorecard,
        matchObj.data?.inplayData?.scoreboard,
        matchObj.data?.scoreboard,
        matchObj.data?.innings
    ];

    for (const list of sources) {
        if (Array.isArray(list) && list.length > 0) {
            // Try to find matching team
            const matched = list.find(item => {
                const name = safestr(item.team?.name || item.name || item.teamName || item.battingTeam || '').toLowerCase();
                return name && teamName && (name.includes(teamName.toLowerCase()) || teamName.toLowerCase().includes(name));
            }) || list[list.length - 1]; // Fallback to latest item

            if (matched) {
                const r = matched.runs ?? matched.score ?? matched.r ?? matched.total ?? '';
                const w = matched.wickets ?? matched.w ?? matched.wkt ?? '';
                const o = matched.overs ?? matched.ov ?? matched.over ?? '';
                if (r !== '' && r !== null) {
                    runs = r;
                    wickets = w;
                    overs = o;
                    break;
                }
            }
        }
    }

    // Fallback to direct team properties if arrays yielded nothing
    if (runs === '') {
        const teamObj = (matchObj.homeTeam?.name?.toLowerCase().includes(teamName.toLowerCase())) ? matchObj.homeTeam : matchObj.awayTeam;
        if (teamObj) {
            runs = teamObj.runs ?? teamObj.score ?? teamObj.r ?? '';
            wickets = teamObj.wickets ?? teamObj.w ?? '';
            overs = teamObj.overs ?? teamObj.ov ?? '';
        }
    }

    let finalScore = '-';
    if (runs !== '' && runs !== null && runs !== undefined && runs !== '-') {
        finalScore = (wickets !== '' && wickets !== null && wickets !== undefined && String(wickets) !== '') 
            ? `${runs}/${wickets}` 
            : String(runs);
    }
    let finalOvers = (overs !== '' && overs !== null && overs !== undefined) ? String(overs) : '-';

    return { score: finalScore, overs: finalOvers };
}

function normalizeMatch(m) {
    if (!m) return {};

    const teamAObj = m.homeTeam || m.localteam || m.teamA || { name: 'Team A' };
    const teamBObj = m.awayTeam || m.visitorteam || m.teamB || { name: 'Team B' };

    const teamAName = safestr(teamAObj.name || teamAObj);
    const teamBName = safestr(teamBObj.name || teamBObj);

    const resA = extractScoreAndOvers(teamAName, m);
    const resB = extractScoreAndOvers(teamBName, m);

    return {
        id: esc(m.id || m.match_id),
        tournament: esc(m.league?.name || m.tournament || m.series || 'Live Cricket'),
        teamA: esc(teamAName),
        teamB: esc(teamBName),
        logoA: esc(teamAObj.logo || m.home_logo || ''),
        logoB: esc(teamBObj.logo || m.away_logo || ''),
        scoreA: esc(resA.score),
        oversA: esc(resA.overs),
        scoreB: esc(resB.score),
        oversB: esc(resB.overs),
        status: 'LIVE',
        isLive: true,
        matchStateText: esc(m.status?.name || m.status?.longName || m.status || 'Live'),
        dateTime: esc(m.dateTime || m.time || 'LIVE'),
        venue: esc(m.venue?.name || m.venue || 'Stadium'),
        odds: { teamA_back: '1.98', teamA_lay: '2.00', draw_back: '-', draw_lay: '-', teamB_back: '1.98', teamB_lay: '2.00' }
    };
}

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
    res.send(renderDashboardPage(user, matches));
});

app.get('/match/:id', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    const matchId = req.params.id;
    
    let matchData = {
        id: esc(matchId), tournament: 'Live Match', teamA: 'Team A', teamB: 'Team B',
        logoA: '', logoB: '', scoreA: '-', oversA: '-', scoreB: '-', oversB: '-',
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
