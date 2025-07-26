// Test script pour tester la promotion automatique
// Simuler 3 likes sur un produit

const axios = require('axios');

const baseUrl = 'http://localhost:5000';

// Test data
const testProduct = "6c501678-2300-4074-acd6-be729ecd2a4a"; // ID d'un produit existant
const userToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"; // Token d'authentification

async function testAutoPromotion() {
  console.log('🧪 Test de promotion automatique');
  
  try {
    // Liker le produit 3 fois (simule 3 utilisateurs différents)
    for (let i = 1; i <= 3; i++) {
      console.log(`\n👍 Like ${i}/3...`);
      
      const response = await axios.post(
        `${baseUrl}/api/products/${testProduct}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Réponse: ${response.data.message}`);
      
      // Vérifier l'état du produit
      const productResponse = await axios.get(`${baseUrl}/api/products/${testProduct}`);
      const product = productResponse.data;
      
      console.log(`📊 Produit: ${product.title}`);
      console.log(`❤️ Likes: ${product.like_count || 0}`);
      console.log(`🎯 Promu: ${product.is_promoted ? 'OUI' : 'NON'}`);
      
      if (product.is_promoted) {
        console.log('🎉 PROMOTION AUTOMATIQUE ACTIVÉE !');
        console.log(`⏰ Promu le: ${product.promoted_at}`);
        break;
      }
      
      // Attendre 1 seconde entre chaque like
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.data || error.message);
  }
}

// Lancer le test
testAutoPromotion();