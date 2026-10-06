import './cryptoPolyfill';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in the public values.'
  );
}

/**
 * Same Supabase project + anon key the website uses (see
 * src/utils/supabase/client.ts). Only public, client-safe credentials live
 * here — the service role key and Mailgun keys must never be added.
 *
 * Sessions persist in AsyncStorage and the PKCE flow is used so Google
 * sign-in can complete through an in-app browser on native.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

/** Project ref derived exactly like supabase-js derives its storage key. */
export function supabaseProjectRef(): string {
  return new URL(supabaseUrl!).hostname.split('.')[0];
}

/** Default supabase-js / @supabase/ssr storage key: `sb-<ref>-auth-token`. */
export const SUPABASE_AUTH_STORAGE_KEY = `sb-${supabaseProjectRef()}-auth-token`;
