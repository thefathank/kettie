import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/ClientDetails";
import Schedule from "./pages/Schedule";
import InstructionVideos from "./pages/InstructionVideos";
import Lessons from "./pages/Lessons";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Earn from "./pages/Earn";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Academy from "./pages/Academy";
import AcceptInvite from "./pages/AcceptInvite";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import DemoDashboard from "./pages/demo/DemoDashboard";
import DemoSchedule from "./pages/demo/DemoSchedule";
import DemoLessons from "./pages/demo/DemoLessons";
import { trackPageView } from "./lib/posthog";

const queryClient = new QueryClient();

// Component to track page views
function PageViewTracker() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
}

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <PageViewTracker />
              <Routes>
                <Route path="/landing" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/register/:plan" element={<Register />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/demo/dashboard" element={<DemoDashboard />} />
                <Route path="/demo/schedule" element={<DemoSchedule />} />
                <Route path="/demo/lessons" element={<DemoLessons />} />
                <Route path="/accept-invite" element={<AcceptInvite />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/academy" element={<ProtectedRoute><Academy /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/clients/:clientId" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
                <Route path="/instruction-videos" element={<ProtectedRoute><InstructionVideos /></ProtectedRoute>} />
                <Route path="/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/earn" element={<ProtectedRoute><Earn /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
