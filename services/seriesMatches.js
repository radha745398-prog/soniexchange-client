const { sbGet, CACHE_TTL } = require('./sportbexClient');
const { safestr, esc, parseTimestamp, formatDateTimeIST, detectMatchFormat, getSportBexStatus } = require('./liveMatches');

function extractMatchesArray(json) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.matches)) return json.matches;
    if (Array.isArray(json?.data?.matches)) return json.data.matches;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    return [];
}

function isTbcTeam(name) {
    const upper = String(name || '').trim().toUpperCase();
    return !upper || upper === 'TBC' || upper === 'TBA';
}

function resolveUpcomingStatus(m, extraText) {
    if (m?.isLive === true) return 'LIVE';

    const raw = String(m?.status || '').trim().toUpperCase();
    const combined = `${raw} ${String(extraText || '').toUpperCase()}`;

    if (
        raw === 'FINISHED' ||
        raw === 'COMPLETED' ||
        raw === 'ENDED' ||
        raw === 'ABANDONED' ||
        raw === 'CANCELLED' ||
        combined.includes('WON BY') ||
        combined.includes('MATCH ENDED') ||
        combined.includes('NO RESULT')
    ) {
        return 'FINISHED';
    }

    if (
        raw === 'NOT_STARTED' ||
        raw === 'NOT STARTED' ||
        raw === 'UPCOMING' ||
        raw === 'SCHEDULED' ||
        raw === 'FIXTURE' ||
        !raw
    ) {
        return 'UPCOMING';
    }

    const mapped = getSportBexStatus(m?.status, m?.isLive, extraText);
    return mapped || 'UPCOMING';
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
    if (!id) return null;

    const t1 = m.teams?.t1 || {};
    const t2 = m.teams?.t2 || {};

    const teamA = safestr(t1.name, '');
    const teamB = safestr(t2.name, '');
    if (isTbcTeam(teamA) || isTbcTeam(teamB)) return null;

    const shortA = safestr(t1.short_name || t1.shortName, teamA.slice(0, 4).toUpperCase());
    const shortB = safestr(t2.short_name || t2.shortName, teamB.slice(0, 4).toUpperCase());

    const extraText = `${m.sessionStatus || ''} ${m.result?.message || ''}`;
    let status = resolveUpcomingStatus(m, extraText);
    const startTs = parseTimestamp(m.startDate || m.start_date || m.startTime || m.date || m.timestamp);

    if (status === 'UPCOMING' && startTs && startTs <= Date.now()) {
        status = 'LIVE';
    }

    const formatBadge = detectMatchFormat([
        m.format,
        m.matchType,
        m.match_type,
        m.type,
        m.seriesName,
        m.name,
        teamA,
        teamB
    ].filter(Boolean).join(' '));

    return {
        id,
        eventId: String(m.eventId || '').trim(),
        seriesId: String(m.seriesId || '').trim(),
        tournament: esc([m.seriesName, m.name].filter(Boolean).join(' • ')),
        formatBadge: esc(formatBadge),
        teamA: esc(teamA),
        teamB: esc(teamB),
        shortA: esc(shortA),
        shortB: esc(shortB),
        logoA: String(t1.logo || '').trim(),
        logoB: String(t2.logo || '').trim(),
        scoreA: '-',
        oversA: '',
        scoreB: '-',
        oversB: '',
        scoreSummary: '',
        status,
        isLive: status === 'LIVE',
        dateTime: esc(startTs ? formatDateTimeIST(startTs) : (m.status || 'Schedule TBA')),
        venue: esc(m.ground || ''),
        startTs,
        countdownTimestamp: status === 'UPCOMING' ? startTs : null
    };
}

module.exports = {
    fetchSeriesMatchesRaw,
    normalizeUpcomingMatchCard
};
