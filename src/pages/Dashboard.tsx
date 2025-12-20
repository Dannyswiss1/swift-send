import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionItem } from '@/components/TransactionItem';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { transactions } from '@/data/mockData';
import { Send, Plus, Bell, ArrowRight, Shield, Info } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const recentTransactions = transactions.slice(0, 3);
  const isNewUser = user?.createdAt && 
    new Date().getTime() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-xl font-bold text-foreground">
              {user?.name?.split(' ')[0] || 'User'}
            </h1>
          </div>
          <button className="relative p-3 rounded-xl bg-card shadow-card hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </header>

      <main className="px-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* New User Welcome Message */}
          {isNewUser && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Your personal wallet is ready! 
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your funds are secure in your personal account. Add money to start sending globally.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    Add Funds to Start
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Balance Card */}
          <BalanceCard balance={user?.balance || 0} />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="hero"
              size="lg"
              className="h-16 text-base"
              onClick={() => navigate('/send')}
            >
              <Send className="w-5 h-5" />
              Send Money
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-16 text-base"
              onClick={() => {}}
            >
              <Plus className="w-5 h-5" />
              Add Funds
            </Button>
          </div>

          {/* Wallet Security Info */}
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Your Personal Wallet</h3>
                <p className="text-xs text-muted-foreground">
                  Your money is safely stored in your personal account, protected by bank-grade security
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center pt-3 border-t border-border">
              <div>
                <p className="text-lg font-bold text-foreground">$850</p>
                <p className="text-xs text-muted-foreground">Sent this month</p>
              </div>
              <div className="border-x border-border">
                <p className="text-lg font-bold text-success">$2.50</p>
                <p className="text-xs text-muted-foreground">Fees saved</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground">Transfers</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
              <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                See all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
