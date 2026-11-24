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

function getTodayYMD(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
    if (rawData.error) {
        console.warn('[SB GET SERIES API ERROR]', JSON.stringify(rawData.error));
        return [];
    }

    const baseArray = Array.isArray(rawData.data)
        ? rawData.data
        : (Array.isArray(rawData.series)
            ? rawData.series
            : (Array.isArray(rawData) ? rawData : []));

    const items = [];

    baseArray.forEach((entry) => {
        if (!entry || typeof entry !== 'object' || entry.error) return;
        const groupMonth = safestr(entry.month, '');

        if (Array.isArray(entry.result)) {
            entry.result.forEach((s) => {
                if (isValidSeriesRecord(s)) {
                    items.push({
                        ...s,
                        _id: String(s._id ?? s.id ?? s.seriesId).trim(),
                        name: safestr(s.name ?? s.seriesName ?? s.title),
                        _groupMonth: safestr(s.month || groupMonth, '')
                    });
                }
            });
        } else if (isValidSeriesRecord(entry)) {
            items.push({
                ...entry,
                _id: String(entry._id ?? entry.id ?? entry.seriesId).trim(),
                name: safestr(entry.name ?? entry.seriesName ?? entry.title),
                _groupMonth: safestr(entry.month || groupMonth, '')
            });
        }
    });

    return items;
}

async function fetchSeriesListRaw() {
    const ttl = CACHE_TTL?.SERIES_MS || 60000;

    // 1. Pehle /api/live-score/series try karega
    try {
        const json = await sbGet('/api/live-score/series', ttl);
        const list = flattenSeriesGroups(json);
        if (list.length > 0) return list;
    } catch (err) {
        console.warn('[SB GET SERIES /series retry]:', err.message);
    }

    // 2. Agar wahan se list nahi aayi toh startDate ke saath upcoming series try karega
    try {
        const today = getTodayYMD();
        const upcomingJson = await sbGet(
            `/api/live-score/series/upcoming?startDate=${encodeURIComponent(today)}`,
            ttl
        );
        return flattenSeriesGroups(upcomingJson);
    } catch (err) {
        console.warn('[SB GET SERIES upcoming fallback]:', err.message);
        return [];
    }
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
            const cleanTitle = safestr(s.name ?? s.seriesName ?? s.title, '').trim();

            return {
                id: cleanId,
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
    getTodayYMD,
    fetchSeriesListRaw,
    fetchUpcomingSeriesRaw,
    mapUpcomingSeriesItems
};
