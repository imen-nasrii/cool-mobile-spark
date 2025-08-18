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
- **Deploying latest version from new GitHub repository:**
  - New repository: https://github.com/imen-nasrii/cool-mobile-spark.git
  - User requested fresh deployment from updated repository
  - Created comprehensive deployment script for complete reinstallation
  - Includes port conflict resolution and clean PM2 restart
  - Full environment configuration with all required variables
  - Database schema push and application build process
  - **Deployment in progress to update tomati.org with latest features**
- **Removed automatic advertising label feature:**
  - Removed "Publicité" badge that appeared on products with 3+ likes
  - Cleaned up badge logic from ProductCard and ProductListCard components
  - Simplified product display without advertising labels
- **Removed "Produits Populaires" section:**
  - Removed promoted products section from home page
  - Cleaned up unnecessary featured content display
  - Simplified home page layout without trending products showcase
- **Added selective advertisement labeling system:**
  - Added is_advertisement field to products database schema
  - Implemented "Publicité" badge for manually marked products (1 in 4 products)
  - Updated ProductCard and ProductListCard components to display advertisement badges
  - Provides controlled advertising display without automatic triggers
- **Enhanced messaging system with quick response suggestions:**
  - Added quick response buttons above message input field
  - Includes common responses: Location, Meeting, Price, Availability, Photos, Thanks
  - Color-coded suggestion buttons with emojis for better UX
  - Auto-fills message input when suggestion is selected
- **Added main navbar to map page:**
  - Integrated Header component with logo, search bar, and user menu
  - Maintained map-specific filters and controls below main navigation
  - Consistent navigation experience across all pages
- **Removed "Publier une annonce" button from navbar:**
  - Cleaned up header by removing publish ad button
  - Users can still access product posting through floating action button
  - Simplified navigation bar design
- **Simplified messaging design with flat style:**
  - Removed all gradients, animations, and visual effects from messaging
  - Used simple red, black, white color scheme without effects
  - Flat design with basic borders and solid colors
  - Removed hover animations and transition effects
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
- **Implemented photo display in messaging conversations:**
  - Added avatar_url column to users table
  - Updated messaging API to return user profile photos and product images
  - Conversations now display user profile photo alongside product photo
  - Fixed conversation data structure to show real images instead of letter circles
  - Both conversation list and chat headers show profile + product photos side by side
- **Implemented comprehensive user preferences system:**
  - Added user_preferences database table with full UI customization options
  - Created PreferencesContext for React state management with persistent settings
  - Built PreferencesDialog with flat design (red, black, white color scheme)
  - Added API routes for user preferences (GET, PATCH) with authentication
  - Integrated preferences access in Header dropdown menu
  - Includes theme, language, currency, view mode, accessibility, and notification preferences
  - Settings automatically apply and persist across user sessions
- **Created complete VPS OVH deployment documentation:**
  - Comprehensive step-by-step deployment guide (GUIDE_DEPLOIEMENT_VPS_OVH_COMPLET.md)
  - Automated deployment script (deploy-automatique-vps.sh) for one-command setup
  - Complete production environment with PostgreSQL, PM2, Nginx, and SSL
  - Includes monitoring scripts, backup procedures, and troubleshooting guides
  - Ready for deployment to production VPS with full security configuration
- **Successfully deployed to production on tomati.org:**
  - **Date: August 13, 2025**
  - Cleaned up conflicting deployment under "tomati" user
  - Fresh deployment under "hamdi" user from new GitHub repository
  - Application running on port 5000 with PM2 process management
  - Nginx configured as reverse proxy for tomati.org domain
  - **HTTPS SSL certificate properly configured and functional**
  - **Resolved SSL certificate mismatch issues:**
    * Migrated from Neon Database to local PostgreSQL to eliminate external HTTPS calls
    * Disabled Object Storage service to prevent Replit SIDECAR conflicts
    * Added TLS verification bypass for internal production calls
    * All API endpoints now return 200 OK status codes
  - Complete Tomati Market now live with all latest features:
    * Flat design with red, black, white color scheme
    * Enhanced messaging system with quick response suggestions
    * User preferences system with persistent settings
    * Product listings with view counts and rating system
    * Interactive map with product locations
    * Admin dashboard with role-based access control
    * Advertisement system with selective labeling
  - **Production environment fully stable and accessible at https://tomati.org**
  - **All core functionality operational in HTTPS with proper SSL security**
- **Transformed into Progressive Web App (PWA) for mobile compatibility:**
  - Created comprehensive manifest.json with Tomati branding for Android/iOS installation
  - Added service worker for offline functionality and caching capabilities
  - Mobile-first design optimized for smartphone usage and app store compatibility
  - PWA meta tags configured for proper mobile app experience
  - App shortcuts for quick access to search and favorites features
- **Successfully implemented completely flat design as requested ("effacer tous les effets"):**
  - **Date: August 18, 2025**
  - **User confirmed satisfaction with the flat design implementation**
  - **User preferred URL: https://21847abf-64d6-4dfa-9d61-fe7a2cc11771.riker.prod.repl.run/**
  - Removed all visual effects, transitions, animations, and 3D elements completely
  - Eliminated violet/purple color schemes and container effects entirely
  - Simplified car equipment icons using text-based symbols (ABS, ESP, climatisation, vitres électriques, etc.)
  - Consolidated all product information display into single flat containers with unified styling
  - Design strictly limited to red, black, and white color scheme only
  - Removed all hover states, gradients, shadows, and visual enhancements
  - All product detail pages now use consistent flat styling across categories
  - **Application successfully deployed and functional at preferred production URL**
  - **Full functionality confirmed:** product listings, navigation, filters, search, messaging, map, admin dashboard
  - **Corrected MIME type issues and WebSocket configuration for stable operation**