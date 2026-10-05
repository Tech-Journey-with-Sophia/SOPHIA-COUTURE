import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from './AddToCartButton'

export const revalidate = 0

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-16 lg:gap-32">
        {/* Left: Image (Split view style) */}
        <div className="md:w-1/2">
          <div className="w-full aspect-[3/4] bg-[#f0efe7] relative overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black text-[12px]">No Image</div>
            )}
          </div>
        </div>
        
        {/* Right: Details */}
        <div className="md:w-1/2 flex flex-col pt-8 md:pt-16">
          <div className="mb-4">
            <span className="text-[12px] font-medium text-black uppercase tracking-[0.025em]">{product.category}</span>
          </div>
          <h1 className="text-[30px] font-normal text-black leading-tight mb-2">{product.name}</h1>
          <p className="text-[20px] font-medium text-black mb-10">${product.price.toFixed(2)}</p>
          
          <div className="border-t border-black pt-8 mb-10">
            <p className="text-[14px] leading-[1.33] text-black tracking-[0.35px] whitespace-pre-wrap">{product.description}</p>
          </div>
          
          <div>
            {product.stock_quantity > 0 ? (
              <AddToCartButton product={product} />
            ) : (
              <div className="bg-[#e5e7eb] text-black p-4 text-[12px] uppercase font-bold text-center border border-black">
                Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
