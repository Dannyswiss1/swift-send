import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, Wallet, Shield, Globe, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingWelcome() {
  const { setOnboardingStep, authUser } = useAuth();

  const isEmail = authUser?.email;
  const firstName = isEmail ? 
    authUser?.email?.split('@')[0] : 
    'there';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold">SwiftSend</span>
          </div>
        </div>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Welcome to SwiftSend, {firstName}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personal wallet is ready. Let's set up your profile so you can start sending money globally.
            </p>
          </div>

          {/* Features Preview */}
          <div className="space-y-4 mb-8">
            {[
              {
                icon: Wallet,
                title: 'Your Personal Wallet',
                description: 'Secure account that holds your money safely',
                color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              },
              {
                icon: Shield,
                title: 'Bank-Grade Security',
                description: 'Your funds are protected with advanced encryption',
                color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              },
              {
                icon: Globe,
                title: 'Global Transfers',
                description: 'Send money to 150+ countries instantly',
                color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
              }
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className={`p-4 rounded-xl border ${color} text-left`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={() => setOnboardingStep(2)}
              variant="hero"
              size="lg"
              className="w-full"
            >
              Set Up Profile
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Takes less than 2 minutes • Your wallet is already secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}