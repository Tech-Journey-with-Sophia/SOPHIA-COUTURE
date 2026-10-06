/**
 * Brand tokens ported from the website's src/app/globals.css so the mobile app
 * looks like the same Sophia Couture store.
 */
export const colors = {
  black: '#000000',
  white: '#ffffff',
  mist: '#e5e7eb', // --color-soft-mist
  fog: '#f0efe7', // --color-warm-fog (product image background)
  sand: '#f5ebd5', // --color-blush-sand
  charcoal: '#333333', // --color-smoke-charcoal
  onyx: '#1d1d1d', // --color-onyx
  stone: '#cccccc', // --color-stone-gray
} as const;

/** Inter weights loaded in the root layout (matches the website's Google Fonts import). */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_700Bold',
} as const;

/**
 * The website sets `letter-spacing: 0.025em` on the body and uses
 * Tailwind `tracking-widest` (0.1em) on uppercase labels. RN letterSpacing is
 * absolute px, so these approximate those values at the sizes used.
 */
export const tracking = {
  base: 0.3, // 0.025em at 12px
  wide: 1.2, // 0.1em at 12px
  wider: 1.5,
} as const;

export const type = {
  /** Default body copy size used across the website (text-[12px]). */
  xs: 12,
  sm: 14,
  md: 20,
  lg: 24,
  xl: 30,
} as const;
