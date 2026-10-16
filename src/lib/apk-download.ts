/**
 * Helpers for the "Download App" buttons (Android APK only for now).
 *
 * Flow:
 *   Button (<a href="/api/download-apk">)
 *     -> src/app/api/download-apk/route.ts (reads APK_DOWNLOAD_URL at request time)
 *     -> 302 redirect to the Supabase public URL of gashub.apk
 *
 * This file contains only pure helpers (no env access), so it is safe to import from both
 * client components (Header) and server code (the route handler).
 */

/** Same-origin path the Download App buttons point to. */
export const APK_DOWNLOAD_PATH = '/api/download-apk';

/** File name the browser saves the APK as. Keep it equal to the object name in the bucket. */
export const APK_FILE_NAME = 'gashub.apk';

/**
 * Supabase serves public files through a CDN keyed by the full URL, so re-uploading
 * "gashub.apk" under the same name can keep serving the old file for a while (default
 * cache-control is 1 hour). Adding a changing query value forces a fresh pull once per window.
 * New uploads are therefore picked up within this many milliseconds.
 */
export const APK_CACHE_WINDOW_MS = 60_000;

/**
 * Turns the raw APK_DOWNLOAD_URL env value into the final redirect target:
 *  - validates it is a proper http(s) URL
 *  - forces a download with the right file name (`?download=gashub.apk` makes Supabase send
 *    Content-Disposition: attachment)
 *  - adds a cache-busting `v` value so the newest uploaded gashub.apk is always served
 *
 * Returns `null` when the value is missing or invalid (e.g. no APK uploaded / URL not pasted yet).
 */
export function buildApkDownloadUrl(rawUrl: string | undefined | null, now = Date.now()) {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  url.searchParams.set('download', APK_FILE_NAME);
  url.searchParams.set('v', String(Math.floor(now / APK_CACHE_WINDOW_MS)));

  return url.toString();
}
