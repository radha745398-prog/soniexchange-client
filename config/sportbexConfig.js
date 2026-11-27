const SPORTBEX_API_KEY =
  process.env.SPORTBEX_API_KEY || 'qphb2rf1A2PMpmZBoUd0w4VUqVBY6M8cND3w6fdu';

const SPORTBEX_BASE_URL =
  process.env.SPORTBEX_BASE_URL || 'https://trial-api.sportbex.com';

const MASTER_ADMIN_KEY = process.env.MASTER_ADMIN_KEY || '';

const CACHE_TTL = {
  LIVE_MS: 800,
  SERIES_MS: 15000
};

module.exports = {
  SPORTBEX_API_KEY,
  SPORTBEX_BASE_URL,
  MASTER_ADMIN_KEY,
  CACHE_TTL
};

