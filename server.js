// server.js - Updated with Yet to Bat, Dynamic Match States, and Auto-Refresh
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
const MASTER_ADMIN_KEY = 'soni_super_admin_secret_key_2026';

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

// Robust Score Extractor with "Yet to Bat" Support
function extractScoreAndOvers(teamObj, matchObj, isHome = true) {
    let runs = '';
    let wickets = '';
    let overs = '';
    let isYetToBat = false;

    const teamsState = matchObj.state?.teams || matchObj.inplayData?.state?.teams;
    if (teamsState) {
        const teamKey = isHome ? 'home' : 'away';
        const tState = teamsState[teamKey] || teamsState[isHome ? 'localteam' : 'visitorteam'];
        if (tState) {
            if (tState.status === 'yet_to_bat' || tState.isYetToBat || tState.score === 'Yet to bat' || tState.score === null) {
                isYetToBat = true;
            }

            const rawScore = safestr(tState.score);
            if (rawScore && rawScore !== 'null' && rawScore !== '' && rawScore !== 'Yet to bat') {
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

    let finalScore = '-';
    if (isYetToBat) {
        finalScore = 'Yet to bat';
    } else if (runs !== '' && runs !== null && runs !== undefined && runs !== '-') {
        finalScore = (wickets !== '' && wickets !== null && wickets !== undefined && String(wickets) !== '') ? `${runs}/${wickets}` : String(runs);
    }
    let finalOvers = (overs !== '' && overs !== null && overs !== undefined) ? String(overs) : '';

    return { score: finalScore, overs: finalOvers };
}

// Dynamic Match State Text Parser (Handles Countdowns, Breaks, and Bowler Running In)
function getMatchStateText(m) {
    const statusObj = m.status || m.state || {};
    const statusName = safestr(statusObj.name || statusObj.longName || m.matchState || '').toLowerCase();
    const startTime = m.dateTime || m.time || m.starting_at || 'Soon';

    // 1. If match hasn't started yet
    if (statusName.includes('not started') || statusName.includes('scheduled') || !m.isLive) {
        return `Starts: ${startTime}`;
    }

    // 2. If there is a break (Stumps, Lunch, Tea, Innings Break)
    if (statusName.includes('stumps') || statusName.includes('lunch') || statusName.includes('tea') || statusName.includes('break')) {
        return safestr(statusObj.name || statusObj.longName || 'Break');
    }

    // 3. Default active live play state
    return 'Bowler Running In';
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
        status: m.isLive ? 'LIVE' : 'UPCOMING',
        isLive: Boolean(m.isLive),
        matchStateText: esc(getMatchStateText(m)),
        dateTime: esc(m.dateTime || m.time || 'LIVE'),
        venue: esc(m.venue?.name || 'Stadium'),
        odds: { teamA_back: '1.98', teamA_lay: '2.00', draw_back: '-', draw_lay: '-', teamB_back: '1.98', teamB_lay: '2.00' }
    };
}

// Helper to inject Auto-Refresh Script into HTML views automatically
function sendWithAutoRefresh(res, htmlContent) {
    const autoRefreshScript = `
    <script>
        // Auto-refresh background polling every 15 seconds without logout
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

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    const adminToken = req.query.admin_token || MASTER_ADMIN_KEY;
    res.redirect(`/dashboard?user=${encodeURIComponent(targetUser)}&admin_token=${adminToken}`);
});

app.get('/dashboard', async (req, res) => {
    const adminToken = req.query.admin_token;
    const targetUser = req.query.user || 'Client';

    if (adminToken !== MASTER_ADMIN_KEY && !targetUser) {
        return res.redirect('/');
    }

    const user = { username: esc(targetUser), points: 50000, exposure: 1200 };
    let matches = [];
    try {
        const today = new Date().toISOString().slice(0, 10);
        const json = await hl(`/matches?date=${today}`);
        const list = Array.isArray(json) ? json : (json?.data || json?.matches || []);
        matches = list.filter(m => m && (m.id || m.match_id)).map(normalizeMatch);
    } catch (err) {
        console.error("Dashboard Error:", err.message);
    }
    sendWithAutoRefresh(res, renderDashboardPage(user, matches));
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

    sendWithAutoRefresh(res, renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
