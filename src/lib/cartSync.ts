import { createClient } from '@/utils/supabase/client';
import type { CartItem } from '@/store/cartStore';

export interface CartLine {
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
}

type Client = ReturnType<typeof createClient>;

const lineKey = (line: CartLine) =>
  `${line.product_id}|${line.size ?? ''}|${line.color ?? ''}`;

const lineId = (line: CartLine) => {
  if (line.color) return `${line.product_id}-${line.size ?? ''}-${line.color}`;
  return line.size ? `${line.product_id}-${line.size}` : line.product_id;
};

export function cartLines(items: CartItem[]): CartLine[] {
  return items.map(({ product_id, quantity, size, color }) => ({
    product_id,
    quantity,
    size,
    color,
  }));
}

export async function ensureCart(client: Client, userId: string): Promise<string> {
  const { data: carts, error: readError } = await client
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (readError) throw readError;
  if (carts?.[0]?.id) return carts[0].id;

  const { data: cart, error: insertError } = await client
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return cart.id;
}

export async function readCartLines(client: Client, cartId: string): Promise<CartLine[]> {
  const { data, error } = await client
    .from('cart_items')
    .select('product_id, quantity, size, color')
    .eq('cart_id', cartId);

  if (error) throw error;
  return (data ?? []).map((item) => ({
    product_id: item.product_id,
    quantity: Number(item.quantity),
    size: item.size || undefined,
    color: item.color || undefined,
  }));
}

export async function hydrateCartLines(
  client: Client,
  lines: CartLine[]
): Promise<CartItem[]> {
  const productIds = Array.from(new Set(lines.map((line) => line.product_id)));
  if (productIds.length === 0) return [];

  const { data, error } = await client
    .from('products')
    .select('id, name, price, image_url, stock_quantity')
    .in('id', productIds)
    .eq('is_active', true);

  if (error) throw error;
  const products = new Map((data ?? []).map((product) => [product.id, product]));
  const items = new Map<string, CartItem>();

  for (const line of lines) {
    const product = products.get(line.product_id);
    const quantity = Math.floor(Number(line.quantity));
    if (!product || !Number.isFinite(quantity) || quantity < 1) continue;

    const stock = Number(product.stock_quantity);
    if (stock < 1) continue;

    const normalized = {
      ...line,
      size: line.size || undefined,
      color: line.color || undefined,
    };
    const key = lineKey(normalized);
    const existing = items.get(key);
    const mergedQuantity = Math.min((existing?.quantity ?? 0) + quantity, stock);

    items.set(key, {
      id: lineId(normalized),
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url ?? '',
      quantity: mergedQuantity,
      stock_quantity: stock,
      size: normalized.size,
      color: normalized.color,
    });
  }

  return Array.from(items.values());
}

export async function writeCartLines(
  client: Client,
  cartId: string,
  items: CartItem[]
): Promise<void> {
  const { data: existing, error: readError } = await client
    .from('cart_items')
    .select('id, product_id, quantity, size, color')
    .eq('cart_id', cartId);

  if (readError) throw readError;

  const existingByKey = new Map<string, typeof existing>();
  for (const row of existing ?? []) {
    const key = lineKey({
      product_id: row.product_id,
      quantity: Number(row.quantity),
      size: row.size || undefined,
      color: row.color || undefined,
    });
    const rows = existingByKey.get(key) ?? [];
    rows.push(row);
    existingByKey.set(key, rows);
  }

  const keepIds = new Set<string>();
  const inserts: (CartLine & { cart_id: string })[] = [];
  const updates: { id: string; quantity: number }[] = [];

  for (const line of cartLines(items)) {
    const rows = existingByKey.get(lineKey(line)) ?? [];
    const current = rows[0];
    if (!current) {
      inserts.push({ ...line, size: line.size ?? '', color: line.color ?? '', cart_id: cartId });
      continue;
    }

    keepIds.add(current.id);
    if (Number(current.quantity) !== line.quantity) {
      updates.push({ id: current.id, quantity: line.quantity });
    }
  }

  const staleIds = (existing ?? [])
    .filter((row) => !keepIds.has(row.id))
    .map((row) => row.id);

  for (const update of updates) {
    const { error } = await client
      .from('cart_items')
      .update({ quantity: update.quantity, updated_at: new Date().toISOString() })
      .eq('id', update.id);
    if (error) throw error;
  }

  if (staleIds.length > 0) {
    const { error } = await client.from('cart_items').delete().in('id', staleIds);
    if (error) throw error;
  }

  if (inserts.length > 0) {
    const { error } = await client.from('cart_items').insert(inserts);
    if (error) throw error;
  }

  const { error: cartError } = await client
    .from('carts')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', cartId);
  if (cartError) throw cartError;
}