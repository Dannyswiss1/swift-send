import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContactItem } from '@/components/ContactItem';
import { FeeBreakdown } from '@/components/FeeBreakdown';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { contacts, calculateFees } from '@/data/mockData';
import { Contact } from '@/types';
import { ArrowLeft, Search, DollarSign, Send, CheckCircle2, UserPlus, Mail, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'recipient' | 'amount' | 'confirm' | 'success';
type RecipientType = 'contact' | 'new';

interface NewRecipient {
  identifier: string; // email or phone
  name?: string;
  type: 'email' | 'phone';
}

export default function SendMoney() {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuth();
  const [step, setStep] = useState<Step>('recipient');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newRecipient, setNewRecipient] = useState<NewRecipient | null>(null);
  const [recipientType, setRecipientType] = useState<RecipientType>('contact');
  const [recipientInput, setRecipientInput] = useState('');
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  );

  // Detect if input is email or phone
  const detectRecipientType = (input: string): 'email' | 'phone' | null => {
    if (input.includes('@') && input.includes('.')) return 'email';
    if (/^[\+]?[(]?[\d\s\-\(\)]{10,}/.test(input)) return 'phone';
    return null;
  };

  const isValidRecipientInput = useMemo(() => {
    return detectRecipientType(recipientInput) !== null;
  }, [recipientInput]);

  const fees = useMemo(() => {
    const parsedAmount = parseFloat(amount) || 0;
    return calculateFees(parsedAmount);
  }, [amount]);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setNewRecipient(null);
    setRecipientType('contact');
    setStep('amount');
  };

  const handleSelectNewRecipient = () => {
    const type = detectRecipientType(recipientInput);
    if (!type) {
      toast.error('Please enter a valid email or phone number');
      return;
    }
    
    setNewRecipient({
      identifier: recipientInput,
      type,
      name: recipientInput.split('@')[0] // Use email prefix or phone as name
    });
    setSelectedContact(null);
    setRecipientType('new');
    setStep('amount');
  };

  const handleAmountSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (parsedAmount > (user?.usdcBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmSend = async () => {
    setIsProcessing(true);
    
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const parsedAmount = parseFloat(amount);
    updateBalance((user?.usdcBalance || 0) - parsedAmount);
    
    setIsProcessing(false);
    setStep('success');
  };

  const handleBack = () => {
    if (step === 'amount') {
      setStep('recipient');
      setSelectedContact(null);
      setNewRecipient(null);
    }
    else if (step === 'confirm') setStep('amount');
    else navigate('/dashboard');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-sm animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Money Sent Successfully!
          </h1>
          <p className="text-muted-foreground mb-2">
            ${fees.recipientGets.toFixed(2)} is on its way to
          </p>
          <p className="font-semibold text-foreground text-lg mb-6">
            {selectedContact?.name || newRecipient?.name || 'Recipient'}
          </p>

          <div className="bg-card rounded-xl p-4 shadow-card mb-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated arrival</span>
              <span className="font-semibold text-success">~5 seconds</span>
            </div>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate('/dashboard')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {step === 'recipient' && 'Send Money'}
            {step === 'amount' && 'Enter Amount'}
            {step === 'confirm' && 'Confirm Transfer'}
          </h1>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="max-w-lg mx-auto">
          {/* Step 1: Select Recipient */}
          {step === 'recipient' && (
            <div className="space-y-6 animate-fade-in">
              {/* Quick Send to New Contact */}
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Send to anyone</span>
                </div>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {detectRecipientType(recipientInput) === 'email' ? (
                        <Mail className="w-5 h-5 text-muted-foreground" />
                      ) : detectRecipientType(recipientInput) === 'phone' ? (
                        <Phone className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <UserPlus className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="Email or phone number"
                      value={recipientInput}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleSelectNewRecipient}
                    disabled={!isValidRecipientInput}
                    variant={isValidRecipientInput ? "default" : "secondary"}
                    className="px-6"
                  >
                    Send
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  {detectRecipientType(recipientInput) === 'email' && '📧 We will send a secure link to their email'}
                  {detectRecipientType(recipientInput) === 'phone' && '📱 We will send a secure SMS to their phone'}
                  {!detectRecipientType(recipientInput) && recipientInput && '⚠️ Please enter a valid email or phone number'}
                  {!recipientInput && 'Enter an email address or phone number to send money instantly'}
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">or choose recent</span>
                <div className="h-px bg-border flex-1"></div>
              </div>

              {/* Search Recent Recipients */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search recent recipients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>

              {/* Recent Recipients */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Recipients
                </p>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <ContactItem
                      key={contact.id}
                      contact={contact}
                      onClick={() => handleSelectContact(contact)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No recipients found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchQuery ? 'Try a different search term' : 'Start by entering an email or phone number above'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 'amount' && (selectedContact || newRecipient) && (
            <div className="space-y-6 animate-fade-in">
              {/* Recipient Display */}
              <div className="bg-card rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-lg font-semibold text-primary-foreground">
                    {selectedContact ? 
                      selectedContact.name.charAt(0) : 
                      (newRecipient?.name?.charAt(0) || '?')
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      Sending to {selectedContact?.name || newRecipient?.name}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {selectedContact ? (
                        <>
                          <Phone className="w-4 h-4" />
                          {selectedContact.phone}
                        </>
                      ) : newRecipient?.type === 'email' ? (
                        <>
                          <Mail className="w-4 h-4" />
                          {newRecipient.identifier}
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          {newRecipient?.identifier}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">Enter amount to send</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-10 h-10 text-primary" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-6xl font-bold text-foreground bg-transparent border-none outline-none w-64 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <span className="text-2xl font-semibold text-muted-foreground">USDC</span>
                </div>
                
                <div className="flex items-center justify-center gap-4 text-sm">
                  <p className="text-muted-foreground">
                    Available: ${user?.usdcBalance?.toFixed(2)} USDC
                  </p>
                  {parseFloat(amount) > (user?.usdcBalance || 0) && (
                    <p className="text-destructive font-medium">
                      ⚠️ Insufficient balance
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2 justify-center mt-6">
                  {[10, 25, 50, 100].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={quickAmount > (user?.usdcBalance || 0)}
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Real-time Fee Breakdown */}
              {parseFloat(amount) > 0 && (
                <div className="space-y-4">
                  <FeeBreakdown
                    amount={parseFloat(amount)}
                    networkFee={fees.networkFee}
                    serviceFee={fees.serviceFee}
                    totalFee={fees.totalFee}
                    recipientGets={fees.recipientGets}
                  />
                  
                  {/* Trust Indicators */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        ⚡ Instant Transfer • 🔒 Secure • 💰 Low Cost
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        {selectedContact ? 'Contact will receive money in seconds' : 'Recipient will get a secure link to claim their money'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleAmountSubmit}
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > (user?.usdcBalance || 0)}
              >
                {!amount || parseFloat(amount) <= 0 ? (
                  'Enter amount to continue'
                ) : parseFloat(amount) > (user?.usdcBalance || 0) ? (
                  'Insufficient balance'
                ) : (
                  <>
                    Review Transfer
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (selectedContact || newRecipient) && (
            <div className="space-y-6 animate-fade-in">
              {/* Transfer Summary */}
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground mb-4">
                    {selectedContact ? 
                      selectedContact.name.charAt(0) : 
                      (newRecipient?.name?.charAt(0) || '?')
                    }
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    Confirm your transfer
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Review details before sending
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">You're sending</span>
                    <span className="text-2xl font-bold text-foreground">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">To</span>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {selectedContact?.name || newRecipient?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContact?.phone || newRecipient?.identifier}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">They will receive</span>
                      <span className="text-2xl font-bold text-success">${fees.recipientGets.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Fee Breakdown */}
              <FeeBreakdown
                amount={parseFloat(amount)}
                networkFee={fees.networkFee}
                serviceFee={fees.serviceFee}
                totalFee={fees.totalFee}
                recipientGets={fees.recipientGets}
              />

              {/* Speed & Security Assurance */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800 text-center">
                  <p className="text-green-600 text-2xl mb-1">⚡</p>
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">Instant</p>
                  <p className="text-xs text-green-600 dark:text-green-300">~5 seconds</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 text-center">
                  <p className="text-blue-600 text-2xl mb-1">🔒</p>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Secure</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">Bank-grade</p>
                </div>
              </div>

              {/* Final CTA */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleConfirmSend}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"></div>
                    <span>Sending money...</span>
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send ${parseFloat(amount).toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By confirming, you authorize this transfer from your personal wallet
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
