import { pgTable, text, serial, integer, boolean, timestamp, uuid, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  display_name: text("display_name"),
  role: text("role").default("user").notNull(), // 'user' or 'admin'
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  phone: text("phone"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  location: text("location").notNull(),
  image_url: text("image_url"),
  category_id: uuid("category_id").references(() => categories.id),
  category: text("category").notNull(), // Keep for backward compatibility
  condition: text("condition").default("excellent"), // nouveau, bon, excellent, etc.
  tags: text("tags").array(), // tags pour recherche avancée
  views_count: integer("views_count").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  is_reserved: boolean("is_reserved").default(false).notNull(),
  is_free: boolean("is_free").default(false).notNull(),
  is_promoted: boolean("is_promoted").default(false).notNull(),
  is_urgent: boolean("is_urgent").default(false).notNull(),
  latitude: text("latitude"), // coordonnées GPS
  longitude: text("longitude"),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  sender_id: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  recipient_id: uuid("recipient_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  message_type: text("message_type").default("text"), // text, offer, question
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Nouvelles tables avancées
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // message, like, system, promotion
  reference_id: uuid("reference_id"), // ID du produit/message concerné
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const product_views = pgTable("product_views", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  ip_address: text("ip_address"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const search_logs = pgTable("search_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  query: text("query").notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  results_count: integer("results_count").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  created_at: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  created_at: true,
});

export const insertProductViewSchema = createInsertSchema(product_views).omit({
  id: true,
  created_at: true,
});

export const insertSearchLogSchema = createInsertSchema(search_logs).omit({
  id: true,
  created_at: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type InsertProductView = z.infer<typeof insertProductViewSchema>;
export type ProductView = typeof product_views.$inferSelect;

export type InsertSearchLog = z.infer<typeof insertSearchLogSchema>;
export type SearchLog = typeof search_logs.$inferSelect;

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title"),
  comment: text("comment"),
  is_verified_purchase: boolean("is_verified_purchase").default(false),
  is_featured: boolean("is_featured").default(false), // Marketing highlight
  helpful_count: integer("helpful_count").default(0),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewHelpful = pgTable("review_helpful", {
  id: uuid("id").primaryKey().defaultRandom(),
  review_id: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const marketingBadges = pgTable("marketing_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  badge_type: text("badge_type").notNull(), // "bestseller", "trending", "new", "popular", "verified"
  badge_text: text("badge_text").notNull(),
  badge_color: text("badge_color").notNull(),
  priority: integer("priority").default(0), // Higher priority shows first
  expires_at: timestamp("expires_at"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const productStats = pgTable("product_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  total_reviews: integer("total_reviews").default(0),
  average_rating: real("average_rating").default(0),
  total_views: integer("total_views").default(0),
  total_favorites: integer("total_favorites").default(0),
  total_messages: integer("total_messages").default(0),
  conversion_rate: real("conversion_rate").default(0), // Marketing metric
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for new tables
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertReviewHelpfulSchema = createInsertSchema(reviewHelpful).omit({
  id: true,
  created_at: true,
});

export const insertMarketingBadgeSchema = createInsertSchema(marketingBadges).omit({
  id: true,
  created_at: true,
});

export const insertProductStatsSchema = createInsertSchema(productStats).omit({
  id: true,
  updated_at: true,
});

// Types for new tables
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertReviewHelpful = z.infer<typeof insertReviewHelpfulSchema>;
export type ReviewHelpful = typeof reviewHelpful.$inferSelect;

export type InsertMarketingBadge = z.infer<typeof insertMarketingBadgeSchema>;
export type MarketingBadge = typeof marketingBadges.$inferSelect;

export type InsertProductStats = z.infer<typeof insertProductStatsSchema>;
export type ProductStats = typeof productStats.$inferSelect;
