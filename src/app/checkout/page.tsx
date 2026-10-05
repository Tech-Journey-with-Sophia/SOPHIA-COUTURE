'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function CheckoutPage() {
  const { items, clearCart, getTotal } = useCartStore()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email)
      }
    })
  }, [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-24">
        <h1 className="text-[20px] font-bold uppercase mb-4 tracking-widest border-b border-black pb-4">Your bag is empty</h1>
        <button onClick={() => router.push('/')} className="btn-primary rounded-none mt-8 tracking-widest uppercase px-12">
          Return to shop
        </button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email') || email,
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      postal_code: formData.get('postal_code'),
      country: formData.get('country'),
      items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      clearCart()
      router.push(`/confirmation?order=${data.order_number}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1024px] mx-auto flex flex-col md:flex-row gap-16 py-12 px-4 sm:px-6 lg:px-8">
      <div className="md:w-2/3">
        <h1 className="text-[24px] font-bold uppercase tracking-widest mb-12 border-b border-black pb-4">Checkout</h1>
        {error && <div className="bg-black text-white p-4 mb-8 text-[12px] uppercase">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <h2 className="text-[14px] uppercase tracking-widest font-bold mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">Full Name</label>
                <input required name="name" type="text" className="input-field w-full rounded-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">Email</label>
                <input required name="email" type="email" defaultValue={email} className="input-field w-full rounded-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">Phone Number</label>
                <input required name="phone" type="tel" className="input-field w-full rounded-none" />
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-10">
            <h2 className="text-[14px] uppercase tracking-widest font-bold mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">Address</label>
                <input required name="address" type="text" className="input-field w-full rounded-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">City</label>
                <input required name="city" type="text" className="input-field w-full rounded-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">State / Province</label>
                <input required name="state" type="text" className="input-field w-full rounded-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">Postal Code</label>
                <input name="postal_code" type="text" className="input-field w-full rounded-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider mb-2">Country</label>
                <input required name="country" type="text" className="input-field w-full rounded-none" />
              </div>
            </div>
          </div>

          <div className="border-t border-black pt-10">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-14 rounded-none uppercase tracking-widest disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : 'PLACE ORDER'}
            </button>
          </div>
        </form>
      </div>

      <div className="md:w-1/3">
        <div className="border border-black p-8 sticky top-24">
          <h2 className="text-[14px] uppercase tracking-widest font-bold mb-6 border-b border-black pb-4">In Your Cart</h2>
          <ul className="divide-y divide-black mb-8">
            {items.map(item => (
              <li key={item.id} className="py-4 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-16 bg-[#f0efe7] overflow-hidden flex-shrink-0">
                     {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-[12px] font-medium uppercase">{item.name}</p>
                    <p className="text-[12px] text-[#333333]">Qty: {item.quantity}</p>
                    {item.size && <p className="text-[12px] text-[#333333]">Size: {item.size}</p>}
                    {item.color && <p className="text-[12px] text-[#333333]">Color: {item.color}</p>}
                  </div>
                </div>
                <p className="text-[12px] font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-black pt-4 flex justify-between font-bold text-[14px] uppercase">
            <span>Total</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
