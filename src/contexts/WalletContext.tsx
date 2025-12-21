import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StellarAccount, StellarWallet, WalletTransaction, WalletProvider, WalletConnectionState } from '@/types';
import { toast } from 'sonner';

interface WalletContextType {
  connectionState: WalletConnectionState;
  availableWallets: StellarWallet[];
  isConnecting: boolean;
  isSigningTransaction: boolean;
  connectWallet: (provider: WalletProvider) => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transaction: any) => Promise<string>;
  refreshBalance: () => Promise<void>;
  getRecentTransactions: () => Promise<WalletTransaction[]>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>({
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningTransaction, setIsSigningTransaction] = useState(false);

  // Mock wallet configurations
  const availableWallets: StellarWallet[] = [
    {
      name: 'Freighter',
      icon: '🚀',
      description: 'The most popular Stellar wallet extension',
      isInstalled: typeof window !== 'undefined' && !!window.freighter,
      connect: async () => {
        if (!window.freighter) {
          throw new Error('Freighter wallet not installed');
        }
        const { isConnected } = await window.freighter.isConnected();
        if (!isConnected) {
          throw new Error('Freighter wallet not connected');
        }
        const { publicKey } = await window.freighter.getPublicKey();
        // Mock balance fetch
        return {
          publicKey,
          balance: 150.25,
          provider: 'freighter'
        };
      }
    },
    {
      name: 'Albedo',
      icon: '⭐',
      description: 'Web-based Stellar wallet with advanced features',
      isInstalled: true, // Web-based, always available
      connect: async () => {
        // Mock Albedo connection
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
          publicKey: 'GALBEDOEXAMPLEKEYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          balance: 89.50,
          provider: 'albedo'
        };
      }
    },
    {
      name: 'Rabet',
      icon: '🐰',
      description: 'Multi-currency Stellar wallet',
      isInstalled: typeof window !== 'undefined' && !!window.rabet,
      connect: async () => {
        if (!window.rabet) {
          throw new Error('Rabet wallet not installed');
        }
        // Mock Rabet connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          publicKey: 'GRABETEXAMPLEKEYXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          balance: 203.75,
          provider: 'rabet'
        };
      }
    }
  ];

  const connectWallet = async (provider: WalletProvider) => {
    setIsConnecting(true);
    try {
      const wallet = availableWallets.find(w => w.name.toLowerCase() === provider);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (!wallet.isInstalled && provider !== 'albedo') {
        throw new Error(`${wallet.name} wallet is not installed`);
      }

      const account = await wallet.connect();
      
      setConnectionState({
        isConnected: true,
        account,
        provider
      });

      toast.success(`${wallet.name} wallet connected successfully!`);
    } catch (error: any) {
      setConnectionState({
        isConnected: false,
        error: error.message
      });
      
      // Provide helpful error messages
      if (error.message.includes('not installed')) {
        toast.error(`Please install ${provider} wallet to continue`, {
          description: 'You can download it from the official website',
          action: {
            label: 'Learn More',
            onClick: () => window.open('https://stellar.org/ecosystem/projects?tab=wallets', '_blank')
          }
        });
      } else {
        toast.error('Failed to connect wallet', {
          description: error.message
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnectionState({
      isConnected: false
    });
    toast.success('Wallet disconnected');
  };

  const signTransaction = async (transaction: any): Promise<string> => {
    setIsSigningTransaction(true);
    try {
      if (!connectionState.isConnected || !connectionState.account) {
        throw new Error('No wallet connected');
      }

      // Mock transaction signing with proper delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate different outcomes
      const shouldSucceed = Math.random() > 0.1; // 90% success rate
      if (!shouldSucceed) {
        throw new Error('User rejected the transaction');
      }

      const mockTxHash = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      toast.success('Transaction signed successfully!', {
        description: 'Your transaction has been submitted to the network'
      });

      return mockTxHash;
    } catch (error: any) {
      toast.error('Transaction signing failed', {
        description: error.message
      });
      throw error;
    } finally {
      setIsSigningTransaction(false);
    }
  };

  const refreshBalance = async () => {
    if (!connectionState.isConnected || !connectionState.account) return;

    try {
      // Mock balance refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newBalance = Math.random() * 1000;
      
      setConnectionState(prev => ({
        ...prev,
        account: prev.account ? {
          ...prev.account,
          balance: newBalance
        } : undefined
      }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  const getRecentTransactions = async (): Promise<WalletTransaction[]> => {
    if (!connectionState.isConnected) return [];

    // Mock recent transactions
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        id: 'tx_1',
        hash: 'abc123...def456',
        type: 'payment',
        amount: '25.50',
        asset: 'USDC',
        destination: 'GEXAMPLE...RECIPIENT',
        status: 'success',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        stellarHash: 'abc123def456789...',
        networkFee: '0.00001'
      },
      {
        id: 'tx_2',
        type: 'payment',
        amount: '100.00',
        asset: 'USDC',
        destination: 'GANOTHER...RECIPIENT',
        status: 'pending',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        networkFee: '0.00001'
      }
    ];
  };

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const savedConnection = localStorage.getItem('stellar-wallet-connection');
    if (savedConnection) {
      try {
        const { provider } = JSON.parse(savedConnection);
        if (provider && provider !== 'internal') {
          // Attempt silent reconnection
          connectWallet(provider).catch(() => {
            // Silent fail - user will need to reconnect manually
            localStorage.removeItem('stellar-wallet-connection');
          });
        }
      } catch (error) {
        localStorage.removeItem('stellar-wallet-connection');
      }
    }
  }, []);

  // Save connection state
  useEffect(() => {
    if (connectionState.isConnected && connectionState.provider) {
      localStorage.setItem('stellar-wallet-connection', JSON.stringify({
        provider: connectionState.provider
      }));
    } else {
      localStorage.removeItem('stellar-wallet-connection');
    }
  }, [connectionState]);

  return (
    <WalletContext.Provider
      value={{
        connectionState,
        availableWallets,
        isConnecting,
        isSigningTransaction,
        connectWallet,
        disconnectWallet,
        signTransaction,
        refreshBalance,
        getRecentTransactions
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Type declarations for wallet extensions
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<{ isConnected: boolean }>;
      getPublicKey: () => Promise<{ publicKey: string }>;
      signTransaction: (transaction: string) => Promise<{ signedTransaction: string }>;
    };
    rabet?: {
      connect: () => Promise<{ publicKey: string }>;
      sign: (transaction: string) => Promise<{ signature: string }>;
    };
  }
}