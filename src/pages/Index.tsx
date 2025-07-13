import { useState } from "react";
import { Home } from "./Home";
import { Messages } from "./Messages";
import { ProductDetail } from "./ProductDetail";
import { BottomNav } from "@/components/Layout/BottomNav";
import { FloatingActionButton } from "@/components/Layout/FloatingActionButton";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentView, setCurrentView] = useState<"main" | "product">("main");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Show toast for non-implemented features
    if (["search", "add", "profile"].includes(tab)) {
      toast({
        title: "Coming Soon!",
        description: `${tab.charAt(0).toUpperCase() + tab.slice(1)} feature will be available soon.`,
      });
      return;
    }
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
    if (currentView === "product") {
      return (
        <ProductDetail 
          productId={selectedProduct}
          onBack={handleBackToMain}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return <Home onProductClick={handleProductClick} />;
      case "messages":
        return <Messages />;
      default:
        return <Home onProductClick={handleProductClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      {currentView === "main" && (
        <>
          <FloatingActionButton />
          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
    </div>
  );
};

export default Index;
