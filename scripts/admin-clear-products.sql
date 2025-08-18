-- Script SQL pour supprimer tous les produits
-- Peut être exécuté directement sur la base de données de production

-- Afficher le nombre de produits avant suppression
SELECT COUNT(*) as "Produits avant suppression" FROM products;

-- Supprimer tous les produits
DELETE FROM products;

-- Afficher le nombre de produits après suppression
SELECT COUNT(*) as "Produits après suppression" FROM products;

-- Afficher un message de confirmation
SELECT 'Tous les produits ont été supprimés avec succès!' as "Statut";