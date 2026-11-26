const SPORTBEX_API_KEY =
  process.env.SPORTBEX_API_KEY || 'VweraocImoSnBFD3hIPylss6EnBjZYNjFe5v8qad';

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

