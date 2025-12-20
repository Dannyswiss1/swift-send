import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

// Suppress unhandled promise rejections from browser extensions (MetaMask, etc.)
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('MetaMask') ||
    event.reason?.message?.includes('wallet') ||
    event.reason?.stack?.includes('chrome-extension')
  ) {
    event.preventDefault();
    console.warn('Browser extension error suppressed:', event.reason?.message);
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
