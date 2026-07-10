import { create } from 'zustand'
import { createClient, Session } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface User {
  id: string
  email: string
}

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signUp: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      set({
        user: { id: data.user.id, email: data.user.email || '' },
        session: data.session
      })
    }
    return { error }
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },

  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({
      user: session?.user ? { id: session.user.id, email: session.user.email || '' } : null,
      session: session,
      loading: false
    })
  },
}))