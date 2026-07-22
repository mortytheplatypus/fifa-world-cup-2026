export const DATA_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const FORCE_REFRESH_STORAGE_KEY = 'fifa-wc-force-refresh-cache';
export const FORCE_REFRESH_QUERY_PARAM = 'refreshCache';

const cache = new Map();
const evictHandlers = new Set();

let forceRefreshActivated = false;
let httpCacheBustPending = false;

function hasPersistentForceRefreshEnv() {
  return process.env.REACT_APP_FORCE_REFRESH_CACHE === 'true';
}

function hasOneShotForceRefreshSignals() {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.localStorage.getItem(FORCE_REFRESH_STORAGE_KEY) === '1') {
    return true;
  }

  return new URLSearchParams(window.location.search).get(FORCE_REFRESH_QUERY_PARAM) === '1';
}

function clearOneShotForceRefreshSignals() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(FORCE_REFRESH_STORAGE_KEY);

  const url = new URL(window.location.href);
  if (!url.searchParams.has(FORCE_REFRESH_QUERY_PARAM)) {
    return;
  }

  url.searchParams.delete(FORCE_REFRESH_QUERY_PARAM);
  window.history.replaceState({}, '', url);
}

function shouldActivateForceRefresh() {
  if (forceRefreshActivated) {
    return false;
  }

  return hasPersistentForceRefreshEnv() || hasOneShotForceRefreshSignals();
}

function activateForceRefreshIfNeeded() {
  if (!shouldActivateForceRefresh()) {
    return false;
  }

  forceRefreshActivated = true;
  httpCacheBustPending = true;
  evictAllDataCache();

  if (!hasPersistentForceRefreshEnv()) {
    clearOneShotForceRefreshSignals();
  }

  return true;
}

export function isForceRefreshCacheEnabled() {
  return hasPersistentForceRefreshEnv() || hasOneShotForceRefreshSignals();
}

export function setForceRefreshCache(enabled = true) {
  if (typeof window === 'undefined') {
    return;
  }

  if (enabled) {
    window.localStorage.setItem(FORCE_REFRESH_STORAGE_KEY, '1');
  } else {
    window.localStorage.removeItem(FORCE_REFRESH_STORAGE_KEY);
  }

  forceRefreshActivated = false;
  httpCacheBustPending = false;
  evictAllDataCache();
}

export function registerCacheEvictor(handler) {
  evictHandlers.add(handler);
  return () => evictHandlers.delete(handler);
}

export function evictAllDataCache() {
  cache.clear();
  evictHandlers.forEach((handler) => handler());
}

export function getCachedData(key) {
  activateForceRefreshIfNeeded();

  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.promise;
}

export function setCachedData(key, promise, ttlMs = DATA_CACHE_TTL_MS) {
  activateForceRefreshIfNeeded();
  cache.set(key, { promise, expiresAt: Date.now() + ttlMs });
  promise.catch(() => cache.delete(key));
}

export function appendCacheBust(path) {
  activateForceRefreshIfNeeded();

  if (!httpCacheBustPending) {
    return path;
  }

  httpCacheBustPending = false;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}_=${Date.now()}`;
}
