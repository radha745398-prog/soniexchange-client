const { sbGet, CACHE_TTL } = require('./sportbexClient');
const { safestr, esc, parseTimestamp, getSportBexStatus } = require('./liveMatches');

function extractMatchesArray(json) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.matches)) return json.matches;
    if (Array.isArray(json?.data?.matches)) return json.data.matches;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    return [];
}

// Get All Matches for a Specific Series
async function fetchSeriesMatchesRaw(seriesId) {
    const cleanId = encodeURIComponent(String(seriesId || '').trim());
    if (!cleanId) return [];

    const cacheTtl = CACHE_TTL?.SERIES_MS || CACHE_TTL?.LIVE_MS || 60000;
    const json = await sbGet(`/api/live-score/series/${cleanId}`, cacheTtl);
    return extractMatchesArray(json);
}

function normalizeUpcomingMatchCard(m) {
    if (!m || typeof m !== 'object') return null;

    const id = String(m._id || m.id || m.matchId || '').trim();
    const t1 = m.teams?.t1 || {};
    const t2 = m.teams?.t2 || {};

    const teamA = safestr(t1.name, '');
    const teamB = safestr(t2.name, '');
    const shortA = safestr(t1.short_name || t1.shortName, teamA.slice(0, 4).toUpperCase());
    const shortB = safestr(t2.short_name || t2.shortName, teamB.slice(0, 4).toUpperCase());

    const extraText = `${m.sessionStatus || ''} ${m.result?.message || ''}`;
    const status = getSportBexStatus(m.status, m.isLive, extraText);
    const startTs = parseTimestamp(m.startDate || m.timestamp);

    return {
        id: esc(id),
        eventId: esc(m.eventId || ''),
        seriesId: esc(m.seriesId || ''),
        tournament: esc([m.seriesName, m.name].filter(Boolean).join(' • ')),
        teamA: esc(teamA),
        teamB: esc(teamB),
        shortA: esc(shortA),
        shortB: esc(shortB),
        logoA: esc(t1.logo || ''),
        logoB: esc(t2.logo || ''),
        scoreA: '-',
        oversA: '',
        scoreB: '-',
        oversB: '',
        scoreSummary: '',
        status,
        isLive: status === 'LIVE',
        dateTime: esc(startTs ? new Date(startTs).toLocaleString('en-IN') : (m.status || 'Schedule TBA')),
        venue: esc(m.ground || ''),
        startTs,
        countdownTimestamp: status === 'UPCOMING' ? startTs : null
    };
}

module.exports = {
    fetchSeriesMatchesRaw,
    normalizeUpcomingMatchCard
};

