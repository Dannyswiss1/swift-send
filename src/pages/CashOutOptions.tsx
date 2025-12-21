import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/BottomNav';
import { withdrawalMethods, partners, oxxoLocations } from '@/data/mockData';
import { 
  ArrowLeft, 
  Search,
  MapPin, 
  Building2, 
  Smartphone, 
  Truck,
  Clock,
  DollarSign,
  Phone,
  Navigation,
  ExternalLink,
  Star,
  Info
} from 'lucide-react';

const getMethodIcon = (type: string) => {
  switch (type) {
    case 'cash_pickup': return MapPin;
    case 'bank_transfer': return Building2;
    case 'mobile_money': return Smartphone;
    case 'home_delivery': return Truck;
    default: return MapPin;
  }
};

export default function CashOutOptions() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const countries = [
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  ];

  const getAvailableMethods = (countryCode: string) => {
    return withdrawalMethods.filter(method => 
      method.availability.countries.includes(countryCode)
    );
  };

  const getPartnerInfo = (partnerName: string) => {
    return partners.find(p => p.name === partnerName);
  };

  const availableMethods = selectedCountry ? getAvailableMethods(selectedCountry) : withdrawalMethods;

  const filteredLocations = searchLocation 
    ? oxxoLocations.filter(location => 
        location.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
        location.address.toLowerCase().includes(searchLocation.toLowerCase())
      )
    : oxxoLocations.slice(0, 3);

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
            <div>
              <h1 className="text-xl font-semibold">Cash-Out Options</h1>
              <p className="text-sm text-muted-foreground">How recipients can access their money</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Country Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Destination Country</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => setSelectedCountry(country.code)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedCountry === country.code
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {!selectedCountry && (
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCountry('MX')}
                  className="w-full"
                >
                  View All Available Methods
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Available Methods */}
          {availableMethods.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Available Cash-Out Methods
                {selectedCountry && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    in {countries.find(c => c.code === selectedCountry)?.name}
                  </span>
                )}
              </h2>
              
              {availableMethods.map((method) => {
                const Icon = getMethodIcon(method.type);
                const partner = getPartnerInfo(method.partnerName);
                
                return (
                  <Card key={method.id} className="hover:ring-2 hover:ring-primary/20 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{method.name}</h3>
                            {partner && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                                {(partner.reliability * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{method.processingTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>
                                {method.fees.percentage 
                                  ? `${method.fees.percentage}% + $${method.fees.fixed || 0}`
                                  : method.fees.fixed 
                                  ? `$${method.fees.fixed}`
                                  : 'Free'
                                }
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-primary">{method.partnerName}</p>
                              {partner && (
                                <p className="text-xs text-muted-foreground">
                                  Avg. processing: {partner.avgProcessingTime}
                                </p>
                              )}
                            </div>
                            
                            {method.type === 'cash_pickup' && (
                              <Button variant="outline" size="sm">
                                <MapPin className="w-3 h-3 mr-1" />
                                Find Locations
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Requirements */}
                      {method.requirements && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {method.requirements.map((req, index) => (
                              <li key={index} className="flex gap-2">
                                <span className="text-primary">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Sample Pickup Locations (for Mexico/OXXO) */}
          {selectedCountry === 'MX' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Sample OXXO Locations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Find the nearest location for cash pickup
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location or address..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="space-y-3">
                  {filteredLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{location.name}</h4>
                        <p className="text-xs text-muted-foreground">{location.address}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Hours: {location.hours}</span>
                          {location.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{location.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button size="sm" variant="outline">
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </Button>
                        {location.distance && (
                          <p className="text-xs text-center text-muted-foreground">
                            {location.distance}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View All 20,000+ Locations
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Information Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    How Cash-Out Works
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                    <li>• Recipients get notified instantly when money arrives</li>
                    <li>• They choose their preferred cash-out method</li>
                    <li>• Money is converted to local currency automatically</li>
                    <li>• Pickup or delivery happens within minutes to hours</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={() => navigate('/send')} 
              className="flex-1"
            >
              Send Money Now
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/withdraw')}
              className="flex-1"
            >
              Set Up Cash-Out
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}