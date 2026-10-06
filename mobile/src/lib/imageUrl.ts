import { SITE_URL } from '@/config';

/**
 * Product image URLs in the shared database are stored two ways:
 *  - absolute URLs (e.g. Unsplash seeds)
 *  - site-relative paths (e.g. "/products/Stella dress.jpeg") served by the
 *    website's /public folder
 *
 * Relative paths are resolved against EXPO_PUBLIC_SITE_URL so images always
 * come straight from the website and stay in sync with it automatically.
 */
export function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${SITE_URL}/${trimmed.replace(/^\/+/, '')}`;
}

/** Same hero banner used on the website home page. */
export const BANNER_IMAGE_URL = resolveImageUrl('/products/Banner.jpeg');

/** Same lifestyle photo used on the website login page. */
export const LOGIN_IMAGE_URL =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop';
