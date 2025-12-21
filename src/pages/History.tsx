import { useState, useMemo } from 'react';
import { ChevronDown, Search, Filter, Calendar, Banknote, TrendingUp, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionItem } from '@/components/TransactionItem';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const sentTransactions = user?.transactions?.filter(t => t.type === 'send') || [];
    const totalSent = sentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = sentTransactions.reduce((sum, t) => sum + t.fee, 0);
    const pendingTransactions = user?.transactions?.filter(t => t.status === 'pending').length || 0;
    const thisMonth = user?.transactions?.filter(t => {
      const transactionDate = new Date(t.timestamp);
      const now = new Date();
      return transactionDate.getMonth() === now.getMonth() && 
             transactionDate.getFullYear() === now.getFullYear();
    }).length || 0;

    return { totalSent, totalFees, pendingTransactions, thisMonth };
  }, [user?.transactions]);

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return (user?.transactions || []).filter(transaction => {
      const matchesSearch = transaction.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.recipientPhone?.includes(searchTerm) ||
                           transaction.recipientEmail?.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [user?.transactions, searchTerm, statusFilter, typeFilter]);

  const handleTransactionClick = (transactionId: string) => {
    setExpandedTransactionId(
      expandedTransactionId === transactionId ? null : transactionId
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'send', label: 'Sent' },
    { value: 'receive', label: 'Received' }
  ];

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen pb-20">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/50">
        <div className="p-6 pb-4">
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="p-2 h-auto"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Sent</span>
                </div>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">${summary.totalSent.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Fees Paid</span>
                </div>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">${summary.totalFees.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Pending</span>
                </div>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{summary.pendingTransactions}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">This Month</span>
                </div>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{summary.thisMonth}</p>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search recipients, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border/50"
            />
          </div>

          {/* Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {(statusFilter !== 'all' || typeFilter !== 'all') && (
                    <Badge variant="secondary" className="text-xs">
                      {[statusFilter, typeFilter].filter(f => f !== 'all').length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              <div className="flex gap-2 flex-wrap">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={statusFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {typeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={typeFilter === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      <div className="p-6 pt-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
              <div className="space-y-3">
                <div className="text-4xl">🔍</div>
                <h3 className="text-lg font-semibold text-foreground">No transactions found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">💸</div>
                <h3 className="text-lg font-semibold text-foreground">No transactions yet</h3>
                <p className="text-muted-foreground text-sm">
                  Your transaction history will appear here once you send or receive money
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </p>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {filteredTransactions.map((transaction, index) => (
              <div key={transaction.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <TransactionItem
                  transaction={transaction}
                  showDetailedView={expandedTransactionId === transaction.id}
                  onClick={() => handleTransactionClick(transaction.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
