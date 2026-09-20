import crypto from 'crypto';
import { db } from '@/lib/db';
import { createSessionToken, verifySessionToken, COOKIE_NAME, SessionPayload } from './session';

export { COOKIE_NAME };
export type { SessionPayload };

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(key, 'hex'));
  } catch {
    return false;
  }
}

// Master password fallback for initial owner setup
export const DEFAULT_OWNER_EMAIL = 'printxo.studio@gmail.com';
export const DEFAULT_OWNER_PASSWORD = 'PrintX@2026!';

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // Find user in database
  let user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  // If owner account doesn't exist yet, auto-create
  if (!user && normalizedEmail === DEFAULT_OWNER_EMAIL) {
    user = await db.user.create({
      data: {
        email: DEFAULT_OWNER_EMAIL,
        name: 'PrintX Studio Owner',
        role: 'OWNER',
        phone: '+91 98765 43210',
        passwordHash: hashPassword(DEFAULT_OWNER_PASSWORD),
      },
    });
  }

  if (!user || !user.active) {
    return null;
  }

  // If user has no passwordHash yet and is logging in with default owner password
  if (!user.passwordHash) {
    if (password === DEFAULT_OWNER_PASSWORD) {
      // First-time owner setup: hash and save the password
      const newHash = hashPassword(password);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      return user;
    }
    return null;
  }

  // Verify stored password hash
  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    // If password failed, also check if owner is using master password to reset/login
    if (user.email === DEFAULT_OWNER_EMAIL && password === DEFAULT_OWNER_PASSWORD) {
      return user;
    }
    return null;
  }

  return user;
}
