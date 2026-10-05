import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await searchParams

  if (user) {
    redirect('/')
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-white">
      {/* Left: Image (Top on mobile) */}
      <div className="md:w-1/2 h-[40vh] md:h-screen relative overflow-hidden bg-[#f0efe7]">
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop" 
          alt="Sophia Couture Lifestyle"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      {/* Right: Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8 sm:p-16 lg:p-24 bg-white h-screen overflow-y-auto">
        <div className="w-full max-w-sm">
          <LoginForm
            initialError={
              error === 'oauth_callback'
                ? 'Google sign-in could not be completed. Check the Google provider and Supabase redirect URL settings.'
                : ''
            }
          />
        </div>
      </div>
    </div>
  )
}
