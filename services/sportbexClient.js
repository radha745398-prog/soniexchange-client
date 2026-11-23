const fetch = require('node-fetch');
const {
  SPORTBEX_API_KEY,
  SPORTBEX_BASE_URL,
  CACHE_TTL
} = require('../config/sportbexConfig');

const apiCache = new Map();

async function sbGet(endpoint, ttlMs = CACHE_TTL.LIVE_MS) {
  try {
    const now = Date.now();
    const cached = apiCache.get(endpoint);
    if (ttlMs > 0 && cached && (now - cached.timestamp) < ttlMs) {
      return cached.data;
    }

    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${SPORTBEX_BASE_URL}${endpoint}${sep}_ts=${now}`;
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
        `[SPORTBEX API ERROR] status=${resp.status} endpoint=${endpoint} body=${text.slice(0, 300)}`
      );
      return cached ? cached.data : null;
    }

    const json = JSON.parse(text);
    const count = Array.isArray(json?.data)
      ? json.data.length
      : (Array.isArray(json) ? json.length : 1);

    console.log(
      `[SPORTBEX API OK] status=${resp.status} endpoint=${endpoint} count=${count}`
    );

    if (ttlMs > 0) {
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

