import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { AddButton } from "@/components/UI/FloatingButtons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MainLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  showAddButton?: boolean;
}

export const MainLayout = ({ 
  children, 
  showHeader = false, 
  showBottomNav = false,
  showAddButton = false 
}: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");

  // Determine active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (path === '/' && tabParam) {
      setActiveTab(tabParam);
    } else if (path === '/') {
      setActiveTab('home');
    } else if (path === '/map') {
      setActiveTab('map');
    } else if (path === '/messages') {
      setActiveTab('messages');
    } else if (path === '/profile') {
      setActiveTab('profile');
    } else if (path.includes('/search')) {
      setActiveTab('search');
    }
  }, [location]);

  const handleTabChange = (tab: string) => {
    // Check if user is trying to access protected features
    if ((tab === "messages" || tab === "profile") && !user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour accéder à cette fonctionnalité.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Navigate to the appropriate route
    switch (tab) {
      case "home":
        navigate("/");
        break;
      case "search":
        navigate("/?tab=search");
        break;
      case "map":
        navigate("/map");
        break;
      case "messages":
        navigate("/messages");
        break;
      case "profile":
        navigate("/profile");
        break;
      default:
        navigate(`/?tab=${tab}`);
    }
  };

  const handleSearch = (query: string) => {
    if (activeTab === "home") {
      // If on home, just stay there and let Home handle the search
      return;
    } else {
      // Navigate to search
      navigate("/?tab=search");
    }
  };

  const handleFloatingCategorySelect = (categoryId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour publier une annonce.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    navigate(`/?tab=add&category=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Arial, sans-serif' }}>
      {showHeader && (
        <Header 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          onSearch={handleSearch} 
        />
      )}
      
      <main className={showBottomNav ? "pb-20" : ""}>
        {children}
      </main>
      
      {showBottomNav && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
      
      {/* AddButton is now handled by Index.tsx */}
    </div>
  );
};