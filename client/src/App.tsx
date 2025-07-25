import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";

import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { AdminRoute } from "@/components/Auth/AdminRoute";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { Login } from "./pages/Login";
import { AuthLanding } from "./pages/AuthLanding";
import AdminDashboard from "./pages/AdminDashboard";
import SimpleDashboard from "./pages/SimpleDashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import { AdminInfo } from "./components/Auth/AdminInfo";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Pages d'authentification */}
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Landing page avec redirection automatique */}
              <Route path="/welcome" element={<AuthLanding />} />
              
              {/* Application principale pour utilisateurs connectés */}
              <Route path="/" element={
                <ProtectedRoute redirectTo="/login">
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Dashboard admin avec protection */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login">
                  <SimpleDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin dashboard avec protection */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin" redirectTo="/login">
                    <AdminDashboard />
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
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin-info" element={<AdminInfo />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
