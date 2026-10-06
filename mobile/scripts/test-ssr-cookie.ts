/**
 * Round-trip test for src/lib/ssrCookie.ts
 *
 * Proves that a session serialized by the mobile app is byte-compatible with
 * what the website's @supabase/ssr createServerClient (used by /api/orders)
 * can read back from a Cookie header.
 *
 * Run:  npm run test:cookie     (Node >= 26 runs .ts natively)
 */
import { createServerClient } from '@supabase/ssr';
import { stringToBase64URL as refBase64 } from '@supabase/ssr/dist/module/utils/base64url.js';
import {
  buildAuthCookieHeader,
  stringToBase64URL,
} from '../src/lib/ssrCookie.ts';

const SUPABASE_URL = 'https://brjabisbachtnqbetlye.supabase.co';
const STORAGE_KEY = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`;

let failures = 0;
function assert(cond: boolean, label: string) {
  if (cond) {
    console.log(`  PASS  ${label}`);
  } else {
    failures++;
    console.error(`  FAIL  ${label}`);
  }
}

function parseCookieHeader(header: string): { name: string; value: string }[] {
  return header.split('; ').map((pair) => {
    const eq = pair.indexOf('=');
    return {
      name: pair.slice(0, eq),
      value: decodeURIComponent(pair.slice(eq + 1)),
    };
  });
}

async function roundTrip(session: unknown, label: string) {
  const header = buildAuthCookieHeader(session, STORAGE_KEY);
  const cookies = parseCookieHeader(header);

  const supabase = createServerClient(SUPABASE_URL, 'anon-key-for-read-test', {
    cookies: {
      getAll: async () => cookies,
      setAll: async () => {},
    },
  });

  const { data, error } = await supabase.auth.getSession();
  const originalJson = JSON.stringify(session);
  const gotJson = data.session ? JSON.stringify(data.session) : 'null';
  assert(!error && gotJson === originalJson, `${label} round-trips through @supabase/ssr`);
  return cookies;
}

async function main() {
  console.log('1) base64url output matches @supabase/ssr exactly');
  for (const s of [
    '',
    'simple ascii',
    'héllo wörld — ✓ test',
    JSON.stringify({ a: 1, emoji: '🎉', unicode: 'Ξ§' }),
  ]) {
    assert(
      stringToBase64URL(s) === refBase64(s),
      `base64url(${JSON.stringify(s).slice(0, 40)})`
    );
  }

  console.log('2) small session → single cookie round-trip');
  const smallSession = {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      aud: 'authenticated',
      email: 'test@example.com',
      role: 'authenticated',
      app_metadata: { provider: 'google', providers: ['google'] },
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  const smallCookies = await roundTrip(smallSession, 'small session');
  assert(smallCookies.length === 1, 'small session uses exactly one cookie');
  assert(
    smallCookies[0].name === STORAGE_KEY,
    `cookie name is ${STORAGE_KEY}`
  );
  assert(
    smallCookies[0].value.startsWith('base64-'),
    'cookie value carries the base64- prefix'
  );

  console.log('3) large session → chunked (.0, .1, ...) round-trip');
  const largeSession = {
    ...smallSession,
    user: {
      ...smallSession.user,
      user_metadata: {
        note: 'x'.repeat(5000),
        about: 'This padding forces encodeURIComponent(value).length > 3180 so the @supabase/ssr chunker kicks in.',
      },
    },
  };
  const largeCookies = await roundTrip(largeSession, 'large session');
  assert(largeCookies.length > 1, `large session chunks into ${largeCookies.length} cookies`);
  assert(
    largeCookies.every((c, i) => c.name === (i === 0 ? `${STORAGE_KEY}.0` : `${STORAGE_KEY}.${i}`)),
    'chunk names follow <key>.0, <key>.1, ...'
  );

  console.log('4) header string shape');
  const header = buildAuthCookieHeader(smallSession, STORAGE_KEY);
  assert(!/[\r\n]/.test(header), 'header contains no CR/LF characters');
  assert(
    header.split('; ').every((p) => /^[A-Za-z0-9._-]+=[^;\s]*$/.test(p)),
    'every pair is name=value with safe characters'
  );

  if (failures > 0) {
    console.error(`\n${failures} assertion(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll ssrCookie assertions passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
