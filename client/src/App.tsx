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

const App = () => {
  try {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Simple header for testing */}
          <header className="bg-white border-b-2 border-red-500 p-4">
            <h1 className="text-xl font-bold text-red-500">Tomati Market</h1>
          </header>
          
          {/* Main content */}
          <main className="flex-1 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Marketplace Tunisienne</h2>
              <p className="text-gray-600">Achetez et vendez en toute confiance</p>
            </div>
          </main>
          
          {/* Bottom navigation - mobile only */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-red-500 md:hidden">
            <div className="flex justify-around items-center py-2">
              <button className="flex flex-col items-center p-3 text-red-500">
                <span className="text-xs">Accueil</span>
              </button>
              <button className="flex flex-col items-center p-3 text-gray-600">
                <span className="text-xs">Recherche</span>
              </button>
              <button className="flex flex-col items-center p-3 text-gray-600">
                <span className="text-xs">Carte</span>
              </button>
              <button className="flex flex-col items-center p-3 text-gray-600">
                <span className="text-xs">Messages</span>
              </button>
              <button className="flex flex-col items-center p-3 text-gray-600">
                <span className="text-xs">Profil</span>
              </button>
            </div>
          </div>
          
          {/* Footer - desktop only */}
          <footer className="hidden md:block bg-gray-900 text-white py-8 mt-auto">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Tomati Market</h3>
                  <p className="text-gray-300">Votre marketplace de confiance en Tunisie</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Liens Rapides</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="/" className="hover:text-red-400">Accueil</a></li>
                    <li><a href="/search" className="hover:text-red-400">Rechercher</a></li>
                    <li><a href="/categories" className="hover:text-red-400">Catégories</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <p className="text-gray-300">contact@tomatimarket.tn</p>
                  <p className="text-gray-300">+216 20 123 456</p>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                <p className="text-gray-300">© 2024 Tomati Market. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Tomati Market</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
};

export default App;
