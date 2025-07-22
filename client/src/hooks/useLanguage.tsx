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
    filters: "Filtres",
    searchBtn: "Rechercher",
    categories: "Catégories",
    priceRange: "Gamme de prix",
    location: "Localisation",
    enterLocation: "Entrez la ville",
    quickFilters: "Filtres rapides",
    freeOnly: "Gratuit uniquement",
    availableOnly: "Disponible seulement",
    promotedOnly: "Promu seulement",
    reset: "Réinitialiser",
    applyFilters: "Appliquer les filtres",
    searchProducts: "Rechercher des produits",
    recentSearches: "Recherches récentes",
    popularSearches: "Recherches populaires",
    searchFor: "Rechercher pour",
    
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
    filters: "المرشحات",
    searchBtn: "البحث",
    categories: "الفئات", 
    priceRange: "نطاق السعر",
    location: "الموقع",
    enterLocation: "أدخل المدينة",
    quickFilters: "مرشحات سريعة",
    freeOnly: "مجاني فقط",
    availableOnly: "متاح فقط",
    promotedOnly: "مروج فقط",
    reset: "إعادة تعيين",
    applyFilters: "تطبيق المرشحات",
    searchProducts: "البحث عن المنتجات",
    recentSearches: "البحث الأخيرة",
    popularSearches: "البحث الشائعة",
    searchFor: "البحث عن",
    
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