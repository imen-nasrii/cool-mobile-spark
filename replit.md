# Tomati E-commerce Platform

## Overview
Tomati is a full-stack e-commerce marketplace platform, migrated from Lovable to Replit. It offers comprehensive features including product listings (with category-specific fields for cars, real estate, and jobs), user authentication, real-time messaging, favorites, advanced search and filtering, an interactive map with geolocation, and an administrative dashboard. The platform's vision is to provide a modern, secure, and user-friendly marketplace experience with advanced functionalities like AI chatbot support and an advertising system.

## User Preferences
- Focus on clean, maintainable code architecture
- Prioritize security and data integrity
- Use modern React patterns and best practices
- Maintain responsive design principles

## System Architecture
The platform is built with a clear separation between client and server. The frontend utilizes React with TypeScript, TanStack Query for data fetching, Tailwind CSS, and shadcn/ui for a minimalist and modern UI. The backend is an Express.js server providing a custom REST API. PostgreSQL with Drizzle ORM serves as the database. Authentication is handled via a custom JWT-based system with bcrypt hashing. Key features include a role-based admin dashboard with full CRUD operations for products, categories, and users; an AI chatbot for customer support; an interactive map with product filtering and direct messaging integration; a real-time WebSocket-based messaging system; and an advanced advertising system with impression/click tracking. The application implements an `ErrorBoundary` for robust error handling and has a consistent Arial font implementation. Prices are displayed in Tunisian dinars (TND) throughout the application. Product details include comprehensive icon systems for category-specific fields and an "Équipements disponibles" section for detailed feature display.

## External Dependencies
- **Database**: PostgreSQL (via Neon)
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: PM2, Nginx
- **Geolocation**: Leaflet (for interactive map)
- **Version Control**: GitHub

## Recent Changes
**Date: August 12, 2025**
- Fixed database schema issues in profile management routes
- Removed unused fields (location, phone) from profiles table operations
- Resolved TypeScript compilation errors in server/routes.ts
- Fixed profile update functionality - removed obsolete location/phone fields from UI
- Product photo display working correctly in product details pages
- WebSocket authentication improved
- Application successfully running on port 5000
- **Implemented functional views and rating system:**
  - Added view_count and rating fields to products database schema
  - Created automatic view counting when users access product details
  - Built interactive 5-star rating system with click functionality
  - Added product rating API routes (/api/products/:id/rate, /api/products/:id/rating)
  - Updated UI to display real view counts and ratings instead of placeholders
  - Fixed missing cn import in ProductDetail.tsx
- **Fixed Admin Dashboard and Category Management:**
  - Resolved all TypeScript errors in admin components
  - Cleaned up duplicate categories in database (removed Electronics/Électronique, Sports/Sport, Voiture/Auto duplicates)
  - Standardized category names to French (Furniture → Meubles)
  - Final categories: Auto, Autres, Emplois, Meubles, Immobilier, Mode, Sport, Électronique
  - Admin dashboard fully functional with real database statistics
- **Prepared for deployment to VPS OVH with user credentials**
- **Created comprehensive GitHub deployment strategy:**
  - GitHub repository deployment scripts for VPS OVH
  - Automated deployment workflow via git clone and pull
  - Complete deployment documentation for GitHub method
  - Production-ready PM2 ecosystem configuration
  - Database migration integration in deployment process
- **Removed automatic advertising label feature:**
  - Removed "Publicité" badge that appeared on products with 3+ likes
  - Cleaned up badge logic from ProductCard and ProductListCard components
  - Simplified product display without advertising labels
- **Updated logo design:**
  - Removed red square "T" icon from header
  - Simplified logo to display only "tomati" text in red
- **Implemented floating action button with category shortcuts:**
  - Created vertical stack FAB with 4 category icons (Immobilier-blue, Voiture-green, Emplois-purple, Autres-orange)
  - Each button directly opens the specific category add form
  - Smooth animations and hover effects
  - Positioned at bottom-right with proper z-index
- **Updated bottom navigation:**
  - Replaced "Ajouter" tab with "Carte" (GPS icon)
  - Map tab now redirects to existing /map page with product locations
  - Streamlined navigation focused on core features