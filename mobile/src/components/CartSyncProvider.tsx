import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Fetch cart immediately on mount
    useCartStore.getState().fetchCart();

    // Refetch cart whenever the user logs in or out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      useCartStore.getState().fetchCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}