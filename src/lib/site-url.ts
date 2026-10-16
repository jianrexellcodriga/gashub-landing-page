/**
 * Canonical site URL used for metadata, sitemap and robots.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL (set this to your custom domain in Vercel)
 *  2. VERCEL_PROJECT_PRODUCTION_URL (provided automatically by Vercel, no protocol)
 *  3. localhost for local development
 */
export const getSiteUrl = (): string => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;

  return 'http://localhost:3000';
};
