import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthUser } from '@/types';
import { currentUser } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  onboardingStep: number;
  login: (identifier: string) => Promise<{ needsVerification: boolean; isNewUser: boolean }>;
  signup: (identifier: string, name?: string) => Promise<{ needsVerification: boolean }>;
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  completeOnboarding: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  setOnboardingStep: (step: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const login = async (identifier: string): Promise<{ needsVerification: boolean; isNewUser: boolean }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if user exists (mock logic)
    const isEmail = identifier.includes('@');
    const existingUser = isEmail ? 
      identifier === currentUser.email : 
      identifier === currentUser.phone;
    
    if (existingUser) {
      // User exists, check verification status
      const mockAuthUser: AuthUser = {
        id: currentUser.id,
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        isVerified: true,
        hasWallet: true
      };
      setAuthUser(mockAuthUser);
      
      if (mockAuthUser.isVerified) {
        // User is verified, log them in
        setUser(currentUser);
        return { needsVerification: false, isNewUser: false };
      } else {
        return { needsVerification: true, isNewUser: false };
      }
    } else {
      // New user, treat as signup
      const newAuthUser: AuthUser = {
        id: `user_${Date.now()}`,
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        isVerified: false,
        hasWallet: false
      };
      setAuthUser(newAuthUser);
      return { needsVerification: true, isNewUser: true };
    }
  };

  const signup = async (identifier: string, name?: string): Promise<{ needsVerification: boolean }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const isEmail = identifier.includes('@');
    const newAuthUser: AuthUser = {
      id: `user_${Date.now()}`,
      email: isEmail ? identifier : undefined,
      phone: !isEmail ? identifier : undefined,
      isVerified: false,
      hasWallet: false
    };
    setAuthUser(newAuthUser);
    return { needsVerification: true };
  };

  const verifyCode = async (code: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In development mode (localhost), accept any 6-digit code
    const isDevelopment = window.location.hostname === 'localhost';
    const isValidCode = isDevelopment ? code.length === 6 : code === '123456';
    
    if (!isValidCode) {
      throw new Error('Invalid verification code');
    }
    
    if (authUser) {
      const verifiedAuthUser = { ...authUser, isVerified: true };
      setAuthUser(verifiedAuthUser);
      
      // Check if this is an existing user or new user
      if (authUser.hasWallet) {
        // Existing user - load their data
        setUser(currentUser);
        setOnboardingStep(0);
      } else {
        // New user - start onboarding
        setOnboardingStep(1);
      }
    }
  };

  const resendCode = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const completeOnboarding = async (userData: Partial<User>) => {
    // Simulate API call and wallet creation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    if (authUser) {
      const newUser: User = {
        id: authUser.id,
        name: userData.name || 'User',
        email: authUser.email || userData.email,
        phone: authUser.phone || userData.phone || '',
        balance: 0,
        isVerified: true,
        onboardingCompleted: true,
        walletAddress: `wallet_${authUser.id}`,
        createdAt: new Date()
      };
      
      setUser(newUser);
      setOnboardingStep(0);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthUser(null);
    setOnboardingStep(0);
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authUser,
        isAuthenticated: !!user,
        isVerified: !!authUser?.isVerified,
        onboardingStep,
        login,
        signup,
        verifyCode,
        resendCode,
        completeOnboarding,
        logout,
        updateBalance,
        setOnboardingStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
