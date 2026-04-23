import { ThemeProvider } from "next-themes";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { WalletProvider } from "./contexts/WalletContext";
import { ComplianceProvider } from "./contexts/ComplianceContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SendMoney from "./pages/SendMoney";
import AddFunds from "./pages/AddFunds";
import Withdraw from "./pages/Withdraw";
import RemittanceStatus from "./pages/RemittanceStatus";
import CashOutOptions from "./pages/CashOutOptions";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { VerificationFlow } from "./components/VerificationFlow";
import ComplianceInfo from "./pages/ComplianceInfo";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/send"
        element={
          <ProtectedRoute>
            <SendMoney />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-funds"
        element={
          <ProtectedRoute>
            <AddFunds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdraw"
        element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        }
      />
      <Route
        path="/remittance"
        element={
          <ProtectedRoute>
            <RemittanceStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cash-out"
        element={
          <ProtectedRoute>
            <CashOutOptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification"
        element={
          <ProtectedRoute>
            <VerificationFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance-info"
        element={
          <ProtectedRoute>
            <ComplianceInfo />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <WalletProvider>
            <ComplianceProvider>
              <SonnerToaster />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </ComplianceProvider>
          </WalletProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
