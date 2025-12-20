import { Wallet, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  className?: string;
}

export function BalanceCard({ balance, className }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div
      className={cn(
        'gradient-hero rounded-2xl p-6 text-primary-foreground shadow-soft animate-fade-in',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary-foreground/20">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium opacity-90">Personal Wallet Balance</span>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          aria-label={showBalance ? 'Hide balance' : 'Show balance'}
        >
          {showBalance ? (
            <Eye className="w-5 h-5 opacity-80" />
          ) : (
            <EyeOff className="w-5 h-5 opacity-80" />
          )}
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">
            {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
          </span>
          <span className="text-lg font-medium opacity-80">USDC</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm opacity-90">
        <TrendingUp className="w-4 h-4" />
        <span>Secured in your personal account • Global transfers</span>
      </div>
    </div>
  );
}
