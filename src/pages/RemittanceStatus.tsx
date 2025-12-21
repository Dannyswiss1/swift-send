import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { RemittanceTracker } from '@/components/RemittanceTracker';
import { oxxoLocations } from '@/data/mockData';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Filter,
  Zap,
  AlertCircle
} from 'lucide-react';

interface ActiveTransfer {
  id: string;
  recipientName: string;
  amount: number;
  currency: string;
  confirmationCode: string;
  status: 'processing' | 'ready_for_pickup' | 'completed';
  estimatedCompletion?: Date;
  partnerName: string;
  method: 'cash_pickup' | 'bank_transfer' | 'mobile_money' | 'home_delivery';
  country: string;
  timeline: Array<{
    stage: string;
    status: 'completed' | 'in_progress' | 'pending';
    timestamp?: Date;
    description: string;
  }>;
}

// Mock active transfers data
const mockActiveTransfers: ActiveTransfer[] = [
  {
    id: 'TXN-2024-001',
    recipientName: 'Juan Garcia',
    amount: 3445,
    currency: 'MXN',
    confirmationCode: 'SWJG7890',
    status: 'ready_for_pickup',
    partnerName: 'OXXO',
    method: 'cash_pickup',
    country: 'Mexico',
    timeline: [
      {
        stage: 'initiated',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000),
        description: 'Transfer initiated'
      },
      {
        stage: 'funded',
        status: 'completed',
        timestamp: new Date(Date.now() - 3300000),
        description: 'Payment processed on Stellar network'
      },
      {
        stage: 'ready',
        status: 'completed',
        timestamp: new Date(Date.now() - 1800000),
        description: 'Cash ready for pickup at OXXO locations'
      }
    ]
  },
  {
    id: 'TXN-2024-002',
    recipientName: 'Rosa Martinez',
    amount: 28250,
    currency: 'PHP',
    confirmationCode: 'SWRM3456',
    status: 'processing',
    estimatedCompletion: new Date(Date.now() + 1800000), // 30 minutes from now
    partnerName: 'GCash',
    method: 'mobile_money',
    country: 'Philippines',
    timeline: [
      {
        stage: 'initiated',
        status: 'completed',
        timestamp: new Date(Date.now() - 900000),
        description: 'Transfer initiated'
      },
      {
        stage: 'funded',
        status: 'completed',
        timestamp: new Date(Date.now() - 600000),
        description: 'Payment processed on Stellar network'
      },
      {
        stage: 'processing',
        status: 'in_progress',
        description: 'Processing deposit to GCash wallet'
      }
    ]
  },
  {
    id: 'TXN-2024-003',
    recipientName: 'Carlos Reyes',
    amount: 1177.50,
    currency: 'GTQ',
    confirmationCode: 'SWCR9012',
    status: 'completed',
    partnerName: 'Guatemala Express',
    method: 'home_delivery',
    country: 'Guatemala',
    timeline: [
      {
        stage: 'initiated',
        status: 'completed',
        timestamp: new Date(Date.now() - 14400000),
        description: 'Transfer initiated'
      },
      {
        stage: 'funded',
        status: 'completed',
        timestamp: new Date(Date.now() - 14100000),
        description: 'Payment processed on Stellar network'
      },
      {
        stage: 'ready',
        status: 'completed',
        timestamp: new Date(Date.now() - 10800000),
        description: 'Out for delivery'
      },
      {
        stage: 'completed',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000),
        description: 'Cash delivered and received'
      }
    ]
  }
];

export default function RemittanceStatus() {
  const navigate = useNavigate();
  const [activeTransfers, setActiveTransfers] = useState<ActiveTransfer[]>(mockActiveTransfers);
  const [filter, setFilter] = useState<'all' | 'processing' | 'ready' | 'completed'>('all');

  const filteredTransfers = activeTransfers.filter(transfer => {
    if (filter === 'all') return true;
    if (filter === 'processing') return transfer.status === 'processing';
    if (filter === 'ready') return transfer.status === 'ready_for_pickup';
    if (filter === 'completed') return transfer.status === 'completed';
    return true;
  });

  const getStatusCounts = () => {
    return {
      processing: activeTransfers.filter(t => t.status === 'processing').length,
      ready: activeTransfers.filter(t => t.status === 'ready_for_pickup').length,
      completed: activeTransfers.filter(t => t.status === 'completed').length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-semibold">Remittance Status</h1>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className={`cursor-pointer transition-colors ${filter === 'processing' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setFilter(filter === 'processing' ? 'all' : 'processing')}>
              <CardContent className="p-3 text-center">
                <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-sm font-bold">{statusCounts.processing}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer transition-colors ${filter === 'ready' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setFilter(filter === 'ready' ? 'all' : 'ready')}>
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm font-bold">{statusCounts.ready}</p>
                <p className="text-xs text-muted-foreground">Ready</p>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer transition-colors ${filter === 'completed' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setFilter(filter === 'completed' ? 'all' : 'completed')}>
              <CardContent className="p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm font-bold">{statusCounts.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      <main className="px-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Active filter indicator */}
          {filter !== 'all' && (
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="capitalize">
                <Filter className="w-3 h-3 mr-1" />
                {filter.replace('_', ' ')}
              </Badge>
              <button 
                onClick={() => setFilter('all')}
                className="text-sm text-primary hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Transfers List */}
          {filteredTransfers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No transfers found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filter === 'all' 
                    ? "You don't have any active transfers yet."
                    : `No transfers with status "${filter.replace('_', ' ')}" found.`
                  }
                </p>
                <Button onClick={() => navigate('/send')}>
                  Send Money
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTransfers.map((transfer) => (
              <RemittanceTracker
                key={transfer.id}
                transferId={transfer.id}
                recipientName={transfer.recipientName}
                amount={transfer.amount}
                currency={transfer.currency}
                confirmationCode={transfer.confirmationCode}
                status={transfer.status}
                estimatedCompletion={transfer.estimatedCompletion}
                partnerName={transfer.partnerName}
                method={transfer.method}
                pickupLocation={transfer.method === 'cash_pickup' ? oxxoLocations[0] : undefined}
                timeline={transfer.timeline}
              />
            ))
          )}

          {/* Quick Actions */}
          <div className="pt-6">
            <h3 className="font-medium mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/send')}
                className="h-14"
              >
                <Zap className="w-4 h-4 mb-1" />
                Send Money
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/withdraw')}
                className="h-14"
              >
                <MapPin className="w-4 h-4 mb-1" />
                Set Up Pickup
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}