import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, Globe, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your email or phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier);
      if (result.needsVerification) {
        toast.success('Please check your email/phone for verification');
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <div className="gradient-hero px-6 pt-12 pb-16 text-primary-foreground">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">SwiftSend</span>
          </div>

          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Send money home,
            <br />
            instantly & affordably
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Powered by blockchain technology for the fastest, lowest-cost transfers.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 -mt-8 mb-6">
        <div className="max-w-lg mx-auto grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: 'Instant', desc: 'Seconds, not days' },
            { icon: Globe, label: 'Global', desc: '150+ countries' },
            { icon: Shield, label: 'Secure', desc: 'Bank-grade' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-card rounded-xl p-4 shadow-card text-center animate-slide-up"
            >
              <div className="w-10 h-10 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="text-xl font-bold text-foreground mb-1">Get started</h2>
            <p className="text-muted-foreground mb-6">
              Sign in with your email or phone number
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email or Phone Number
                </label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter email or phone"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse-soft">Signing in...</span>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
