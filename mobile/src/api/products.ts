import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Same query the website home page runs (src/app/page.tsx): all active
 * products, newest first, always fresh — so edits made through the website
 * appear here automatically.
 */
export async function fetchActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

/** Same query as the website product page (src/app/products/[slug]/page.tsx). */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    throw error;
  }
  return data as Product;
}

/** Distinct categories present in the active catalog. */
export function deriveCategories(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    if (p.category) set.add(p.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** Client-side search over name + description (case-insensitive). */
export function filterProducts(
  products: Product[],
  search: string,
  category: string
): Product[] {
  let result = products;
  if (category && category !== 'All') {
    result = result.filter((p) => p.category === category);
  }
  const q = search.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q)
    );
  }
  return result;
}
