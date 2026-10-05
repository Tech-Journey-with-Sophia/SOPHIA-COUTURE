'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

export function LoginForm({ initialError = '' }: { initialError?: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const [message, setMessage] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Google sign-in failed.')
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (authError) throw authError
        if (data.session) {
          router.replace('/')
          return
        }
        setMessage('Check your email to confirm your account, then sign in.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (authError) throw authError
        router.replace('/')
        return
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      <Link href="/" className="text-[20px] font-bold uppercase tracking-tight text-black mb-12">
        SOPHIA COUTURE
      </Link>
      
      <h1 className="text-[30px] font-normal uppercase tracking-tight text-black mb-2">
        {mode === 'signup' ? 'Create Account' : 'Sign In'}
      </h1>
      <p className="text-[12px] text-[#333333] mb-12">
        {mode === 'signup' ? 'Already have an account? ' : "Don't have an account yet? "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'signin' : 'signup')
            setError('')
            setMessage('')
          }}
          className="text-black underline underline-offset-4 font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
        >
          {mode === 'signup' ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
      {message && <p role="status" className="text-[12px] text-[#333333]">{message}</p>}

      <form onSubmit={handleEmailAuth} className="space-y-8">
        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wider mb-2 text-black">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-black/30 bg-transparent text-black text-[14px] py-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/30"
            placeholder="ENTER YOUR EMAIL"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold uppercase tracking-wider mb-2 text-black">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-black/30 bg-transparent text-black text-[14px] py-3 focus:outline-none focus:border-black transition-colors rounded-none placeholder:text-black/30"
            placeholder="ENTER YOUR PASSWORD"
          />
        </div>

        <div className="flex items-center justify-between pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${rememberMe ? 'bg-black border-black' : 'border-black group-hover:bg-gray-50'}`}>
              <input 
                type="checkbox" 
                className="opacity-0 absolute" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {rememberMe && <Check className="w-3 h-3 text-white stroke-[3px]" />}
            </div>
            <span className="text-[12px] text-black uppercase tracking-widest font-medium">Remember me</span>
          </label>
          <Link href="/login" className="text-[12px] text-[#333333] underline underline-offset-4 uppercase tracking-widest hover:text-black transition-colors">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full h-14 rounded-none uppercase tracking-widest mt-12 hover:bg-[#333333] disabled:opacity-50">
          {loading ? 'PROCESSING...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </button>
      </form>

      <div className="flex items-center my-10">
        <div className="flex-1 h-[1px] bg-black/10"></div>
        <span className="px-4 text-[10px] uppercase tracking-widest text-[#333333]">Or</span>
        <div className="flex-1 h-[1px] bg-black/10"></div>
      </div>

      <button 
        onClick={handleGoogleLogin}
        disabled={loading}
        className="btn-ghost border-[#cccccc] w-full h-14 rounded-none uppercase tracking-widest flex items-center justify-center gap-4 hover:border-black transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </button>
    </div>
  )
}
