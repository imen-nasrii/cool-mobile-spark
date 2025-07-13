import { useState } from "react";
import { Home as HomeIcon, Search as SearchIcon, PlusCircle, MessageCircle, User, Bell, ShoppingCart } from "lucide-react";
import { Home as HomePage } from "./Home";
import { Messages } from "./Messages";
import { ProductDetail } from "./ProductDetail";
import { Search } from "./Search";
import { AddProduct } from "./AddProduct";
import { Profile } from "./Profile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState<"main" | "product">("main");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentView("product");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setSelectedProduct("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
      case "search":
        return <Search activeTab={activeTab} onTabChange={handleTabChange} onProductClick={handleProductClick} />;
      case "add":
        return <AddProduct activeTab={activeTab} onTabChange={handleTabChange} />;
      case "messages":
        return <Messages activeTab={activeTab} onTabChange={handleTabChange} />;
      case "profile":
        return <Profile activeTab={activeTab} onTabChange={handleTabChange} />;
      default:
        return <HomePage onProductClick={handleProductClick} activeTab={activeTab} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentView === "product" ? (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      ) : (
        <>
          <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold bg-gradient-tomati bg-clip-text text-transparent">
                    Tomati
                  </h1>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  {[
                    { id: "home", icon: HomeIcon, label: "Accueil" },
                    { id: "search", icon: SearchIcon, label: "Recherche" },
                    { id: "messages", icon: MessageCircle, label: "Messages" },
                    { id: "profile", icon: User, label: "Profil" },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => handleTabChange(id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === id 
                          ? "bg-gradient-tomati text-white" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </nav>

                {/* Right side buttons */}
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => handleTabChange("add")}
                    className="bg-gradient-tomati hover:opacity-90 text-white font-medium px-4 py-2"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Ajouter
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bell size={18} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ShoppingCart size={18} />
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
                <div className="flex justify-around items-center">
                  {[
                    { id: "home", icon: HomeIcon, label: "Accueil" },
                    { id: "search", icon: SearchIcon, label: "Recherche" },
                    { id: "add", icon: PlusCircle, label: "Ajouter" },
                    { id: "messages", icon: MessageCircle, label: "Messages" },
                    { id: "profile", icon: User, label: "Profil" },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => handleTabChange(id)}
                      className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                        activeTab === id 
                          ? "text-primary" 
                          : "text-gray-500"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {renderContent()}
          </main>
        </>
      )}
    </div>
  );
};

export default Index;
