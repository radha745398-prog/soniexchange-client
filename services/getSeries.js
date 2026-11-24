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

function isValidSeriesRecord(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.error) return false;
    const rawId = obj._id ?? obj.id ?? obj.seriesId ?? '';
    const rawName = obj.name ?? obj.seriesName ?? obj.title ?? '';
    return Boolean(String(rawId).trim()) && Boolean(String(rawName).trim());
}

function flattenSeriesGroups(rawData) {
    if (!rawData || typeof rawData !== 'object') return [];
    if (rawData.error) return [];

    const groups = Array.isArray(rawData.data)
        ? rawData.data
        : (Array.isArray(rawData) ? rawData : []);

    const items = [];
    groups.forEach((entry) => {
        if (!entry || typeof entry !== 'object' || entry.error) return;
        const groupMonth = safestr(entry.month, '');

        if (Array.isArray(entry.result)) {
            entry.result.forEach((s) => {
                if (isValidSeriesRecord(s)) {
                    items.push({
                        ...s,
                        _id: s._id ?? s.id ?? s.seriesId,
                        name: s.name ?? s.seriesName ?? s.title,
                        _groupMonth: s.month || groupMonth
                    });
                }
            });
        } else if (isValidSeriesRecord(entry)) {
            items.push({
                ...entry,
                _id: entry._id ?? entry.id ?? entry.seriesId,
                name: entry.name ?? entry.seriesName ?? entry.title,
                _groupMonth: entry.month || groupMonth
            });
        }
    });

    return items;
}

async function fetchSeriesListRaw() {
    const json = await sbGet('/api/live-score/series/upcoming', CACHE_TTL.SERIES_MS);
    return flattenSeriesGroups(json);
}

async function fetchUpcomingSeriesRaw() {
    return fetchSeriesListRaw();
}

function mapUpcomingSeriesItems(seriesList) {
    const now = Date.now();
    return (Array.isArray(seriesList) ? seriesList : [])
        .filter(isValidSeriesRecord)
        .map((s) => {
            const startTs = parseTimestamp(s.startDate);
            const endTs = parseTimestamp(s.endDate);
            const tag = s.isPopular ? 'Popular Series' : 'Series';
            const monthLabel = safestr(s._groupMonth, '');
            const cleanId = String(s._id ?? s.id ?? s.seriesId ?? '').trim();
            const cleanTitle = String(s.name ?? s.seriesName ?? s.title ?? '').trim();

            return {
                id: esc(cleanId),
                title: esc(cleanTitle),
                tournament: esc(monthLabel ? `${tag} • ${monthLabel}` : tag),
                dateTime: esc(
                    startTs
                        ? `Starts: ${new Date(startTs).toLocaleDateString('en-IN')}`
                        : ''
                ),
                startTs,
                endTs
            };
        })
        .filter((item) => {
            if (!item.id || !item.title) return false;
            if (!item.startTs) return true;
            return item.startTs > now || (!item.endTs || item.endTs >= now);
        });
}

module.exports = {
    fetchSeriesListRaw,
    fetchUpcomingSeriesRaw,
    mapUpcomingSeriesItems
};
