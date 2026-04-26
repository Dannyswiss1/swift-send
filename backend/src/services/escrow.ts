import { v4 as uuidv4 } from 'uuid';

export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed' | 'cancelled';

export interface EscrowEntry {
  id: string;
  transferId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

const TERMINAL_STATES: EscrowStatus[] = ['released', 'refunded', 'cancelled'];

const store: Record<string, EscrowEntry> = {};

export async function createEscrow(transferId: string, amount: number, currency = 'USD') {
  const id = uuidv4();
  const now = new Date().toISOString();
  const e: EscrowEntry = { id, transferId, amount, currency, status: 'held', createdAt: now, updatedAt: now };
  store[transferId] = e;
  return e;
}

export async function getEscrow(transferId: string) {
  return store[transferId] || null;
}

function assertNotTerminal(e: EscrowEntry, operation: string) {
  if (TERMINAL_STATES.includes(e.status)) {
    throw Object.assign(
      new Error(`Cannot ${operation} escrow for transfer '${e.transferId}': already ${e.status}`),
      { statusCode: 409, code: 'escrow_already_finalized', currentStatus: e.status }
    );
  }
}

async function updateStatus(transferId: string, status: EscrowStatus, failureReason?: string) {
  const e = store[transferId];
  if (!e) return null;
  assertNotTerminal(e, status);
  e.status = status;
  e.updatedAt = new Date().toISOString();
  if (failureReason) e.failureReason = failureReason;
  return e;
}

export async function releaseEscrow(transferId: string) {
  return updateStatus(transferId, 'released');
}

export async function refundEscrow(transferId: string, reason?: string) {
  return updateStatus(transferId, 'refunded', reason);
}

export async function disputeEscrow(transferId: string, reason?: string) {
  const e = store[transferId];
  if (!e) return null;
  if (TERMINAL_STATES.includes(e.status)) {
    throw Object.assign(
      new Error(`Cannot dispute escrow for transfer '${e.transferId}': already ${e.status}`),
      { statusCode: 409, code: 'escrow_already_finalized', currentStatus: e.status }
    );
  }
  e.status = 'disputed';
  e.updatedAt = new Date().toISOString();
  if (reason) e.failureReason = reason;
  return e;
}

export async function cancelEscrow(transferId: string, reason?: string) {
  const e = store[transferId];
  if (!e) return null;
  if (e.status !== 'held') {
    throw Object.assign(
      new Error(`Cannot cancel escrow for transfer '${e.transferId}': status is '${e.status}', only 'held' escrows can be cancelled`),
      { statusCode: 409, code: 'escrow_invalid_state', currentStatus: e.status }
    );
  }
  return updateStatus(transferId, 'cancelled', reason);
}
