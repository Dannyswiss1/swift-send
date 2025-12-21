import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Shield, 
  Zap,
  Globe,
  ArrowRight
} from 'lucide-react';
import { WalletProvider } from '@/types';
import { cn } from '@/lib/utils';

interface WalletConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: () => void;
}

export default function WalletConnectionDialog({ isOpen, onClose, onConnect }: WalletConnectionDialogProps) {
  const { availableWallets, isConnecting, connectWallet } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleWalletConnect = async (provider: WalletProvider) => {
    setSelectedWallet(provider);
    try {
      await connectWallet(provider);
      onConnect?.();
      onClose();
    } catch (error) {
      // Error is handled in the context
    } finally {
      setSelectedWallet(null);
    }
  };

  const getProviderFromName = (name: string): WalletProvider => {
    return name.toLowerCase() as WalletProvider;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Your Stellar Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your own wallet for full control over your funds and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Why connect your own wallet?
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Full control of your private keys
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                View transactions on blockchain explorer
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Enhanced security and transparency
              </li>
            </ul>
          </div>

          {/* Available Wallets */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Available Wallets</h4>
            
            {availableWallets.map((wallet) => {
              const provider = getProviderFromName(wallet.name);
              const isLoading = isConnecting && selectedWallet === provider;
              
              return (
                <div
                  key={wallet.name}
                  className={cn(
                    "p-3 border rounded-lg transition-colors cursor-pointer hover:border-primary/50",
                    !wallet.isInstalled && "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => wallet.isInstalled && handleWalletConnect(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center text-xl">
                        {wallet.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{wallet.name}</p>
                          {wallet.isInstalled ? (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Installed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Download className="w-3 h-3 mr-1" />
                              Not Installed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {wallet.description}
                        </p>
                      </div>
                    </div>
                    
                    {wallet.isInstalled ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                        className="ml-2"
                      >
                        {isLoading ? (
                          <span className="animate-pulse">Connecting...</span>
                        ) : (
                          <>
                            Connect
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (wallet.name === 'Freighter') {
                            window.open('https://freighter.app/', '_blank');
                          } else if (wallet.name === 'Rabet') {
                            window.open('https://rabet.io/', '_blank');
                          }
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alternative Option */}
          <div className="pt-4 border-t">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>New to Stellar wallets?</strong> You can continue using SwiftSend's managed wallet 
                and upgrade to your own wallet later from Settings.
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('https://stellar.org/ecosystem/projects?tab=wallets', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Learn More
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Wallet status indicator component
export function WalletStatusIndicator() {
  const { connectionState } = useWallet();

  if (!connectionState.isConnected) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full text-xs">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      <span className="font-medium text-green-700 dark:text-green-300">
        {connectionState.provider} Connected
      </span>
    </div>
  );
}

// Quick wallet balance component
export function WalletBalanceCard() {
  const { connectionState, refreshBalance } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!connectionState.isConnected || !connectionState.account) {
    return null;
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">External Wallet</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <Zap className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>
      
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground">
          ${connectionState.account.balance.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {connectionState.account.publicKey.slice(0, 8)}...
          {connectionState.account.publicKey.slice(-8)}
        </p>
      </div>
      
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Self-custody</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3" />
          <span>Stellar Network</span>
        </div>
      </div>
    </div>
  );
}