import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Plus, 
  Send, 
  MapPin, 
  Clock, 
  CheckCircle2,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  DollarSign,
  Users,
  Globe2,
  Shield
} from 'lucide-react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'upcoming' | 'current' | 'completed';
  estimatedTime: string;
  details?: string[];
}

export function RemittanceFlowDemo() {
  const [selectedFlow, setSelectedFlow] = useState<'sender' | 'recipient'>('sender');
  
  const senderFlow: FlowStep[] = [
    {
      id: 'cash_in',
      title: 'Add Funds',
      description: 'Multiple ways to add money to your account',
      icon: Plus,
      status: 'completed',
      estimatedTime: '0-3 business days',
      details: [
        'Bank transfer (ACH) - Free, 1-3 days',
        'Debit card - Instant, 2.9% + $0.30',
        'Cash deposit at stores - 15-30 min, $4.99',
        'Mobile money - 5-15 min, 1.5% + $0.50'
      ]
    },
    {
      id: 'send',
      title: 'Send Money',
      description: 'Fast transfers on Stellar network',
      icon: Send,
      status: 'current',
      estimatedTime: '3-5 seconds',
      details: [
        'Instant transfers using USDC',
        'Real-time exchange rates',
        'Transparent fee structure',
        'Blockchain verification'
      ]
    },
    {
      id: 'escrow',
      title: 'Escrow Hold',
      description: 'Funds temporarily secured to guarantee the transfer',
      icon: Shield,
      status: 'upcoming',
      estimatedTime: 'Immediate — held until completion',
      details: [
        'Sender funds are reserved and cannot be spent elsewhere',
        'Recipient will receive funds when escrow is released',
        'Automatic refund if transfer fails or is reversed'
      ]
    },
    {
      id: 'notification',
      title: 'Notify Recipient',
      description: 'Automatic notifications and confirmation code',
      icon: Users,
      status: 'upcoming',
      estimatedTime: 'Immediate',
      details: [
        'SMS/Email notification to recipient',
        'Unique confirmation code generated',
        'Instructions for cash pickup',
        'Real-time status tracking'
      ]
    }
  ];

  const recipientFlow: FlowStep[] = [
    {
      id: 'receive_notification',
      title: 'Receive Notification',
      description: 'Get notified when money arrives',
      icon: Smartphone,
      status: 'completed',
      estimatedTime: 'Immediate',
      details: [
        'SMS/Email with confirmation code',
        'Amount in local currency',
        'Pickup location options',
        'Required documents list'
      ]
    },
    {
      id: 'choose_method',
      title: 'Choose Cash-Out Method',
      description: 'Multiple ways to access your money',
      icon: MapPin,
      status: 'current',
      estimatedTime: '15 min - 2 hours',
      details: [
        'Cash pickup at 20,000+ locations',
        'Direct bank deposit',
        'Mobile money (GCash, M-Pesa)',
        'Home delivery in select cities'
      ]
    },
    {
      id: 'collect_money',
      title: 'Collect Money',
      description: 'Get your money in local currency',
      icon: Banknote,
      status: 'upcoming',
      estimatedTime: 'At pickup',
      details: [
        'Bring valid government ID',
        'Provide confirmation code',
        'Verify personal details',
        'Receive cash in local currency'
      ]
    }
  ];

  const currentFlow = selectedFlow === 'sender' ? senderFlow : recipientFlow;

  const getStatusColor = (status: FlowStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'current': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'upcoming': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const partners = [
    { name: 'OXXO', country: 'Mexico', locations: '20,000+', type: 'Cash Pickup' },
    { name: 'GCash', country: 'Philippines', locations: '65M users', type: 'Mobile Money' },
    { name: 'UnionBank', country: 'Philippines', locations: '300+ branches', type: 'Bank Deposit' },
    { name: 'Banco Agrícola', country: 'El Salvador', locations: '100+ branches', type: 'Cash Pickup' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Globe2 className="w-6 h-6" />
            Complete Remittance Solution
          </CardTitle>
          <p className="text-blue-100">
            From cash to cash - we handle the entire journey for you and your recipients
          </p>
        </CardHeader>
      </Card>

      {/* Flow Selector */}
      <div className="flex gap-2 bg-muted rounded-lg p-1">
        <button
          onClick={() => setSelectedFlow('sender')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedFlow === 'sender'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sender Journey
        </button>
        <button
          onClick={() => setSelectedFlow('recipient')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedFlow === 'recipient'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recipient Journey
        </button>
      </div>

      {/* Flow Steps */}
      <div className="space-y-4">
        {currentFlow.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === currentFlow.length - 1;
          
          return (
            <div key={step.id} className="relative">
              <Card className={`transition-all ${step.status === 'current' ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            step.status === 'completed' ? 'border-green-500 text-green-700' :
                            step.status === 'current' ? 'border-blue-500 text-blue-700' :
                            'border-gray-500 text-gray-700'
                          }`}
                        >
                          {step.status === 'completed' ? 'Done' :
                           step.status === 'current' ? 'Active' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Clock className="w-3 h-3" />
                        <span>Estimated time: {step.estimatedTime}</span>
                      </div>
                      
                      {step.details && (
                        <div className="space-y-1">
                          {step.details.map((detail, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {!isLast && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Partner Network */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Trusted Partner Network
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Our partners ensure reliable cash-out options worldwide
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <h4 className="font-medium">{partner.name}</h4>
                <p className="text-sm text-muted-foreground">{partner.country}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{partner.locations}</p>
                <p className="text-xs text-muted-foreground">{partner.type}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">
            Why Choose SwiftSend?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">3-5 second transfers</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">Transparent pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">Global coverage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}