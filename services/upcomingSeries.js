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

function extractSeriesArray(json) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json?.series)) return json.series;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.results)) return json.results;
    if (Array.isArray(json?.data?.data)) return json.data.data;
    if (Array.isArray(json?.data?.series)) return json.data.series;
    if (Array.isArray(json?.data?.items)) return json.data.items;

    if (json && typeof json === 'object') {
        console.log('[SB UPCOMING SHAPE]', JSON.stringify({
            keys: Object.keys(json),
            dataType: typeof json.data,
            dataKeys: json.data && typeof json.data === 'object' ? Object.keys(json.data) : null,
            sample: json
        }).slice(0, 1200));
    }
    return [];
}

async function fetchUpcomingSeriesRaw() {
    const json = await sbGet('/api/live-score/series/upcoming', CACHE_TTL.SERIES_MS);
    return extractSeriesArray(json);
}

function mapUpcomingSeriesItems(seriesList) {
    const list = Array.isArray(seriesList) ? seriesList : [];
    console.log('[SB UPCOMING SAMPLE]', JSON.stringify(list[0] || null));

    return list
        .filter((s) => s && typeof s === 'object')
        .map((s) => {
            const startTs = parseTimestamp(s.startDate || s.start_date || s.startTime);
            const endTs = parseTimestamp(s.endDate || s.end_date || s.endTime);
            const seriesName = safestr(s.name || s.seriesName || s.title, 'Upcoming Series');

            return {
                id: esc(s._id || s.id || ''),
                title: esc(seriesName),
                tournament: s.isPopular ? 'Popular Series' : 'Upcoming Series',
                dateTime: esc(
                    startTs
                        ? `Starts: ${new Date(startTs).toLocaleDateString('en-IN')}`
                        : 'Schedule TBA'
                ),
                startTs,
                endTs
            };
        });
}

module.exports = {
    fetchUpcomingSeriesRaw,
    mapUpcomingSeriesItems
};
