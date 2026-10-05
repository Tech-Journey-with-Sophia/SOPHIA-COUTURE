'use client'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null // Prevent hydration mismatch

  return (
    <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-[30px] font-normal tracking-tight text-black mb-12 uppercase text-center border-b border-black pb-6">Your Cart</h1>
      
      {items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-black text-[14px] mb-8 uppercase tracking-widest">Your cart is currently empty.</p>
          <Link href="/" className="btn-primary rounded-none tracking-widest uppercase px-12">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/3">
            <ul className="divide-y divide-black border-t border-b border-black">
              {items.map((item) => (
                <li key={item.id} className="py-8 flex">
                  <div className="flex-shrink-0 w-32 h-40 bg-[#f0efe7] overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-black uppercase">No Image</div>
                    )}
                  </div>
                  <div className="ml-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-[14px] text-black">
                        <h3 className="uppercase tracking-[0.025em]"><Link href={`/products/${item.product_id}`} className="hover:underline">{item.name}</Link></h3>
                        <p className="ml-4 font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-2 text-[12px] text-[#333333]">${item.price.toFixed(2)} each</p>
                      {item.size && <p className="mt-2 text-[12px] text-black font-medium uppercase">Size: {item.size}</p>}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        className="input-field rounded-none py-1 px-2 w-16 text-[12px]"
                      >
                        {[...Array(Math.min(10, item.stock_quantity))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[12px] uppercase tracking-widest text-black underline underline-offset-4 hover:opacity-70 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/3 h-fit border border-black p-8">
            <h2 className="text-[14px] uppercase tracking-widest font-bold text-black mb-6 border-b border-black pb-4">Order Summary</h2>
            <div className="flex justify-between text-[14px] text-black mb-6">
              <p className="uppercase">Subtotal</p>
              <p>${getTotal().toFixed(2)}</p>
            </div>
            <p className="text-[12px] text-[#333333] mb-8 leading-[1.33]">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="btn-primary w-full flex items-center justify-center rounded-none uppercase tracking-widest h-14"
            >
              Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
