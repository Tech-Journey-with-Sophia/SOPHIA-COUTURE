'use client'
import { ArrowRight } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full border-t border-black bg-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col md:flex-row justify-between items-start gap-16">
        
        {/* Left: Brand / Legal */}
        <div className="flex flex-col gap-6">
          <span className="font-bold text-[24px] tracking-tight uppercase leading-none">
            SOPHIA COUTURE
          </span>
          <p className="text-[10px] uppercase tracking-widest text-[#333333]">
            © {new Date().getFullYear()} Sophia Couture MVP. All rights reserved.
          </p>
        </div>

        {/* Right: Newsletter (Waitlist) */}
        <div className="w-full md:w-[400px] flex flex-col group">
          <label htmlFor="newsletter" className="text-[12px] uppercase font-bold text-black tracking-widest mb-3">
            Join the list for early drops. Get 10% off your first order.
          </label>
          <div className="relative flex items-center border-b border-black/30 transition-colors duration-500 ease-out focus-within:border-black hover:border-black group-hover:border-black overflow-hidden">
            <input 
              id="newsletter" 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
              className="w-full bg-transparent text-[12px] text-black tracking-widest uppercase py-3 placeholder:text-black/30 placeholder:transition-opacity placeholder:duration-500 focus:outline-none focus:placeholder:opacity-0"
            />
            <button 
              type="button"
              className="absolute right-0 text-black transform translate-x-2 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:translate-x-0 group-focus-within:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 p-2"
              aria-label="Subscribe"
            >
              <ArrowRight className="w-4 h-4 stroke-[1.5px]" />
            </button>
            {/* Animated Bottom Border Line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full bg-black origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-within:scale-x-100 group-hover:scale-x-100"></div>
          </div>
        </div>

      </div>
    </footer>
  )
}
