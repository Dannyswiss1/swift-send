import { config } from '../config';
import type { PublicUser, Session, SessionInfo } from './sessionTypes';

const sessions = new Map<string, Session>();

const MARIA_EMAIL = 'maria.santos@email.com';
/** Digits-only form of demo phone from the web mock. */
const MARIA_PHONE_DIGITS = '15551234567';
const SESSION_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const SESSION_WARNING_THRESHOLD_MS = 60 * 1000;

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isMariaIdentifier(identifier: string): boolean {
  const trimmed = identifier.trim();
  if (!trimmed) return false;
  if (trimmed.toLowerCase() === MARIA_EMAIL) return true;
  return normalizePhoneDigits(trimmed) === MARIA_PHONE_DIGITS;
}

export function buildMariaUser(): PublicUser {
  return {
    id: '1',
    name: 'Maria Santos',
    phone: '+1 (555) 123-4567',
    email: MARIA_EMAIL,
    balance: 1250.5,
    usdcBalance: 1250.5,
    localCurrency: 'USD',
    exchangeRate: 1.0,
    isVerified: true,
    onboardingCompleted: true,
    walletAddress: 'wallet_maria_santos_123',
    createdAt: new Date('2024-01-15').toISOString(),
  };
}

export function getSession(id: string): Session | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  if (isSessionExpired(session)) {
    deleteSession(id);
    return undefined;
  }
  return session;
}

export function getSessionUserBalance(id: string): number | null {
  const session = sessions.get(id);
  return session?.user ? session.user.usdcBalance : null;
}

export function adjustSessionUserBalance(id: string, delta: number): number | null {
  const session = sessions.get(id);
  if (!session?.user) {
    return null;
  }

  const nextBalance = Number((session.user.usdcBalance + delta).toFixed(2));
  session.user.usdcBalance = nextBalance;
  session.user.balance = nextBalance;
  saveSession(session);
  return nextBalance;
}

export function saveSession(session: Session): void {
  sessions.set(session.id, session);
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

export function touchSession(id: string): Session | undefined {
  const session = getSession(id);
  if (!session) return undefined;
  session.metadata.lastActivityAt = Date.now();
  saveSession(session);
  return session;
}

export function getSessionInfo(session: Session): SessionInfo {
  return {
    createdAt: session.metadata.createdAt,
    lastActivityAt: session.metadata.lastActivityAt,
    expiresAt: session.expiresAt,
    inactivityTimeoutMs: SESSION_INACTIVITY_TIMEOUT_MS,
    warningThresholdMs: SESSION_WARNING_THRESHOLD_MS,
  };
}

export function createMariaSession(): Session {
  const user = buildMariaUser();
  const now = Date.now();
  const session: Session = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    verified: true,
    hasWallet: true,
    onboardingCompleted: true,
    role: 'admin',
    user,
    metadata: {
      createdAt: now,
      lastActivityAt: now,
    },
    expiresAt: now + config.auth.jwtExpiresSeconds * 1000,
  };
  saveSession(session);
  return session;
}

export function createNewUserSession(email: string | undefined, phone: string | undefined): Session {
  const now = Date.now();
  const session: Session = {
    id: `user_${Date.now()}`,
    email,
    phone,
    verified: false,
    hasWallet: false,
    onboardingCompleted: false,
    role: 'user',
    metadata: {
      createdAt: now,
      lastActivityAt: now,
    },
    expiresAt: now + config.auth.jwtExpiresSeconds * 1000,
  };
  saveSession(session);
  return session;
}

function isSessionExpired(session: Session): boolean {
  const now = Date.now();
  if (now > session.expiresAt) {
    return true;
  }
  return now - session.metadata.lastActivityAt > SESSION_INACTIVITY_TIMEOUT_MS;
}
