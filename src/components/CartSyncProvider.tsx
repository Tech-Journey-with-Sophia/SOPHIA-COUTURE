'use client'

import { type ReactNode, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useCartStore } from '@/store/cartStore'

export function CartSyncProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const supabase = createClient()

    // 1. Fetch the cart immediately when the website loads
    useCartStore.getState().fetchCart()

    // 2. Whenever the user logs in or logs out, automatically refresh their cart!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      useCartStore.getState().fetchCart()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return children // Renders your website normally
}