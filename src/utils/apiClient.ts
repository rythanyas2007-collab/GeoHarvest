import {
  FALLBACK_WATERSHEDS,
  FALLBACK_INTERVENTIONS,
  FALLBACK_EVIDENCE,
  FALLBACK_ALERTS,
  FALLBACK_COMPLAINTS,
  FALLBACK_ACTIONS
} from './fallbackData';
import { Watershed, Intervention, FieldEvidence } from '../types';

/**
 * Resilient API client with automatic retries, backoff, auth header propagation,
 * and reliable fallback handling to prevent network blips or container cold-starts
 * from displaying 'Failed to fetch' errors in the UI.
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelayMs?: number;
  skipFallback?: boolean;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function apiFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelayMs = 400,
    skipFallback = false,
    headers = {},
    ...restOptions
  } = options;

  // Prepare standard headers
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>)
  };

  if (restOptions.body && typeof restOptions.body === 'string' && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  // Attach token if present
  try {
    const token = localStorage.getItem('geoharvest_token');
    if (token && !reqHeaders['Authorization']) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: reqHeaders
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      // If server returned 502/503/504 (gateway/starting up), retry
      if ([502, 503, 504].includes(response.status) && attempt < retries) {
        attempt++;
        await sleep(retryDelayMs * Math.pow(2, attempt - 1));
        continue;
      }

      // Non-recoverable HTTP error
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `API error (${response.status}): ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    } catch (err: any) {
      lastError = err;
      // If it's a network error ("Failed to fetch", abort, etc.) and we have retries left
      if (attempt < retries) {
        attempt++;
        await sleep(retryDelayMs * Math.pow(2, attempt - 1));
        continue;
      }
      break;
    }
  }

  // If all attempts failed and fallback is allowed for GET requests
  if (!skipFallback && (!restOptions.method || restOptions.method.toUpperCase() === 'GET')) {
    const fallback = getFallbackForUrl(url);
    if (fallback !== null) {
      console.warn(`[GEOHarvest API] Network momentarily unavailable for ${url}. Providing demonstration dataset fallback.`);
      return fallback as T;
    }
  }

  throw lastError || new Error(`Failed to fetch from ${url}`);
}

function getFallbackForUrl(url: string): any | null {
  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;
  const watershedId = parsedUrl.searchParams.get('watershedId');

  if (pathname.includes('/api/interventions')) {
    let items = FALLBACK_INTERVENTIONS;
    if (watershedId) {
      items = items.filter(i => i.watershedId === watershedId);
    }
    return { interventions: items };
  }

  if (pathname.includes('/api/evidence')) {
    let items = FALLBACK_EVIDENCE;
    if (watershedId && watershedId !== 'ALL') {
      items = items.filter(e => e.watershedId === watershedId);
    }
    return { evidence: items };
  }

  if (pathname.includes('/api/watersheds')) {
    return { watersheds: FALLBACK_WATERSHEDS };
  }

  if (pathname.includes('/api/maintenance/alerts')) {
    return { alerts: FALLBACK_ALERTS };
  }

  if (pathname.includes('/api/complaints')) {
    return { complaints: FALLBACK_COMPLAINTS };
  }

  if (pathname.includes('/api/field-actions')) {
    return { actions: FALLBACK_ACTIONS };
  }

  return null;
}

// Convenient typed helper methods
export async function getInterventions(watershedId?: string): Promise<Intervention[]> {
  const url = watershedId 
    ? `/api/interventions?watershedId=${encodeURIComponent(watershedId)}` 
    : '/api/interventions';
  const res = await apiFetch<{ interventions: Intervention[] }>(url);
  return res.interventions || [];
}

export async function getEvidence(watershedId?: string): Promise<FieldEvidence[]> {
  const url = watershedId && watershedId !== 'ALL'
    ? `/api/evidence?watershedId=${encodeURIComponent(watershedId)}`
    : '/api/evidence';
  const res = await apiFetch<{ evidence: FieldEvidence[] }>(url);
  return res.evidence || [];
}

export async function getWatersheds(): Promise<Watershed[]> {
  const res = await apiFetch<{ watersheds: Watershed[] }>('/api/watersheds');
  return res.watersheds || [];
}
