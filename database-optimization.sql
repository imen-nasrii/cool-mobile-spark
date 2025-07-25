-- Optimisations de base de données pour Tomati E-commerce
-- Exécutez ces requêtes après la création initiale des tables

-- Index pour améliorer les performances de recherche
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_location ON products(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_promoted ON products(is_promoted) WHERE is_promoted = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Index pour la recherche full-text
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_title_search ON products USING gin(to_tsvector('french', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('french', description));

-- Index pour la géolocalisation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_coordinates ON products(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Index pour les messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_product_id ON messages(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation ON messages(product_id, sender_id, recipient_id);

-- Index pour les utilisateurs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);

-- Index pour les profils
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_location ON profiles(location);

-- Index pour les favoris
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- Index pour les notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Index pour les vues de produits
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_views_created_at ON product_views(created_at DESC);

-- Index pour les logs de recherche
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_logs_user_id ON search_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at DESC);

-- Index pour les avis utilisateurs
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reviews_reviewed_user_id ON user_reviews(reviewed_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reviews_reviewer_id ON user_reviews(reviewer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reviews_rating ON user_reviews(rating);

-- Statistiques pour l'optimiseur
ANALYZE products;
ANALYZE messages;
ANALYZE users;
ANALYZE profiles;
ANALYZE favorites;
ANALYZE notifications;
ANALYZE product_views;
ANALYZE search_logs;
ANALYZE user_reviews;

-- Fonctions utiles pour l'administration
CREATE OR REPLACE FUNCTION update_product_promotion_status()
RETURNS void AS $$
BEGIN
    -- Marquer comme promus les produits avec 5+ messages
    UPDATE products 
    SET is_promoted = true 
    WHERE id IN (
        SELECT product_id 
        FROM messages 
        GROUP BY product_id 
        HAVING COUNT(*) >= 5
    ) AND is_promoted = false;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les anciennes données
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Supprimer les logs de recherche de plus de 6 mois
    DELETE FROM search_logs 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Supprimer les vues de produits de plus de 1 an
    DELETE FROM product_views 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Marquer comme lues les notifications de plus de 30 jours
    UPDATE notifications 
    SET is_read = true 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Vues pour les statistiques admin
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM messages) as total_messages,
    (SELECT COUNT(*) FROM products WHERE is_promoted = true) as promoted_products,
    (SELECT COUNT(*) FROM notifications WHERE is_read = false) as unread_notifications,
    (SELECT AVG(rating)::numeric(3,2) FROM user_reviews) as average_user_rating;

-- Vue pour les produits populaires
CREATE OR REPLACE VIEW popular_products AS
SELECT 
    p.*,
    COALESCE(v.view_count, 0) as view_count,
    COALESCE(m.message_count, 0) as message_count,
    COALESCE(f.favorite_count, 0) as favorite_count
FROM products p
LEFT JOIN (
    SELECT product_id, COUNT(*) as view_count 
    FROM product_views 
    GROUP BY product_id
) v ON p.id = v.product_id
LEFT JOIN (
    SELECT product_id, COUNT(*) as message_count 
    FROM messages 
    GROUP BY product_id
) m ON p.id = m.product_id
LEFT JOIN (
    SELECT product_id, COUNT(*) as favorite_count 
    FROM favorites 
    GROUP BY product_id
) f ON p.id = f.product_id
ORDER BY 
    COALESCE(v.view_count, 0) + 
    COALESCE(m.message_count, 0) * 2 + 
    COALESCE(f.favorite_count, 0) * 3 DESC;

-- Configuration PostgreSQL recommandée
-- (À ajouter dans postgresql.conf)
-- shared_preload_libraries = 'pg_stat_statements'
-- max_connections = 100
-- shared_buffers = 256MB
-- effective_cache_size = 1GB
-- work_mem = 4MB
-- maintenance_work_mem = 64MB
-- checkpoint_completion_target = 0.7
-- wal_buffers = 16MB
-- default_statistics_target = 100