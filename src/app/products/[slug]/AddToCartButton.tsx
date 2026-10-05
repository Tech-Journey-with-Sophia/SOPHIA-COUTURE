'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { X } from 'lucide-react'

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState('M')
  const [added, setAdded] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const handleAdd = () => {
    addItem({
      id: `${product.id}-${size}`,
      product_id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity,
      stock_quantity: product.stock_quantity,
      size: size
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Size Selector */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[12px] uppercase font-bold text-black tracking-widest">Size</span>
          <button 
            onClick={() => setShowSizeGuide(true)}
            className="text-[10px] uppercase tracking-widest text-[#333333] underline underline-offset-4 hover:text-black transition-colors"
          >
            Size Guide
          </button>
        </div>
        <div className="flex gap-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`h-10 flex-1 border border-black text-[12px] uppercase tracking-widest transition-colors ${
                size === s ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-[12px] uppercase font-bold text-black tracking-widest">Qty</label>
        <select
          id="quantity"
          className="input-field w-24 rounded-none"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {[...Array(Math.min(10, product.stock_quantity))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <span className="text-[12px] text-[#333333] ml-2">{product.stock_quantity} available</span>
      </div>
      
      <button
        onClick={handleAdd}
        disabled={added}
        className="btn-primary w-full h-14 uppercase tracking-widest rounded-none disabled:bg-[#333333] disabled:cursor-not-allowed"
      >
        {added ? 'ADDED TO CART' : 'ADD TO CART'}
      </button>

      {/* Size Guide Modal (Minimalist) */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-sm p-4">
          <div className="bg-white border border-black p-8 w-full max-w-md relative">
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-black hover:opacity-50 transition-opacity"
            >
              <X className="w-5 h-5 stroke-[1.5px]" />
            </button>
            <h2 className="text-[14px] uppercase tracking-widest font-bold mb-6 text-center border-b border-black pb-4">Size Guide</h2>
            <table className="w-full text-left text-[12px] text-black">
              <thead>
                <tr className="border-b border-[#cccccc]">
                  <th className="py-2 font-medium">Size</th>
                  <th className="py-2 font-medium">Chest (in)</th>
                  <th className="py-2 font-medium">Waist (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#cccccc]"><td className="py-2">S</td><td className="py-2">34 - 36</td><td className="py-2">28 - 30</td></tr>
                <tr className="border-b border-[#cccccc]"><td className="py-2">M</td><td className="py-2">38 - 40</td><td className="py-2">32 - 34</td></tr>
                <tr className="border-b border-[#cccccc]"><td className="py-2">L</td><td className="py-2">42 - 44</td><td className="py-2">36 - 38</td></tr>
                <tr className="border-b border-[#cccccc]"><td className="py-2">XL</td><td className="py-2">46 - 48</td><td className="py-2">40 - 42</td></tr>
                <tr><td className="py-2">XXL</td><td className="py-2">50 - 52</td><td className="py-2">44 - 46</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
