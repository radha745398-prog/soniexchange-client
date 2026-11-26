const { sbGet, CACHE_TTL } = require('./sportbexClient');
const { safestr, esc, parseTimestamp, formatDateTimeIST, detectMatchFormat } = require('./liveMatches');

function getTodayYMD(date = new Date()) {
    try {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);

        const map = {};
        parts.forEach(p => {
            if (p.type !== 'literal') map[p.type] = p.value;
        });
        if (map.year && map.month && map.day) {
            return `${map.year}-${map.month}-${map.day}`;
        }
    } catch (_) {}

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function extractSeriesArray(json) {
    if (!json || typeof json !== 'object') return Array.isArray(json) ? json : [];

    if (json.error) {
        console.warn('[SB UPCOMING API ERROR]', JSON.stringify(json.error));
        return [];
    }

    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.series)) return json.series;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.results)) return json.results;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    if (Array.isArray(json?.data?.series)) return json.data.series;
    if (Array.isArray(json?.data?.items)) return json.data.items;

    console.log('[SB UPCOMING SHAPE]', JSON.stringify({
        keys: Object.keys(json),
        dataType: typeof json.data,
        dataKeys: json.data && typeof json.data === 'object' ? Object.keys(json.data) : null,
        sample: json
    }).slice(0, 1200));

    return [];
}

async function fetchUpcomingSeriesRaw(startDate = getTodayYMD()) {
    const cleanDate = String(startDate || getTodayYMD()).trim();
    const ttl = CACHE_TTL?.SERIES_MS || 60000;

    try {
        const json = await sbGet(
            `/api/live-score/series/upcoming?startDate=${encodeURIComponent(cleanDate)}`,
            ttl
        );
        const list = extractSeriesArray(json);
        if (list.length > 0) return list;
    } catch (err) {
        console.warn('[SB UPCOMING startDate retry]:', err.message);
    }

    try {
        const fallbackJson = await sbGet('/api/live-score/series/upcoming', ttl);
        return extractSeriesArray(fallbackJson);
    } catch (err) {
        console.warn('[SB UPCOMING fallback error]:', err.message);
        return [];
    }
}

function mapUpcomingSeriesItems(seriesList) {
    const list = Array.isArray(seriesList) ? seriesList : [];
    console.log('[SB UPCOMING SAMPLE]', JSON.stringify(list[0] || null));

    return list
        .filter((s) => s && typeof s === 'object' && !s.error)
        .map((s) => {
            const startTs = parseTimestamp(s.startDate || s.start_date || s.startTime);
            const endTs = parseTimestamp(s.endDate || s.end_date || s.endTime);
            const seriesName = safestr(s.name || s.seriesName || s.title, 'Upcoming Series');
            const rawId = String(s._id || s.id || s.seriesId || '').trim();
            const formatBadge = detectMatchFormat(`${seriesName} ${s.format || ''} ${s.matchType || ''}`);

            return {
                id: rawId,
                title: esc(seriesName),
                tournament: s.isPopular ? 'Popular Series' : 'Upcoming Series',
                formatBadge: esc(formatBadge),
                dateTime: esc(
                    startTs
                        ? `Starts: ${formatDateTimeIST(startTs)}`
                        : 'Schedule TBA'
                ),
                startTs,
                endTs
            };
        });
}

module.exports = {
    getTodayYMD,
    fetchUpcomingSeriesRaw,
    mapUpcomingSeriesItems
};
