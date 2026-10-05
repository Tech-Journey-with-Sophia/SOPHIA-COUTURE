import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="relative w-full aspect-[16/9] md:aspect-[16/6] bg-[#e5e7eb] flex items-center justify-center">
        <img 
          src="/products/Banner.jpeg" 
          alt="The Ultimate Outfits" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 flex flex-col items-center mt-12 md:mt-24">
          <h1 className="text-white text-[30px] font-normal tracking-[0.025em] mb-6 drop-shadow-md">
            THE ULTIMATE OUTFITS
          </h1>
          <Link href="#shop" className="border border-white bg-transparent text-white text-[12px] font-medium rounded-[4px] px-6 py-2 transition-colors hover:bg-white hover:text-black">
            SHOP COLLECTION
          </Link>
        </div>
      </section>

      {/* Slide Pagination Dots (Static placeholder) */}
      <div className="flex gap-2 justify-center mt-6 mb-16">
        <div className="w-8 h-0.5 bg-black"></div>
        <div className="w-8 h-0.5 bg-[#cccccc]"></div>
      </div>

      {/* Product Grid Section */}
      <section id="shop" className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mb-32">
        <div className="flex items-center justify-between mb-8 border-b border-black pb-4">
          <h2 className="text-[20px] font-bold">New & Trending</h2>
          
          {/* Category Tabs */}
          <div className="hidden md:flex items-center gap-4">
            <button className="bg-black text-white text-[12px] font-medium px-4 py-1.5 uppercase">All</button>
            <button className="text-black text-[12px] font-medium px-4 py-1.5 uppercase">Dresses/Set</button>
            <button className="text-black text-[12px] font-medium px-4 py-1.5 uppercase">Skirt</button>
            <button className="text-black text-[12px] font-medium px-4 py-1.5 uppercase">Two-piece</button>
          </div>
        </div>
        
        {!products || products.length === 0 ? (
          <p className="text-[#333333] text-[14px]">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col relative">
                
                {/* Product Image */}
                <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] w-full overflow-hidden bg-[#f0efe7] mb-3">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )}
                  {/* Quick Add overlay */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-quick-add shadow-sm">
                      Quick Add
                    </button>
                  </div>
                </Link>

                {/* Product Details */}
                <Link href={`/products/${product.slug}`} className="flex flex-col">
                  <h3 className="text-[12px] font-normal text-black leading-snug">{product.name}</h3>
                  <p className="mt-1 text-[12px] font-normal text-black">${product.price.toFixed(2)}</p>
                  {product.stock_quantity === 0 && (
                    <p className="text-[12px] text-black mt-1 font-medium">Out of stock</p>
                  )}
                </Link>

                {/* Wishlist Heart Icon Placeholder */}
                <button className="absolute top-3 right-3 text-black hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 stroke-[1.5px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      
    </div>
  )
}
