import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Header
    tomati: "Tomati",
    
    // Categories
    allCategories: "Toutes les catégories",
    cars: "Voitures",
    realEstate: "Immobilier", 
    jobs: "Emplois",
    others: "Autres",
    
    // Products
    recentListings: "Annonces récentes",
    viewAll: "Voir tout",
    noProducts: "Aucun produit trouvé dans cette catégorie",
    
    // Navigation
    home: "Accueil",
    search: "Rechercher",
    add: "Ajouter",
    messages: "Messages",
    profile: "Profil",
    
    // Product details
    sold: "Vendu",
    free: "Gratuit",
    
    // Profile
    myPosts: "Mes publications",
    reviews: "Avis",
    accountSettings: "Paramètres du compte",
    personalInfo: "Informations personnelles",
    other: "Autre",
    logout: "Se déconnecter",
    main: "Principal"
  },
  ar: {
    // Header
    tomati: "طماطي",
    
    // Categories  
    allCategories: "جميع الفئات",
    cars: "سيارات",
    realEstate: "عقارات",
    jobs: "وظائف", 
    others: "أخرى",
    
    // Products
    recentListings: "الإعلانات الأخيرة",
    viewAll: "عرض الكل",
    noProducts: "لا توجد منتجات في هذه الفئة",
    
    // Navigation
    home: "الرئيسية",
    search: "البحث",
    add: "إضافة",
    messages: "الرسائل",
    profile: "الملف الشخصي",
    
    // Product details
    sold: "مباع",
    free: "مجاني",
    
    // Profile
    myPosts: "منشوراتي",
    reviews: "التقييمات",
    accountSettings: "إعدادات الحساب",
    personalInfo: "المعلومات الشخصية",
    other: "أخرى",
    logout: "تسجيل الخروج",
    main: "الرئيسية"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};