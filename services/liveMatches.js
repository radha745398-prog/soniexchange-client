const { sbGet, CACHE_TTL } = require('./sportbexClient');

const safestr = (val, fallback = '') => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
        return val.name || val.short_name || val.shortName || val.text || val.score || fallback;
    }
    return String(val);
};

const esc = (s) => String(safestr(s)).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

function parseTimestamp(value) {
    if (!value) return null;
    let ts;
    if (typeof value === 'number') {
        ts = value < 1000000000000 ? value * 1000 : value;
    } else {
        ts = new Date(value).getTime();
    }
    return Number.isFinite(ts) ? ts : null;
}

// Parses strings like "118/2 (44.1) & 368/10 (121.0)" -> score="118/2 & 368/10", overs="44.1"
function parseScoreAndOvers(rawScoreText) {
    const raw = String(rawScoreText || '').trim();
    if (!raw) return { score: '-', overs: '' };

    const parts = raw.split('&').map(s => s.trim()).filter(Boolean);
    const currentPart = parts[0] || raw;

    const overMatch = currentPart.match(/\(([^)]+)\)\s*$/);
    const overs = overMatch ? overMatch[1].trim() : '';

    const cleanScores = parts.map(p => p.replace(/\s*\([^)]*\)\s*$/, '').trim()).filter(Boolean);
    const score = cleanScores.length > 0 ? cleanScores.join(' & ') : '-';

    return { score, overs };
}

function getSportBexStatus(rawStatus, isLive, extraText = '') {
    const combined = `${rawStatus || ''} ${extraText || ''}`.trim().toUpperCase();

    if (
        combined.includes('FINISH') ||
        combined.includes('COMPLET') ||
        combined.includes('WON BY') ||
        combined.includes('TIED') ||
        combined.includes('NO RESULT') ||
        combined.includes('ABANDON') ||
        combined.includes('RESULT') ||
        combined.includes('MATCH END') ||
        combined.includes('STUMPS') ||
        combined.includes('DAY END')
    ) {
        return 'FINISHED';
    }

    if (
        combined.includes('BREAK') ||
        combined.includes('LUNCH') ||
        combined.includes('TEA') ||
        combined.includes('DRINK') ||
        combined.includes('INNINGS BREAK')
    ) {
        return 'BREAK';
    }

    if (isLive === true || combined.includes('LIVE') || combined.includes('INPLAY') || combined.includes('IN PROGRESS')) {
        return 'LIVE';
    }

    return 'UPCOMING';
}

// Get All Live Matches
async function fetchLiveMatchesRaw() {
    const json = await sbGet('/api/live-score/match/live', CACHE_TTL.LIVE_MS);
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json)) return json;
    return [];
}

function normalizeLiveMatchCard(m) {
    if (!m || typeof m !== 'object') return null;

    const id = String(m._id || m.id || m.matchId || '').trim();
    const t1 = m.teams?.t1 || {};
    const t2 = m.teams?.t2 || {};

    const teamA = safestr(t1.name, '');
    const teamB = safestr(t2.name, '');
    const shortA = safestr(t1.short_name || t1.shortName, teamA.slice(0, 4).toUpperCase());
    const shortB = safestr(t2.short_name || t2.shortName, teamB.slice(0, 4).toUpperCase());

    const p1 = parseScoreAndOvers(t1.score);
    const p2 = parseScoreAndOvers(t2.score);

    const extraText = `${m.sessionStatus || ''} ${m.result?.message || ''}`;
    const status = getSportBexStatus(m.status, m.isLive, extraText);
    const startTs = parseTimestamp(m.startDate || m.timestamp);

    const scoreSummary = [
        p1.score !== '-' ? `${shortA}: ${p1.score}${p1.overs ? ` (${p1.overs})` : ''}` : '',
        p2.score !== '-' ? `${shortB}: ${p2.score}${p2.overs ? ` (${p2.overs})` : ''}` : ''
    ].filter(Boolean).join('  |  ');

    return {
        id: esc(id),
        eventId: esc(m.eventId || ''),
        tournament: esc([m.seriesName, m.name].filter(Boolean).join(' • ')),
        teamA: esc(teamA),
        teamB: esc(teamB),
        shortA: esc(shortA),
        shortB: esc(shortB),
        logoA: esc(t1.logo || ''),
        logoB: esc(t2.logo || ''),
        scoreA: esc(p1.score),
        oversA: esc(p1.overs),
        scoreB: esc(p2.score),
        oversB: esc(p2.overs),
        scoreSummary: esc(scoreSummary),
        status,
        isLive: status === 'LIVE',
        dateTime: esc(m.sessionStatus || m.status || (startTs ? new Date(startTs).toLocaleString('en-IN') : '')),
        venue: esc(m.ground || ''),
        countdownTimestamp: status === 'UPCOMING' ? startTs : null
    };
}

module.exports = {
    safestr,
    esc,
    parseTimestamp,
    parseScoreAndOvers,
    getSportBexStatus,
    fetchLiveMatchesRaw,
    normalizeLiveMatchCard
};

