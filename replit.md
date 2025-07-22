# Tomati E-commerce Platform

## Project Overview
A full-stack e-commerce marketplace application successfully migrated from Lovable to Replit environment. The platform includes product listings, user authentication, messaging system, favorites, search functionality, and admin dashboard.

## Architecture
- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js server with custom REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based system with bcrypt password hashing
- **File Structure**: Clean separation between client and server code

## Recent Changes (January 22, 2025)
- ✅ **Successfully migrated from Supabase to PostgreSQL**: Complete database migration with all tables and relationships
- ✅ **Replaced Supabase authentication with custom JWT system**: Secure user authentication and authorization
- ✅ **Created comprehensive API layer**: RESTful endpoints replacing Supabase client calls
- ✅ **Updated frontend to use TanStack Query**: Modern data fetching with React Query
- ✅ **Fixed all TypeScript errors and build issues**: Clean, production-ready codebase
- ✅ **Database populated with sample data**: Products, categories, and users for testing
- ✅ **Created Admin Dashboard with full CRUD operations**: Complete product management interface
- ✅ **Organized authentication system**: Added protected routes, user menu, and profile management
- ✅ **Implemented role-based admin access**: Only admin accounts can access dashboard
- ✅ **Added AI chatbot for customer support**: Smart bot with contextual responses
- ✅ **Removed all fake dashboard data**: Dashboard now displays only authentic database statistics
- ✅ **Implemented automatic product promotion system**: Products with 5+ messages become featured ads automatically
- ✅ **Added visual promotion indicators**: Promoted products display with "🔥 PUB" badge and special styling
- ✅ **Enhanced database schema**: Added advanced tables for notifications, favorites, product views, search logs
- ✅ **Implemented professional filtering and search**: Server-side filtering by category, full-text search with ilike
- ✅ **Created notification system**: Professional notification bell with real-time updates and unread counts
- ✅ **Added search analytics**: Search queries are logged and tracked for business intelligence
- ✅ **Enhanced product views**: Track and analytics for product viewing patterns
- ✅ **Localized for Tunisia**: All prices in TND, Tunisian cities in location suggestions, Arabic/French bilingual interface
- ✅ **Professional search and filter modals**: Advanced filtering by price, location, categories with clean UI
- ✅ **Fixed infinite render loops**: Optimized React components for stable performance

## Technical Stack
- **Languages**: TypeScript, JavaScript
- **Frontend**: React 18, TanStack Query, React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL via Neon, Drizzle ORM
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: JWT tokens, bcrypt hashing
- **Development**: Vite, Hot Module Replacement

## Project Status
✅ **Migration Complete**: Successfully running on Replit with:
- Working product listings with sample data
- Role-based authentication system (admin/user)
- Database properly configured and connected
- Admin dashboard with full product management
- AI chatbot for customer support
- Clean codebase with no critical errors

## Admin Access
- **Admin Account**: admin@tomati.com / admin123
- **Admin Features**: Create, edit, delete products and categories
- **Security**: Only admin role can access dashboard and management functions

## Database Schema
- `users`: User accounts with authentication
- `profiles`: User profile information
- `products`: Product listings with details
- `categories`: Product categorization
- `messages`: User communication system
- All tables properly linked with foreign key relationships

## User Preferences
- Focus on clean, maintainable code architecture
- Prioritize security and data integrity
- Use modern React patterns and best practices
- Maintain responsive design principles

## Next Steps for Development
- Add image upload functionality
- Implement real-time messaging with WebSocket
- Add admin role management system
- Enhance product filtering and search
- Add payment integration capabilities