import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
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
  category: text("category").notNull(),
  likes: integer("likes").default(0).notNull(),
  like_count: integer("like_count").default(0).notNull(),
  is_reserved: boolean("is_reserved").default(false).notNull(),
  is_free: boolean("is_free").default(false).notNull(),
  is_promoted: boolean("is_promoted").default(false).notNull(),
  promoted_at: timestamp("promoted_at"),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  
  // Champs spécifiques aux voitures
  car_fuel_type: text("car_fuel_type"), // Essence, Diesel, Électrique, Hybride
  car_transmission: text("car_transmission"), // Manuelle, Automatique
  car_year: integer("car_year"),
  car_mileage: integer("car_mileage"), // Kilométrage
  car_engine_size: text("car_engine_size"), // Cylindrée (ex: 1.6L)
  car_doors: integer("car_doors"), // Nombre de portes
  car_seats: integer("car_seats"), // Nombre de places
  car_color: text("car_color"),
  car_brand: text("car_brand"), // Marque
  car_model: text("car_model"), // Modèle
  car_condition: text("car_condition"), // Neuf, Occasion, Accidenté
  
  // Champs spécifiques à l'immobilier
  real_estate_type: text("real_estate_type"), // Appartement, Maison, Villa, Bureau, Local commercial
  real_estate_rooms: integer("real_estate_rooms"), // Nombre de chambres
  real_estate_bathrooms: integer("real_estate_bathrooms"), // Nombre de salles de bains
  real_estate_surface: integer("real_estate_surface"), // Surface en m²
  real_estate_floor: integer("real_estate_floor"), // Étage
  real_estate_furnished: boolean("real_estate_furnished"), // Meublé ou non
  real_estate_parking: boolean("real_estate_parking"), // Place de parking
  real_estate_garden: boolean("real_estate_garden"), // Jardin
  real_estate_balcony: boolean("real_estate_balcony"), // Balcon
  real_estate_condition: text("real_estate_condition"), // État: Excellent, Bon, À rénover
  
  // Champs spécifiques aux emplois
  job_type: text("job_type"), // CDI, CDD, Stage, Freelance, Temps partiel
  job_sector: text("job_sector"), // Informatique, Commerce, Santé, Éducation, etc.
  job_experience: text("job_experience"), // Débutant, 1-3 ans, 3-5 ans, 5+ ans
  job_education: text("job_education"), // Bac, Bac+2, Bac+3, Bac+5, etc.
  job_salary_min: integer("job_salary_min"), // Salaire minimum
  job_salary_max: integer("job_salary_max"), // Salaire maximum
  job_remote: boolean("job_remote"), // Télétravail possible
  job_urgency: text("job_urgency"), // Normal, Urgent, Très urgent
  job_company: text("job_company"), // Nom de l'entreprise
  job_benefits: text("job_benefits"), // Avantages (JSON string)
  
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Conversations table for managing chat threads
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }),
  buyer_id: uuid("buyer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  seller_id: uuid("seller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  last_message_at: timestamp("last_message_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Messages table for individual messages within conversations
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  sender_id: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  message_type: text("message_type").default("text").notNull(), // 'text', 'image', 'file'
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Message read status for tracking who has read what
export const message_reads = pgTable("message_reads", {
  id: uuid("id").primaryKey().defaultRandom(),
  message_id: uuid("message_id").references(() => messages.id, { onDelete: "cascade" }).notNull(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  read_at: timestamp("read_at").defaultNow().notNull(),
});

// Product likes for tracking user likes on products
export const product_likes = pgTable("product_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table for user notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'message', 'like', 'review', 'product_update'
  related_id: uuid("related_id"), // ID of the related entity (message, product, etc.)
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Advertisements table for promoted content
export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image_url: text("image_url"),
  target_url: text("target_url"),
  advertiser_name: text("advertiser_name").notNull(),
  category: text("category"), // Target specific categories
  position: text("position").notNull(), // 'header', 'sidebar', 'between_products', 'footer'
  is_active: boolean("is_active").default(true).notNull(),
  start_date: timestamp("start_date").defaultNow().notNull(),
  end_date: timestamp("end_date"),
  click_count: integer("click_count").default(0).notNull(),
  impression_count: integer("impression_count").default(0).notNull(),
  budget: integer("budget"), // in cents
  cost_per_click: integer("cost_per_click").default(100), // in cents
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
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

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  created_at: true,
  last_message_at: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  created_at: true,
});

export const insertMessageReadSchema = createInsertSchema(message_reads).omit({
  id: true,
  read_at: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  created_at: true,
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  created_at: true,
  updated_at: true,
  click_count: true,
  impression_count: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Category = typeof categories.$inferSelect;
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ChatMessage = typeof messages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertMessageSchema>;
export type MessageRead = typeof message_reads.$inferSelect;
export type InsertMessageRead = z.infer<typeof insertMessageReadSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
