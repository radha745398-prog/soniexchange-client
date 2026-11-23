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

function flattenSeriesGroups(rawData) {
    const groups = Array.isArray(rawData?.data)
        ? rawData.data
        : (Array.isArray(rawData) ? rawData : []);

    const items = [];
    groups.forEach((entry) => {
        const groupMonth = safestr(entry?.month, '');
        if (Array.isArray(entry?.result)) {
            entry.result.forEach((s) => {
                if (s && typeof s === 'object') {
                    items.push({
                        ...s,
                        _groupMonth: s.month || groupMonth
                    });
                }
            });
        } else if (entry && typeof entry === 'object' && (entry._id || entry.id || entry.name)) {
            items.push({
                ...entry,
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

function mapUpcomingSeriesItems(seriesList) {
    const now = Date.now();
    return (Array.isArray(seriesList) ? seriesList : [])
        .map((s) => {
            const startTs = parseTimestamp(s.startDate);
            const endTs = parseTimestamp(s.endDate);
            const tag = s.isPopular ? 'Popular Series' : 'Series';
            const monthLabel = safestr(s._groupMonth, '');

            return {
                id: esc(s._id || s.id || ''),
                title: esc(s.name || ''),
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
            if (!item.startTs) return true;
            return item.startTs > now || (!item.endTs || item.endTs >= now);
        });
}

module.exports = {
    fetchSeriesListRaw,
    mapUpcomingSeriesItems
};

