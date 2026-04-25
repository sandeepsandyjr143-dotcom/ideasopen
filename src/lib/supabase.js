import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xtydwpklgmgyxpggnujr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HCR94obhz3AkgWp--Y82IQ__hP20vbX'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)