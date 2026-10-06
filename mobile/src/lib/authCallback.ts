import * as QueryParams from 'expo-auth-session/build/QueryParams';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const codeExchanges = new Map<string, Promise<void>>();

function exchangeCode(code: string): Promise<void> {
  const existing = codeExchanges.get(code);
  if (existing) return existing;

  const exchange = supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
    if (error) throw error;
  });
  codeExchanges.set(code, exchange);
  void exchange.catch(() => codeExchanges.delete(code));
  return exchange;
}

export async function completeAuthCallback(url: string): Promise<void> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  const callbackError = params.error_description || params.error || errorCode;
  if (callbackError) throw new Error(callbackError);

  if (params.code) {
    await exchangeCode(params.code);
    return;
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return;
  }

  if (params.token_hash && params.type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: params.token_hash,
      type: params.type as EmailOtpType,
    });
    if (error) throw error;
    return;
  }

  throw new Error('The authentication link did not contain a valid session code. Request a new link and try again.');
}