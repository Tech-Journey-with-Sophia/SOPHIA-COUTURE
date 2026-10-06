import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface CartItem {
  id: string; // This will now be the actual UUID from Supabase
  product_id: string;
  slug: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock_quantity: number;
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartId: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      set({ items: [], cartId: null, isLoading: false });
      return;
    }

    let { data: cart } = await supabase.from('carts').select('*').eq('user_id', user.id).single();
    if (!cart) {
      const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select().single();
      cart = newCart;
    }
    if (!cart) return;

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        size,
        color,
        product_id,
        products (
          name,
          price,
          image_url,
          stock_quantity,
          slug
        )
      `)
      .eq('cart_id', cart.id);

    if (error) {
       console.error("Error fetching cart from Supabase:", error);
       set({ isLoading: false });
       return;
    }

    const formattedItems = cartItems.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      slug: item.products.slug || item.product_id,
      name: item.products.name,
      price: item.products.price,
      image_url: item.products.image_url,
      quantity: item.quantity,
      stock_quantity: item.products.stock_quantity,
      size: item.size,
      color: item.color,
    }));

    set({ items: formattedItems, cartId: cart.id, isLoading: false });
  },

  addItem: async (item) => {
    const { cartId, items, fetchCart } = get();
    if (!cartId) await fetchCart();
    const currentCartId = get().cartId;
    
    if (!currentCartId) {
        alert("Please log in to add items to your cart.");
        return; 
    }

    const existing = items.find(i => i.product_id === item.product_id && i.size === item.size);

    if (existing) {
      const newQty = Math.min(existing.quantity + item.quantity, existing.stock_quantity);
      await supabase.from('cart_items').update({ quantity: newQty }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: currentCartId,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
    }
    await get().fetchCart();
  },

  removeItem: async (id) => {
    await supabase.from('cart_items').delete().eq('id', id);
    await get().fetchCart();
  },

  updateQuantity: async (id, quantity) => {
    await supabase.from('cart_items').update({ quantity }).eq('id', id);
    await get().fetchCart();
  },

  clearCart: async () => {
    const currentCartId = get().cartId;
    if (!currentCartId) return;
    await supabase.from('cart_items').delete().eq('cart_id', currentCartId);
    await get().fetchCart();
  },

  getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
}));

export function useCartCount(): number {
  return useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
}
