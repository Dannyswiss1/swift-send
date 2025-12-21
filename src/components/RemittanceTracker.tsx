import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Copy,
  Navigation,
  ExternalLink,
  Truck,
  Building2
} from 'lucide-react';
import { PickupLocation } from '@/types';
import { toast } from 'sonner';

interface RemittanceTrackerProps {
  transferId: string;
  recipientName: string;
  amount: number;
  currency: string;
  confirmationCode: string;
  status: 'processing' | 'ready_for_pickup' | 'completed';
  estimatedCompletion?: Date;
  partnerName: string;
  method: 'cash_pickup' | 'bank_transfer' | 'mobile_money' | 'home_delivery';
  pickupLocation?: PickupLocation;
  timeline: Array<{
    stage: string;
    status: 'completed' | 'in_progress' | 'pending';
    timestamp?: Date;
    description: string;
  }>;
}

export function RemittanceTracker({
  transferId,
  recipientName,
  amount,
  currency,
  confirmationCode,
  status,
  estimatedCompletion,
  partnerName,
  method,
  pickupLocation,
  timeline
}: RemittanceTrackerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusInfo = () => {
    switch (status) {
      case 'processing':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          label: 'Processing',
          description: 'Your transfer is being processed'
        };
      case 'ready_for_pickup':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          label: 'Ready for Pickup',
          description: 'Money is ready to be collected'
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          label: 'Completed',
          description: 'Transfer has been completed'
        };
    }
  };

  const getMethodIcon = () => {
    switch (method) {
      case 'cash_pickup': return MapPin;
      case 'bank_transfer': return Building2;
      case 'mobile_money': return Phone;
      case 'home_delivery': return Truck;
      default: return MapPin;
    }
  };

  const copyConfirmationCode = () => {
    navigator.clipboard.writeText(confirmationCode);
    toast.success('Confirmation code copied');
  };

  const statusInfo = getStatusInfo();
  const MethodIcon = getMethodIcon();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">To {recipientName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Transfer ID: {transferId}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{amount} {currency}</div>
            <Badge variant="outline" className={`${statusInfo.color} border-current`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Description */}
        <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`font-medium ${statusInfo.color}`}>
              {statusInfo.description}
            </span>
          </div>
          {estimatedCompletion && status === 'processing' && (
            <p className="text-sm text-muted-foreground mt-1">
              Estimated completion: {estimatedCompletion.toLocaleString()}
            </p>
          )}
        </div>

        {/* Confirmation Code */}
        {status !== 'completed' && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Confirmation Code
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Share with recipient for pickup
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    {confirmationCode}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyConfirmationCode}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Method and Partner Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MethodIcon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium">{partnerName}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {method.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Pickup Location (if applicable) */}
        {pickupLocation && method === 'cash_pickup' && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{pickupLocation.name}</h4>
                  <p className="text-sm text-muted-foreground">{pickupLocation.address}</p>
                  <p className="text-sm text-muted-foreground">{pickupLocation.city}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Hours: {pickupLocation.hours}</span>
                    {pickupLocation.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{pickupLocation.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Navigation className="w-3 h-3 mr-1" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full justify-center"
        >
          {showDetails ? 'Hide' : 'Show'} Transfer Timeline
        </Button>

        {/* Timeline */}
        {showDetails && (
          <div className="space-y-3">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  item.status === 'completed' 
                    ? 'bg-green-100 border-green-500 dark:bg-green-900/30'
                    : item.status === 'in_progress'
                    ? 'bg-amber-100 border-amber-500 dark:bg-amber-900/30'
                    : 'bg-muted border-muted-foreground'
                }`}>
                  {item.status === 'completed' && (
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                  )}
                  {item.status === 'in_progress' && (
                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.description}</p>
                  {item.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          {status === 'ready_for_pickup' && method === 'cash_pickup' && (
            <Button variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Find Locations
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}