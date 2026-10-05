'use client'
import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-gray-500 hover:text-black transition flex items-center" title="Log Out">
      <LogOut className="w-5 h-5" />
    </button>
  )
}
