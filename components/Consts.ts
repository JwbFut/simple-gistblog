export const ORIGIN_URL = "https://blogs.jawbts.org";
export const MAX_URLS_PER_SITEMAP = 40000;

// cache for:
// won't refetch more often than that & will background refresh after that:
export const API_CACHE_TIME = 60 * 30; // at least 30 minutes
// will refetch synchronously if cache is older than that:
export const API_MAX_CACHE_TIME = 60 * 60 * 24; // at most 24 hours
export const POST_CACHE_TIME = 60 * 60 * 12; // at least 12 hours
export const POST_MAX_CACHE_TIME = 60 * 60 * 24 * 30; // at most 30 days