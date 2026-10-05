'use client'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'

export function CartIcon() {
  const items = useCartStore((state) => state.items)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="relative flex items-center">
      <ShoppingBag className="w-4 h-4 stroke-[1.5px]" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </div>
  )
}
