export type EscrowStatus = 'held' | 'released' | 'refunded' | 'disputed' | 'delayed';

export interface EscrowEntry {
  id: string;
  transferId: string;
  amount: number;
  currency: string;
  senderId?: string;
  recipientId?: string;
  status: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  expectedReleaseAt?: string;
  notes?: string;
}

export interface EscrowSummary {
  transferId: string;
  status: EscrowStatus;
  message: string;
}

export const isFinalEscrowStatus = (s: EscrowStatus) => s === 'released' || s === 'refunded';
