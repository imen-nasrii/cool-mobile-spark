# Tomati E-commerce Platform

## Project Overview
A full-stack e-commerce marketplace application successfully migrated from Lovable to Replit environment. The platform includes product listings, user authentication, messaging system, favorites, search functionality, and admin dashboard.

## Architecture
- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js server with custom REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based system with bcrypt password hashing
- **File Structure**: Clean separation between client and server code

## Recent Changes (January 20, 2025)
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
- ✅ **Advanced filtering and sorting system**: Professional search with price sliders, multi-criteria filtering
- ✅ **Complete admin CRUD system**: Full management interface for categories, products, and users
- ✅ **Professional admin dashboard**: Statistics overview, quick actions, and tabbed management interface

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