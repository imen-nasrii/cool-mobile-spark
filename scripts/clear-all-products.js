// Script pour supprimer tous les produits de la base de données
// Exécuter avec: node scripts/clear-all-products.js

import { db } from '../server/db.js';
import { products } from '../shared/schema.js';

async function clearAllProducts() {
  try {
    console.log('🗑️  Suppression de tous les produits...');
    
    // Compter les produits avant suppression
    const countBefore = await db.select().from(products);
    console.log(`📊 Nombre de produits avant suppression: ${countBefore.length}`);
    
    // Supprimer tous les produits
    const result = await db.delete(products);
    console.log(`✅ Suppression terminée`);
    
    // Vérifier que la suppression est effective
    const countAfter = await db.select().from(products);
    console.log(`📊 Nombre de produits après suppression: ${countAfter.length}`);
    
    if (countAfter.length === 0) {
      console.log('🎉 Tous les produits ont été supprimés avec succès !');
    } else {
      console.log('⚠️  Certains produits n\'ont pas pu être supprimés');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
  
  process.exit(0);
}

clearAllProducts();