import { AppState } from 'react-native';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cartLines, ensureCart, hydrateCartLines, readCartLines, writeCartLines } from '@/api/cartSync';
import { useCartStore } from '@/store/cartStore';

export function CartSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let active = true;
    let hydrated = useCartStore.persist.hasHydrated();
    let activeUserId: string | null | undefined;
    let cartId: string | null = null;
    let applyingRemote = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let writes = Promise.resolve();
    let transitions = Promise.resolve();

    const queueWrite = (job: () => Promise<void>) => {
      writes = writes.then(job).catch((error) => {
        console.error('Cart sync failed:', error);
      });
      return writes;
    };

    const refreshRemote = (userId: string, currentCartId: string) =>
      queueWrite(async () => {
        if (!active || activeUserId !== userId) return;
        const lines = await readCartLines(currentCartId);
        const items = await hydrateCartLines(lines);
        if (!active || activeUserId !== userId) return;
        applyingRemote = true;
        useCartStore.setState({ items, ownerUserId: userId });
        applyingRemote = false;
      });

    const switchUser = (userId: string | null) => {
      transitions = transitions.then(async () => {
        if (!active || !hydrated || userId === activeUserId) return;
        await writes;

        if (channel) {
          void supabase.removeChannel(channel);
          channel = null;
        }

        if (!userId) {
          const local = useCartStore.getState();
          const hadAccountCart = activeUserId != null || local.ownerUserId != null;
          activeUserId = null;
          cartId = null;
          if (hadAccountCart) {
            applyingRemote = true;
            useCartStore.setState({ items: [], ownerUserId: null });
            applyingRemote = false;
          }
          return;
        }

        try {
          const nextCartId = await ensureCart(userId);
          const remoteLines = await readCartLines(nextCartId);
          const local = useCartStore.getState();
          const guestLines = local.ownerUserId == null ? cartLines(local.items) : [];
          const items = await hydrateCartLines([...remoteLines, ...guestLines]);
          if (!active) return;

          activeUserId = userId;
          cartId = nextCartId;
          applyingRemote = true;
          useCartStore.setState({ items, ownerUserId: userId });
          applyingRemote = false;
          await writeCartLines(nextCartId, items);
          channel = supabase
            .channel(`cart-items-${nextCartId}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'cart_items',
                filter: `cart_id=eq.${nextCartId}`,
              },
              () => void refreshRemote(userId, nextCartId)
            )
            .subscribe();
        } catch (error) {
          console.error('Could not load account cart:', error);
        }
      }).catch((error) => {
        console.error('Could not switch account cart:', error);
      });
      return transitions;
    };

    const unsubscribeStore = useCartStore.subscribe((state, previous) => {
      if (
        !active ||
        applyingRemote ||
        !activeUserId ||
        !cartId ||
        state.ownerUserId !== activeUserId ||
        state.items === previous.items
      ) return;

      const currentCartId = cartId;
      queueWrite(() => writeCartLines(currentCartId, state.items));
    });

    const syncSession = () => {
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) throw error;
        return switchUser(data.session?.user.id ?? null);
      }).catch((error) => console.error('Could not load cart session:', error));
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void switchUser(session?.user.id ?? null), 0);
    });

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && activeUserId && cartId) {
        void refreshRemote(activeUserId, cartId);
      }
    });
    const refreshInterval = setInterval(() => {
      if (AppState.currentState === 'active' && activeUserId && cartId) {
        void refreshRemote(activeUserId, cartId);
      }
    }, 10000);

    let stopHydration: (() => void) | undefined;
    if (hydrated) {
      syncSession();
    } else {
      stopHydration = useCartStore.persist.onFinishHydration(() => {
        hydrated = true;
        syncSession();
      });
    }

    return () => {
      active = false;
      stopHydration?.();
      unsubscribeStore();
      subscription.unsubscribe();
      appStateSubscription.remove();
      clearInterval(refreshInterval);
      if (channel) void supabase.removeChannel(channel);
    };
  }, []);

  return children;
}