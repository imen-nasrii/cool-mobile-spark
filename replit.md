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
- Application successfully running on port 5000