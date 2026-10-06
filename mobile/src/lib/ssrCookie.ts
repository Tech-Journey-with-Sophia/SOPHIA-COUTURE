/**
 * Faithful port of @supabase/ssr@0.12.7's session cookie serialization so the
 * mobile app can authenticate against the *existing* website backend route
 * (POST /api/orders) without any change to the website code.
 *
 * The website's route handler builds a server client from request cookies via
 * `createServerClient(...)` (src/utils/supabase/server.ts), which reads the
 * session with this exact wire format:
 *
 *   cookie name : sb-<project-ref>-auth-token  (+ .0, .1, ... chunks)
 *   cookie value: "base64-" + base64url(JSON.stringify(session))
 *                 chunked when encodeURIComponent(value).length > 3180
 *                 (createChunks from @supabase/ssr utils/chunker.js)
 *
 * Source of truth: node_modules/@supabase/ssr/dist/module/cookies.js
 * (BASE64_PREFIX / applyServerStorage) and utils/chunker.js.
 * Verified by scripts/test-ssr-cookie.ts against the real @supabase/ssr parser.
 */

const BASE64_PREFIX = 'base64-';
const MAX_CHUNK_SIZE = 3180; // @supabase/ssr MAX_CHUNK_SIZE
const B64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** UTF-8 encode + base64url (no padding), identical output to the ssr package. */
export function stringToBase64URL(str: string): string {
  // Percent-encode to UTF-8 bytes, then decode the %XX sequences into bytes.
  const encoded = encodeURIComponent(str);
  const bytes: number[] = [];
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === '%') {
      bytes.push(parseInt(encoded.substring(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(encoded.charCodeAt(i));
    }
  }

  let out = '';
  let queue = 0;
  let queuedBits = 0;
  const emit = (byte: number) => {
    queue = (queue << 8) | byte;
    queuedBits += 8;
    while (queuedBits >= 6) {
      out += B64URL_ALPHABET[(queue >> (queuedBits - 6)) & 63];
      queuedBits -= 6;
    }
  };
  for (const byte of bytes) emit(byte);
  if (queuedBits > 0) {
    queue = queue << (6 - queuedBits);
    queuedBits = 6;
    while (queuedBits >= 6) {
      out += B64URL_ALPHABET[(queue >> (queuedBits - 6)) & 63];
      queuedBits -= 6;
    }
  }
  return out;
}

interface CookiePair {
  name: string;
  value: string;
}

/** Port of @supabase/ssr createChunks(). */
function createChunks(key: string, value: string): CookiePair[] {
  const encodedValue = encodeURIComponent(value);
  if (encodedValue.length <= MAX_CHUNK_SIZE) {
    return [{ name: key, value }];
  }
  const chunks: string[] = [];
  let remaining = encodedValue;
  while (remaining.length > 0) {
    let encodedChunkHead = remaining.slice(0, MAX_CHUNK_SIZE);
    const lastEscapePos = encodedChunkHead.lastIndexOf('%');
    if (lastEscapePos > MAX_CHUNK_SIZE - 3) {
      encodedChunkHead = encodedChunkHead.slice(0, lastEscapePos);
    }
    let valueHead = '';
    while (encodedChunkHead.length > 0) {
      try {
        valueHead = decodeURIComponent(encodedChunkHead);
        break;
      } catch (error) {
        if (
          error instanceof URIError &&
          encodedChunkHead.charAt(encodedChunkHead.length - 3) === '%' &&
          encodedChunkHead.length > 3
        ) {
          encodedChunkHead = encodedChunkHead.slice(
            0,
            encodedChunkHead.length - 3
          );
        } else {
          throw error;
        }
      }
    }
    chunks.push(valueHead);
    remaining = remaining.slice(encodedChunkHead.length);
  }
  return chunks.map((v, i) => ({ name: `${key}.${i}`, value: v }));
}

/**
 * Builds a `Cookie` request header carrying the Supabase session in the exact
 * format the website's @supabase/ssr server client expects.
 */
export function buildAuthCookieHeader(
  session: unknown,
  storageKey: string
): string {
  const json = JSON.stringify(session);
  const encoded = BASE64_PREFIX + stringToBase64URL(json);
  const cookies = createChunks(storageKey, encoded);
  // Values are percent-encoded like `cookie.serialize` does on Set-Cookie, so
  // the server's `cookie.parse` reproduces the original values.
  return cookies.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join('; ');
}
