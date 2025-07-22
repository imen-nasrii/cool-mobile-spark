// Currency utilities for Tunisia
export const formatPrice = (price: number, isFree?: boolean): string => {
  if (isFree) {
    return "Gratuit";
  }
  
  return `${price.toLocaleString('fr-TN')} TND`;
};

export const formatPriceArabic = (price: number, isFree?: boolean): string => {
  if (isFree) {
    return "مجاني";
  }
  
  return `${price.toLocaleString('ar-TN')} دت`;
};

// Tunisian cities for location suggestions
export const tunisianCities = [
  "Tunis", "Sfax", "Sousse", "Ettadhamen", "Kairouan", "Bizerte", 
  "Gabès", "Aryanah", "Gafsa", "Monastir", "Ben Arous", "Kasserine",
  "Médenine", "Nabeul", "Tataouine", "Beja", "Jendouba", "Mahdia",
  "Siliana", "Kébili", "Le Kef", "Tozeur", "Zaghouan", "Manouba"
];