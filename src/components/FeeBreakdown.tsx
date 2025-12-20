import { Info, Zap, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeeBreakdownProps {
  amount: number;
  networkFee: number;
  serviceFee: number;
  totalFee: number;
  recipientGets: number;
  className?: string;
}

export function FeeBreakdown({
  amount,
  networkFee,
  serviceFee,
  totalFee,
  recipientGets,
  className,
}: FeeBreakdownProps) {
  const savingsVsTraditional = amount * 0.08; // 8% typical bank transfer fee
  const timeVsTraditional = "3-5 business days";
  
  return (
    <div
      className={cn(
        'bg-card rounded-xl p-5 shadow-card space-y-4 animate-scale-in border border-border/50',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Info className="w-4 h-4 text-primary" />
          Cost Breakdown
        </div>
        <span className="text-xs text-muted-foreground">Always transparent</span>
      </div>

      <div className="space-y-3">
        {/* Your amount */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Your amount</span>
          <span className="font-semibold text-foreground">${amount.toFixed(2)}</span>
        </div>

        {/* Fees */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Network fee (Near zero)</span>
            </div>
            <span className="font-medium text-foreground">${networkFee.toFixed(3)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>SwiftSend fee (0.2%)</span>
            </div>
            <span className="font-medium text-foreground">${serviceFee.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-border/50 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total fees</span>
            <span className="font-semibold text-foreground">${totalFee.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Recipient gets - highlighted */}
      <div className="bg-gradient-to-r from-green-50 to-green-50/50 dark:from-green-900/20 dark:to-green-900/10 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-foreground">Recipient gets</span>
          </div>
          <span className="text-2xl font-bold text-green-600">
            ${recipientGets.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 ml-7">
          Arrives in seconds • Guaranteed amount
        </p>
      </div>

      {/* Savings comparison */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Why SwiftSend?
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-blue-600 dark:text-blue-400 font-medium">Traditional banks</p>
            <p className="text-blue-700 dark:text-blue-300">
              ~${savingsVsTraditional.toFixed(2)} fee • {timeVsTraditional}
            </p>
          </div>
          <div>
            <p className="text-green-600 dark:text-green-400 font-medium">SwiftSend</p>
            <p className="text-green-700 dark:text-green-300">
              ${totalFee.toFixed(2)} fee • ~5 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
