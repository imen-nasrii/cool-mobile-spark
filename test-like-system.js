import fetch from 'node-fetch';

// Test du système de likes avec de vrais tokens
async function testLikeSystem() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Test du système de j\'aimes avec promotion automatique\n');
  
  try {
    // 1. Login pour obtenir un token valide
    console.log('1. Connexion en tant qu\'utilisateur...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'user@tomati.com',
        password: 'user123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      throw new Error('Impossible de se connecter');
    }
    
    const userToken = loginData.token;
    console.log('✅ Connexion réussie');
    
    // 2. Obtenir la liste des produits
    console.log('2. Récupération des produits...');
    const productsResponse = await fetch(`${baseUrl}/api/products`);
    const products = await productsResponse.json();
    
    if (!products || products.length === 0) {
      throw new Error('Aucun produit trouvé');
    }
    
    // Prendre le premier produit qui n'appartient pas à l'utilisateur connecté
    const testProduct = products.find(p => p.user_id !== loginData.user.id);
    if (!testProduct) {
      console.log('⚠️ Aucun produit d\'un autre utilisateur trouvé');
      return;
    }
    
    console.log(`✅ Produit sélectionné: ${testProduct.title} (ID: ${testProduct.id})`);
    console.log(`📊 Likes actuels: ${testProduct.like_count || 0}`);
    console.log(`🎯 Promu: ${testProduct.is_promoted ? 'OUI' : 'NON'}\n`);
    
    // 3. Tester le système de like
    console.log('3. Test du système de like...');
    const likeResponse = await fetch(`${baseUrl}/api/products/${testProduct.id}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const likeData = await likeResponse.json();
    
    if (likeResponse.ok) {
      console.log(`✅ Like ajouté avec succès: ${likeData.message}`);
    } else {
      console.log(`❌ Erreur: ${likeData.error}`);
    }
    
    // 4. Vérifier l'état mis à jour du produit
    console.log('4. Vérification de l\'état mis à jour...');
    const updatedProductResponse = await fetch(`${baseUrl}/api/products/${testProduct.id}`);
    const updatedProduct = await updatedProductResponse.json();
    
    console.log(`📊 Nouveaux likes: ${updatedProduct.like_count || 0}`);
    console.log(`🎯 Promu: ${updatedProduct.is_promoted ? 'OUI' : 'NON'}`);
    
    if (updatedProduct.is_promoted) {
      console.log(`🎉 PROMOTION AUTOMATIQUE ACTIVÉE !`);
      console.log(`⏰ Promu le: ${updatedProduct.promoted_at}`);
    }
    
    // 5. Vérifier si l'utilisateur a aimé le produit
    console.log('5. Vérification du statut de like...');
    const likedStatusResponse = await fetch(`${baseUrl}/api/products/${testProduct.id}/liked`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const likedStatus = await likedStatusResponse.json();
    console.log(`❤️ Utilisateur a aimé: ${likedStatus.liked ? 'OUI' : 'NON'}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testLikeSystem();