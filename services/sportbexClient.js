const fetch = require('node-fetch');
const {
  SPORTBEX_API_KEY,
  SPORTBEX_BASE_URL,
  CACHE_TTL
} = require('../config/sportbexConfig');

const apiCache = new Map();

function shouldSkipTimestampQuery(endpoint) {
  const ep = String(endpoint || '');
  return ep.includes('/api/live-score/series');
}

async function sbGet(endpoint, ttlMs = CACHE_TTL.LIVE_MS) {
  try {
    const cleanTtl = typeof ttlMs === 'number' && Number.isFinite(ttlMs)
      ? ttlMs
      : CACHE_TTL.LIVE_MS;

    const now = Date.now();
    const cached = apiCache.get(endpoint);
    if (cleanTtl > 0 && cached && (now - cached.timestamp) < cleanTtl) {
      return cached.data;
    }

    const baseUrl = String(SPORTBEX_BASE_URL || '').replace(/\/+$/, '');
    const cleanEndpoint = String(endpoint || '').startsWith('/')
      ? String(endpoint || '')
      : `/${String(endpoint || '')}`;

    let url = `${baseUrl}${cleanEndpoint}`;
    if (!shouldSkipTimestampQuery(cleanEndpoint)) {
      const sep = cleanEndpoint.includes('?') ? '&' : '?';
      url = `${url}${sep}_ts=${now}`;
    }

    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'sportbex-api-key': String(SPORTBEX_API_KEY || '').trim(),
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    const text = await resp.text();
    if (!resp.ok) {
      console.error(
        `[SPORTBEX API ERROR] status=${resp.status} endpoint=${cleanEndpoint} body=${text.slice(0, 300)}`
      );
      return cached ? cached.data : null;
    }

    const json = JSON.parse(text);
    const count = Array.isArray(json?.data)
      ? json.data.length
      : (Array.isArray(json) ? json.length : 1);

    console.log(
      `[SPORTBEX API OK] status=${resp.status} endpoint=${cleanEndpoint} count=${count}`
    );

    if (cleanTtl > 0) {
      apiCache.set(endpoint, { data: json, timestamp: now });
    }
    return json;
  } catch (err) {
    console.error(
      `[SPORTBEX FETCH EXCEPTION] endpoint=${endpoint} err=${err.message}`
    );
    const cached = apiCache.get(endpoint);
    return cached ? cached.data : null;
  }
}

module.exports = {
  sbGet,
  CACHE_TTL
};
