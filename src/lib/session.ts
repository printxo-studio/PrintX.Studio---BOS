// Web Crypto Session Token generator and validator
// Compatible with both Next.js Edge Runtime (middleware) and Node.js (API routes)

export const COOKIE_NAME = 'printxo_bos_session';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'printxo-bos-secret-key-2026-production';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number; // timestamp in ms
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  // Using global crypto.subtle available in Edge & Node 18+
  return await globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function createSessionToken(
  payload: Omit<SessionPayload, 'exp'>,
  maxAgeDays = 7
): Promise<string> {
  const enc = new TextEncoder();
  const sessionData: SessionPayload = {
    ...payload,
    exp: Date.now() + maxAgeDays * 24 * 60 * 60 * 1000,
  };

  const jsonStr = JSON.stringify(sessionData);
  const dataB64 = base64UrlEncode(enc.encode(jsonStr));

  const key = await getCryptoKey();
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(dataB64)
  );
  const sigB64 = base64UrlEncode(new Uint8Array(signatureBuffer));

  return `${dataB64}.${sigB64}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [dataB64, sigB64] = parts;

  try {
    const enc = new TextEncoder();
    const key = await getCryptoKey();
    const sigBytes = base64UrlDecode(sigB64);

    const isValid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(dataB64)
    );

    if (!isValid) return null;

    const dataBytes = base64UrlDecode(dataB64);
    const jsonStr = new TextDecoder().decode(dataBytes);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
