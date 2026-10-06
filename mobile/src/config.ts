export const SITE_URL = (
  process.env.EXPO_PUBLIC_SITE_URL ?? 'https://sophia-couture.vercel.app'
).replace(/\/+$/, '');

export const ORDERS_API_URL = `${SITE_URL}/api/orders`;
