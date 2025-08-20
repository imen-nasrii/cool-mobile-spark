import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { AdminRoute } from "@/components/Auth/AdminRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainLayout } from "@/components/Layout/MainLayout";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import MapView from "./pages/MapView";
import MessagesPage from "./pages/Messages";
import { AdminInfo } from "./components/Auth/AdminInfo";
import { Settings } from "./pages/Settings";
import { TestPromotion } from "./pages/TestPromotion";
import { ProductManagement } from "./pages/ProductManagement";
import { OrganizedProducts } from "./pages/OrganizedProducts";
import AdminProducts from "./pages/AdminProducts";
import AdminAdvertisements from "./pages/AdminAdvertisements";
import { Notifications } from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from "./components/PWA/PWAInstallPrompt";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <PreferencesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <MainLayout>
                  <Index />
                </MainLayout>
              } />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route path="/map" element={
                <MainLayout>
                  <MapView />
                </MainLayout>
              } />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MessagesPage />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/test-promotion" 
                element={
                  <ProtectedRoute>
                    <TestPromotion />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products-management" 
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <ProductManagement />
                    </AdminRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/advertisements" 
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <AdminAdvertisements />
                    </AdminRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Notifications />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route path="/products" element={<OrganizedProducts />} />
              <Route path="/admin-info" element={<AdminInfo />} />
              <Route path="/post" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
            </PreferencesProvider>
          </AuthProvider>
        </LanguageProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
