# Tomati E-commerce Platform

## Project Overview
A full-stack e-commerce marketplace application successfully migrated from Lovable to Replit environment. The platform includes product listings, user authentication, messaging system, favorites, search functionality, and admin dashboard.

## Architecture
- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js server with custom REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based system with bcrypt password hashing
- **File Structure**: Clean separation between client and server code

## Recent Changes (January 25, 2025)
- ✅ **Successfully migrated to PostgreSQL with Drizzle ORM**: Complete database migration with all tables and relationships
- ✅ **Implemented custom JWT authentication system**: Secure user authentication and authorization with bcrypt
- ✅ **Created comprehensive RESTful API**: Complete backend with Express.js replacing Supabase client calls
- ✅ **Updated frontend with TanStack Query**: Modern data fetching with React Query and optimized caching
- ✅ **Built professional Admin Dashboard**: Full CRUD operations with role-based access control
- ✅ **Added AI chatbot for customer support**: Smart contextual responses for user assistance
- ✅ **Implemented automatic product promotion**: Products with 5+ messages become featured with visual indicators
- ✅ **Enhanced database with 8+ advanced tables**: Notifications, favorites, product views, search logs, user reviews
- ✅ **Created professional search and filtering**: Server-side filtering, full-text search, advanced modal interfaces
- ✅ **Implemented real-time notification system**: Bell icon with unread counts and live updates
- ✅ **Added comprehensive analytics tracking**: Search queries, product views, user behavior logging
- ✅ **Completed Tunisia localization**: TND currency, authentic Tunisian cities, bilingual French/Arabic interface
- ✅ **Built interactive map system**: Geolocation-based product discovery with distance calculation
- ✅ **Implemented complete like/favorites system**: Real-time heart button with authentication
- ✅ **Added real-time messaging system**: WebSocket-based user-to-user communication with chat interface
- ✅ **Created comprehensive user profiles**: Biography, statistics, location, rating system
- ✅ **Implemented peer-to-peer rating system**: Users can rate each other (1-5 stars) with reviews
- ✅ **Prepared complete VPS deployment package**: Scripts, configurations, Docker support for Hostinger deployment

## Technical Stack
- **Languages**: TypeScript, JavaScript
- **Frontend**: React 18, TanStack Query, React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL via Neon, Drizzle ORM
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: JWT tokens, bcrypt hashing
- **Development**: Vite, Hot Module Replacement

## Project Status
✅ **Production-Ready E-commerce Platform**: Successfully built and organized with:
- Complete PostgreSQL database with 8+ optimized tables
- Real-time messaging system with WebSocket infrastructure
- User profile and rating system for peer-to-peer trust
- Advanced search, filtering, and geolocation features
- Professional admin dashboard with comprehensive analytics
- AI chatbot for customer support
- Complete VPS deployment package for Hostinger
- Database optimization scripts and production monitoring
- Nginx configuration with SSL support
- Docker containerization alternative
- Automated deployment scripts

## Admin Access
- **Admin Account**: admin@tomati.com / admin123
- **Admin Features**: Create, edit, delete products and categories
- **Security**: Only admin role can access dashboard and management functions

## Database Schema (8+ Advanced Tables)
- `users`: User accounts with JWT authentication and role management
- `profiles`: Detailed user profiles with biography, location, statistics
- `products`: Product listings with geolocation, promotion status, analytics
- `categories`: Product categorization with icons and metadata
- `messages`: Real-time messaging system between users
- `user_reviews`: Peer-to-peer rating system (1-5 stars)
- `notifications`: Real-time notification system with read status
- `favorites`: User product likes and wishlist functionality  
- `product_views`: Analytics tracking for product view patterns
- `search_logs`: Search query logging for business intelligence
- All tables optimized with proper indexes and foreign key relationships

## User Preferences
- Focus on clean, maintainable code architecture
- Prioritize security and data integrity
- Use modern React patterns and best practices
- Maintain responsive design principles

## VPS Deployment Package
✅ **Complete deployment configuration for Hostinger VPS**:
- `deployment-guide.md`: Step-by-step deployment instructions
- `deploy.sh`: Automated deployment script with health checks
- `ecosystem.config.js`: PM2 process management configuration
- `nginx.conf`: Production Nginx configuration with SSL support
- `Dockerfile` & `docker-compose.yml`: Containerization alternative
- `database-optimization.sql`: Performance optimization queries
- Health check endpoints (`/api/health`, `/api/ready`)
- Production environment configuration
- Automated backup and monitoring setup
- Security configurations and firewall rules

## Next Steps for Production
- Configure domain name and DNS settings
- Set up SSL certificate with Let's Encrypt
- Configure automated backups and monitoring
- Implement payment integration (optional)
- Add image upload with cloud storage
- Set up email notifications system