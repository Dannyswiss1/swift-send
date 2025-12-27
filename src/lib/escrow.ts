import { EscrowEntry, EscrowStatus } from '../types/escrow';

const store: Map<string, EscrowEntry> = new Map();

type StatusCallback = (entry: EscrowEntry) => void;
const listeners: StatusCallback[] = [];

function nowIso() { return new Date().toISOString(); }

function emit(entry: EscrowEntry) {
  listeners.forEach(cb => cb(entry));
}

export async function createEscrow(transferId: string, amount: number, currency = 'USD', senderId?: string, recipientId?: string): Promise<EscrowEntry> {
  const id = `escrow_${Math.random().toString(36).slice(2,9)}`;
  const entry: EscrowEntry = {
    id,
    transferId,
    amount,
    currency,
    senderId,
    recipientId,
    status: 'held',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    expectedReleaseAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // default demo 5min
    notes: 'Funds secured in escrow for transfer processing.'
  };
  store.set(transferId, entry);
  // simulate async
  await new Promise(resolve => setTimeout(resolve, 100));
  emit(entry);
  return entry;
}

export async function getEscrowByTransferId(transferId: string): Promise<EscrowEntry | null> {
  // simulate async
  await new Promise(resolve => setTimeout(resolve, 50));
  return store.get(transferId) || null;
}

async function updateStatus(transferId: string, status: EscrowStatus, notes?: string) {
  const entry = store.get(transferId);
  if (!entry) return null;
  entry.status = status;
  entry.updatedAt = nowIso();
  if (notes) entry.notes = notes;
  store.set(transferId, entry);
  await new Promise(resolve => setTimeout(resolve, 50));
  emit(entry);
  return entry;
}

export async function releaseEscrow(transferId: string): Promise<EscrowEntry | null> {
  return updateStatus(transferId, 'released', 'Funds released to recipient.');
}

export async function refundEscrow(transferId: string): Promise<EscrowEntry | null> {
  return updateStatus(transferId, 'refunded', 'Funds refunded to sender.');
}

export async function markEscrowDelayed(transferId: string, reason?: string): Promise<EscrowEntry | null> {
  return updateStatus(transferId, 'delayed', reason || 'Release delayed pending review.');
}

export function onEscrowStatusChange(cb: StatusCallback) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

// For demo: initialize an escrow for an id if none exists
export async function ensureEscrow(transferId: string, amount = 0, currency = 'USD') {
  const existing = await getEscrowByTransferId(transferId);
  if (existing) return existing;
  return createEscrow(transferId, amount, currency);
}
