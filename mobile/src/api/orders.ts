import { ORDERS_API_URL } from '@/config';
import { buildAuthCookieHeader } from '@/lib/ssrCookie';
import { SUPABASE_AUTH_STORAGE_KEY, supabase } from '@/lib/supabase';

export interface CheckoutItem {
  product_id: string;
  quantity: number;
}

export interface CheckoutPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  items: CheckoutItem[];
}

export type CheckoutErrorKind = 'auth' | 'validation' | 'network' | 'server';

export class CheckoutError extends Error {
  kind: CheckoutErrorKind;
  constructor(message: string, kind: CheckoutErrorKind) {
    super(message);
    this.name = 'CheckoutError';
    this.kind = kind;
  }
}

export interface PlaceOrderResult {
  order_number: string;
  /** 'api' = existing website backend (includes confirmation email). */
  via: 'api' | 'fallback';
}

/**
 * Places an order through the *existing* website backend:
 *
 *   POST https://sophia-couture.vercel.app/api/orders
 *
 * with the Supabase session attached as an @supabase/ssr-compatible Cookie
 * header, so the route runs its usual zod validation, trusted-price/stock
 * checks, order + order_items inserts and Mailgun confirmation email —
 * exactly like checkout on the website. No website code was changed.
 *
 * If the request cannot be authenticated at the network level (offline host,
 * 401/403), it falls back to inserting the order directly through Supabase
 * RLS (the same tables/policies the website uses). That path skips the
 * Mailgun email because Mailgun must stay server-side; everything else —
 * order number format, 'Confirmed' status, trusted DB prices, stock checks —
 * mirrors the route.
 */
export async function placeOrder(
  payload: CheckoutPayload
): Promise<PlaceOrderResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new CheckoutError('Please sign in to place your order.', 'auth');
  }

  const cookie = buildAuthCookieHeader(session, SUPABASE_AUTH_STORAGE_KEY);

  let response: Response | null = null;
  try {
    response = await fetch(ORDERS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Website unreachable — try the direct Supabase path instead.
    response = null;
  }

  if (response && response.ok) {
    const data = (await response.json().catch(() => null)) as {
      order_number?: string;
      success?: boolean;
    } | null;
    if (data?.order_number) {
      return { order_number: data.order_number, via: 'api' };
    }
    throw new CheckoutError('Checkout failed', 'server');
  }

  if (response && response.status !== 401 && response.status !== 403) {
    // Business/validation errors (400) or server errors (500) are surfaced
    // exactly as the website surfaces them.
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    const message = data?.error || 'Checkout failed';
    throw new CheckoutError(
      message,
      response.status >= 500 ? 'server' : 'validation'
    );
  }

  // 401/403 (session cookie not accepted) or network failure → RLS fallback.
  return placeOrderDirect(payload, session.user.id);
}

/**
 * Mirror of the website's /api/orders business logic executed directly
 * against Supabase under the caller's own RLS policies (orders are insertable
 * only where auth.uid() = user_id, enforced by the database).
 */
async function placeOrderDirect(
  payload: CheckoutPayload,
  userId: string
): Promise<PlaceOrderResult> {
  const productIds = payload.items.map((i) => i.product_id);
  const { data: products, error: productError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('is_active', true);

  if (productError || !products || products.length !== productIds.length) {
    throw new CheckoutError(
      'Invalid or unavailable products in cart',
      'validation'
    );
  }

  let subtotal = 0;
  const orderItems: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }[] = [];

  for (const item of payload.items) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      throw new CheckoutError(
        'Invalid or unavailable products in cart',
        'validation'
      );
    }
    if (product.stock_quantity < item.quantity) {
      throw new CheckoutError(
        `Not enough stock for ${product.name}`,
        'validation'
      );
    }
    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  const total = subtotal; // same rule as the website (taxes/shipping TBD)
  const orderNumber =
    'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      order_number: orderNumber,
      subtotal,
      total,
      customer_name: payload.name,
      customer_email: payload.email,
      phone: payload.phone,
      address: payload.address,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postal_code,
      country: payload.country,
      status: 'Confirmed',
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new CheckoutError(
      orderError?.message ?? 'Could not save order',
      'server'
    );
  }

  const itemsToInsert = orderItems.map((item) => ({
    ...item,
    order_id: order.id,
  }));
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    throw new CheckoutError(
      itemsError.message ?? 'Could not save order items',
      'server'
    );
  }

  return { order_number: order.order_number, via: 'fallback' };
}

export interface AccountOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  total: number;
  customer_name: string;
  customer_email: string;
  created_at: string;
  order_items: {
    id: string;
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }[];
}

/** Same query as the website order history page (RLS-scoped to the user). */
export async function fetchMyOrders(): Promise<AccountOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AccountOrder[];
}
