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
    if (value === null || value === undefined || value === '') return null;

    if (typeof value === 'number') {
        if (!Number.isFinite(value) || value <= 0) return null;
        return value < 1000000000000 ? Math.round(value * 1000) : Math.round(value);
    }

    const raw = String(value).trim();
    if (!raw) return null;

    if (/^\d+(\.\d+)?$/.test(raw)) {
        const num = Number(raw);
        if (!Number.isFinite(num) || num <= 0) return null;
        return num < 1000000000000 ? Math.round(num * 1000) : Math.round(num);
    }

    const hasExplicitTz = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw);
    let normalizedStr = raw;

    if (!hasExplicitTz) {
        if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}(?::\d{2})?$/.test(raw)) {
            const [dPart, tPart] = raw.split(/\s+/);
            const [hh, mm, ss = '00'] = tPart.split(':');
            normalizedStr = `${dPart}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}+05:30`;
        } else if (/^\d{4}-\d{2}-\d{2}T\d{1,2}:\d{2}(?::\d{2})?$/.test(raw)) {
            normalizedStr = `${raw}+05:30`;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            normalizedStr = `${raw}T00:00:00+05:30`;
        }
    }

    const ts = new Date(normalizedStr).getTime();
    return Number.isFinite(ts) ? ts : null;
}

function formatDateTimeIST(ts) {
    const num = Number(ts);
    if (!Number.isFinite(num) || num <= 0) return '';
    try {
        return new Date(num).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (_) {
        return new Date(num).toLocaleString('en-IN');
    }
}

function detectMatchFormat(source) {
    const text = String(source || '').toUpperCase();
    if (/\bTEST\b/.test(text) || /\b5\s*DAY\b/.test(text) || /\bDAY\s*[1-5]\b/.test(text)) {
        return 'TEST';
    }
    if (
        /\bT20\b/.test(text) ||
        /\bT20I\b/.test(text) ||
        /\b20\s*OVER/.test(text) ||
        /\bBIG BASH\b/.test(text) ||
        /\bBBL\b/.test(text) ||
        /\bWBBL\b/.test(text) ||
        /\bIPL\b/.test(text) ||
        /\bPSL\b/.test(text) ||
        /\bSA20\b/.test(text) ||
        /\bILT20\b/.test(text) ||
        /\bCPL\b/.test(text)
    ) {
        return 'T20';
    }
    if (
        /\bODI\b/.test(text) ||
        /\bONE\s*DAY\b/.test(text) ||
        /\b50\s*OVER/.test(text) ||
        /\bLIST\s*A\b/.test(text)
    ) {
        return 'ODI';
    }
    return 'MATCH';
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
    const startTs = parseTimestamp(m.startDate || m.start_date || m.startTime || m.timestamp);

    const scoreSummary = [
        p1.score !== '-' ? `${shortA}: ${p1.score}${p1.overs ? ` (${p1.overs})` : ''}` : '',
        p2.score !== '-' ? `${shortB}: ${p2.score}${p2.overs ? ` (${p2.overs})` : ''}` : ''
    ].filter(Boolean).join('  |  ');

    const formatBadge = detectMatchFormat([
        m.format,
        m.matchType,
        m.match_type,
        m.seriesName,
        m.name,
        teamA,
        teamB
    ].filter(Boolean).join(' '));

    return {
        id: esc(id),
        eventId: esc(m.eventId || ''),
        tournament: esc([m.seriesName, m.name].filter(Boolean).join(' • ')),
        formatBadge: esc(formatBadge),
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
        dateTime: esc(m.sessionStatus || m.status || (startTs ? formatDateTimeIST(startTs) : '')),
        venue: esc(m.ground || ''),
        startTs,
        countdownTimestamp: status === 'UPCOMING' ? startTs : null
    };
}

module.exports = {
    safestr,
    esc,
    parseTimestamp,
    formatDateTimeIST,
    detectMatchFormat,
    parseScoreAndOvers,
    getSportBexStatus,
    fetchLiveMatchesRaw,
    normalizeLiveMatchCard
};
