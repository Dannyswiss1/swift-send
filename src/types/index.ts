export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  balance: number; // Legacy balance field
  usdcBalance: number; // USDC balance
  localCurrency: string; // User's local currency code (USD, EUR, etc.)
  exchangeRate: number; // Rate from USDC to local currency
  isVerified: boolean;
  onboardingCompleted: boolean;
  walletAddress?: string;
  createdAt: Date;
  // Stellar wallet preferences
  externalWalletConnected?: boolean;
  preferExternalWallet?: boolean;
  walletConnectionStatus?: 'none' | 'connected' | 'disconnected';
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  hasWallet: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  country: string;
  countryCode: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  fee: number;
  recipientAmount: number;
  recipientName: string;
  recipientPhone: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  exchangeRate?: number;
  destinationCurrency?: string;
}

export interface FeeBreakdown {
  networkFee: number;
  serviceFee: number;
  exchangeRate: number;
  totalFee: number;
  recipientGets: number;
}

// Stellar Wallet Types
export interface StellarWallet {
  name: string;
  icon: string;
  description: string;
  isInstalled: boolean;
  connect: () => Promise<StellarAccount>;
}

export interface StellarAccount {
  publicKey: string;
  balance: number;
  provider: string;
  isTestnet?: boolean;
}

export interface WalletTransaction {
  id: string;
  hash?: string;
  type: 'payment' | 'pathPayment';
  amount: string;
  asset: string;
  destination: string;
  memo?: string;
  status: 'pending' | 'submitted' | 'success' | 'failed';
  createdAt: Date;
  stellarHash?: string;
  networkFee?: string;
}

export interface TransactionPreview {
  amount: string;
  asset: string;
  destination: string;
  memo?: string;
  networkFee: string;
  estimatedTime: string;
}

export type WalletProvider = 'freighter' | 'albedo' | 'walletconnect' | 'rabet' | 'internal';

export interface WalletConnectionState {
  isConnected: boolean;
  account?: StellarAccount;
  provider?: WalletProvider;
  error?: string;
}
