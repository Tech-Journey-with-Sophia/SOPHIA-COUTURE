import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Search, User as UserIcon } from 'lucide-react'
import { CartIcon } from './CartIcon'
import { LogoutButton } from './LogoutButton'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="w-full sticky top-0 z-50 bg-white">
      {/* Announcement Bar */}
      <div className="bg-black w-full py-1.5 flex items-center justify-center">
        <p className="text-white text-[9px] font-normal uppercase tracking-wider">
          Free 24hr delivery in Lagos | 7-day returns
        </p>
      </div>
      
      {/* Main Nav */}
      <nav className="border-b border-black">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          
          {/* Left: Categories */}
          <div className="flex-1 flex items-center space-x-6">
            <Link href="/" className="text-[12px] font-medium uppercase hover:opacity-70 transition-opacity">Shop</Link>
            <Link href="/contact" className="text-[12px] font-medium uppercase hover:opacity-70 transition-opacity">Contact</Link>
          </div>

          {/* Center: Wordmark */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="font-bold text-[30px] tracking-tight uppercase leading-none text-center whitespace-nowrap">
              SOPHIA COUTURE
            </Link>
          </div>
          
          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end space-x-5">
            <button className="hidden sm:block" aria-label="Search">
              <Search className="w-4 h-4 stroke-[1.5px]" />
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/orders" className="text-[12px] font-medium uppercase hover:opacity-70 transition-opacity">Orders</Link>
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" aria-label="Sign In" className="hover:opacity-70 transition-opacity">
                <UserIcon className="w-4 h-4 stroke-[1.5px]" />
              </Link>
            )}
            <Link href="/cart" aria-label="Cart" className="hover:opacity-70 transition-opacity">
              <CartIcon />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
