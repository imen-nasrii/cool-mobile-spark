import { db } from './server/db.js';
import { products, product_likes, users } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Test simple du système de likes
async function testLikes() {
  console.log('🧪 Test simple du système de likes\n');

  try {
    // 1. Récupérer tous les produits
    const allProducts = await db.select().from(products).limit(3);
    console.log('📦 Produits disponibles:');
    allProducts.forEach(p => {
      console.log(`- ${p.title} (${p.like_count || 0} likes)`);
    });

    if (allProducts.length === 0) {
      console.log('❌ Aucun produit trouvé');
      return;
    }

    // 2. Récupérer tous les utilisateurs
    const allUsers = await db.select().from(users);
    console.log('\n👥 Utilisateurs disponibles:');
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.id})`);
    });

    if (allUsers.length < 2) {
      console.log('❌ Besoin d\'au moins 2 utilisateurs pour tester');
      return;
    }

    const testProduct = allProducts[0];
    const testUsers = allUsers.slice(0, 3); // Prendre 3 utilisateurs pour 3 likes

    console.log(`\n🎯 Test avec le produit: ${testProduct.title}`);
    console.log(`📊 Likes actuels: ${testProduct.like_count || 0}`);

    // 3. Ajouter des likes de différents utilisateurs
    for (let i = 0; i < Math.min(3, testUsers.length); i++) {
      const user = testUsers[i];
      
      try {
        // Vérifier si ce user a déjà liké ce produit
        const existingLike = await db
          .select()
          .from(product_likes)
          .where(and(
            eq(product_likes.product_id, testProduct.id),
            eq(product_likes.user_id, user.id)
          ));

        if (existingLike.length > 0) {
          console.log(`⚠️ ${user.email} a déjà aimé ce produit`);
          continue;
        }

        // Ajouter le like
        await db.insert(product_likes).values({
          product_id: testProduct.id,
          user_id: user.id
        });

        console.log(`✅ Like ${i + 1}/3 ajouté par ${user.email}`);

        // Compter les likes
        const likeCount = await db
          .select()
          .from(product_likes)
          .where(eq(product_likes.product_id, testProduct.id));

        // Mettre à jour le count dans products
        await db
          .update(products)
          .set({ like_count: likeCount.length })
          .where(eq(products.id, testProduct.id));

        // Vérifier la promotion
        if (likeCount.length >= 3) {
          await db
            .update(products)
            .set({ 
              is_promoted: true,
              promoted_at: new Date()
            })
            .where(eq(products.id, testProduct.id));

          console.log('🎉 PRODUIT AUTOMATIQUEMENT PROMU !');
        }

      } catch (error) {
        console.log(`❌ Erreur pour ${user.email}: ${error.message}`);
      }
    }

    // 4. Vérifier l'état final
    const finalProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, testProduct.id));

    const finalCount = await db
      .select()
      .from(product_likes)
      .where(eq(product_likes.product_id, testProduct.id));

    console.log('\n📊 État final:');
    console.log(`- Likes en DB: ${finalCount.length}`);
    console.log(`- Like count: ${finalProduct[0].like_count}`);
    console.log(`- Promu: ${finalProduct[0].is_promoted ? 'OUI' : 'NON'}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testLikes();