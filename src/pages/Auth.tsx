import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';
import VerificationForm from '@/components/VerificationForm';
import OnboardingWelcome from '@/components/OnboardingWelcome';
import OnboardingProfile from '@/components/OnboardingProfile';
import OnboardingWallet from '@/components/OnboardingWallet';

export default function Auth() {
  const { user, authUser, isAuthenticated, onboardingStep } = useAuth();
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState<'login' | 'verify'>('login');

  useEffect(() => {
    if (isAuthenticated && user?.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // If user is verified but not fully authenticated, show onboarding
  if (authUser?.isVerified && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {onboardingStep === 1 && <OnboardingWelcome />}
        {onboardingStep === 2 && <OnboardingProfile />}
        {onboardingStep === 3 && <OnboardingWallet />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {authStep === 'login' && (
        <AuthForm onNeedsVerification={() => setAuthStep('verify')} />
      )}
      {authStep === 'verify' && (
        <VerificationForm onBack={() => setAuthStep('login')} />
      )}
    </div>
  );
}