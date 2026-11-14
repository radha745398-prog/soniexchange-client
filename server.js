// server.js
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();

const { renderDashboardPage } = require('./clientViews/dashboardView');
const { renderMatchDetailPage } = require('./clientViews/matchDetailView');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Nayi API key direct set kar di hai
const HIGHLIGHTLY_KEY = '4cfda7fc-7c4d-49fb-b04c-8b0acdbe3853';
const BASE_URL = 'https://cricket.highlightly.net';

// HTML escape: user ya API ka text page ko tod na sake
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

// ---------- API call + cache + daily limit guard ----------
const cache = new Map();
let usage = { day: '', count: 0 };
const DAILY_LIMIT = 90; // free plan 100/din, 10 ka buffer

async function hl(pathAndQuery, ttlMs) {
    const hit = cache.get(pathAndQuery);
    if (hit && Date.now() - hit.time < ttlMs) return hit.data;

    const day = new Date().toISOString().slice(0, 10);
    if (usage.day !== day) usage = { day, count: 0 };
    if (usage.count >= DAILY_LIMIT) {
        console.warn('Daily limit guard: purana cache dikha rahe hain');
        return hit ? hit.data : null;
    }
    usage.count++;

    try {
        const r = await fetch(`${BASE_URL}${pathAndQuery}`, {
            headers: { 'x-rapidapi-key': HIGHLIGHTLY_KEY }
        });
        console.log(`Highlightly ${pathAndQuery} -> status ${r.status} | bachi requests: ${r.headers.get('x-ratelimit-requests-remaining')}`);
        const text = await r.text();
        if (!r.ok) {
            console.error('API error body:', text.slice(0, 300));
            return hit ? hit.data : null;
        }
        const data = JSON.parse(text);
        cache.set(pathAndQuery, { time: Date.now(), data });
        return data;
    } catch (e) {
        console.error('Fetch/parse error:', e.message);
        return hit ? hit.data : null;
    }
}

// ---------- Match data ko saaf karna ----------
const str = (v) => (typeof v === 'string' ? v : '');

function statusText(m) {
    const s = m.state ?? m.status;
    if (typeof s === 'string') return s;
    return str(s?.description) || str(s?.name) || str(s?.long) || str(s?.shortName) || str(s?.report) || '';
}

function classify(m) {
    if (m.isLive === true || m.live === true) return 'LIVE';
    const t = statusText(m).toLowerCase();
    if (/finish|complete|ended|result|won by|abandon|cancel/.test(t)) return 'FINISHED';
    if (/not started|yet to|scheduled|upcoming/.test(t)) return 'SCHEDULED';
    if (/live|progress|innings|ongoing|started|break|toss|lunch|tea|stumps|drinks/.test(t)) return 'LIVE';
    return 'SCHEDULED';
}

function pickScore(m, side) {
    const team = m[`${side}Team`];
    const cands = [team?.score, m.score?.[side], m.scores?.[side], m.state?.score?.[side]];
    for (const c of cands) {
        if (c == null) continue;
        if (typeof c === 'string' || typeof c === 'number') return { score: String(c), overs: '' };
        if (typeof c === 'object') {
            const r = c.runs ?? c.score;
            const w = c.wickets ?? c.wkts;
            if (r != null) return { score: w != null ? `${r}/${w}` : String(r), overs: c.overs != null ? `(${c.overs})` : '' };
        }
    }
    return { score: '-', overs: '' };
}

function safeLogo(u) {
    return typeof u === 'string' && u.startsWith('https://') ? u : '';
}

function formatDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt) ? '' : dt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

function normalize(m) {
    const a = pickScore(m, 'home');
    const b = pickScore(m, 'away');
    const status = classify(m);
    return {
        id: esc(m.id),
        tournament: esc(m.league?.name || m.title || 'Cricket'),
        teamA: esc(m.homeTeam?.name || 'Team A'),
        teamB: esc(m.awayTeam?.name || 'Team B'),
        logoA: safeLogo(m.homeTeam?.logo),
        logoB: safeLogo(m.awayTeam?.logo),
        scoreA: esc(a.score), oversA: esc(a.overs),
        scoreB: esc(b.score), oversB: esc(b.overs),
        status,
        isLive: status === 'LIVE',
        matchStateText: esc(statusText(m) || status),
        dateTime: esc(statusText(m) || formatDate(m.date) || status),
        venue: esc(m.venue?.name || (typeof m.venue === 'string' ? m.venue : '') || 'Stadium')
    };
}

// ---------- Routes ----------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/switch-to-client', (req, res) => {
    const targetUser = req.query.user || 'Client';
    res.redirect(`/dashboard?user=${encodeURIComponent(targetUser)}`);
});

// Dashboard: /matches/list endpoint use kar rahe hain
app.get('/dashboard', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };

    const json = await hl('/matches/list', 20 * 60 * 1000); // 20 min cache
    const list = Array.isArray(json) ? json : (json?.data || json?.matches || []);
    console.log('Total matches:', list.length);
    if (list[0]) console.log('PEHLA MATCH:', JSON.stringify(list[0], null, 2).slice(0, 2500));

    const order = { LIVE: 0, SCHEDULED: 1, FINISHED: 2 };
    const matches = list.filter((m) => m && m.id != null).map(normalize)
        .sort((x, y) => order[x.status] - order[y.status]);

    res.send(renderDashboardPage(user, matches));
});

// Match detail: /matches/{id} endpoint
app.get('/match/:id', async (req, res) => {
    const user = { username: esc(req.query.user || 'Client'), points: 50000, exposure: 1200 };
    const id = encodeURIComponent(req.params.id);

    const json = await hl(`/matches/${id}`, 5 * 60 * 1000); // 5 min cache
    const found = Array.isArray(json) ? json[0] : json;
    if (found) console.log('MATCH DETAIL:', JSON.stringify(found, null, 2).slice(0, 2500));

    const matchData = found
        ? normalize(found)
        : {
            id: esc(req.params.id), tournament: 'Match', teamA: 'Team A', teamB: 'Team B',
            logoA: '', logoB: '', scoreA: '-', oversA: '', scoreB: '-', oversB: '',
            status: 'SCHEDULED', isLive: false, matchStateText: 'Data abhi available nahi',
            dateTime: '', venue: 'Stadium'
        };

    res.send(renderMatchDetailPage(user, matchData));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
