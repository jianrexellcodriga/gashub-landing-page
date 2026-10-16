import { NextResponse } from 'next/server';
import { buildApkDownloadUrl } from '@/lib/apk-download';

// Always evaluate on request so a changed APK_DOWNLOAD_URL / newly uploaded APK is never baked in.
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export async function GET() {
  const target = buildApkDownloadUrl(process.env.APK_DOWNLOAD_URL);

  if (!target) {
    // APK_DOWNLOAD_URL is empty/invalid -> no release has been published yet.
    return new Response('The GasHub Android app is not available for download yet. Please check back soon.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '3600', ...NO_STORE },
    });
  }

  // 302 (temporary) so browsers never remember the target; the file itself is served by Supabase.
  return NextResponse.redirect(target, { status: 302, headers: NO_STORE });
}
