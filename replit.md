# Tomati E-commerce Platform

## Project Overview
A full-stack e-commerce marketplace application successfully migrated from Lovable to Replit environment. The platform includes product listings, user authentication, messaging system, favorites, search functionality, and admin dashboard.

## Architecture
- **Frontend**: React with TypeScript, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js server with custom REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Custom JWT-based system with bcrypt password hashing
- **File Structure**: Clean separation between client and server code

## Recent Changes (January 26, 2025)
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
- ✅ **Interactive map with geolocation**: Leaflet-based map showing user position and nearby products
- ✅ **AI chat assistant**: Smart chatbot for user assistance and platform questions
- ✅ **Map-based product filtering**: Filter by category, price range, and distance with visual markers
- ✅ **Real-time messaging system**: Complete WebSocket-based chat with PostgreSQL storage
- ✅ **Map-to-messaging integration**: Direct "Contacter" button from product popups to start conversations
- ✅ **Comprehensive messaging API**: Full REST endpoints for conversations, messages, and real-time sync
- ✅ **Automatic product promotion system**: Products automatically become "promoted" after receiving 3 likes
- ✅ **Comprehensive settings page**: User preferences, notifications, privacy, appearance, and account management
- ✅ **Like system with automatic promotion**: API endpoint for liking products with anti-abuse protection
- ✅ **Promotion testing interface**: Debug page to test automatic promotion functionality
- ✅ **Advanced advertising system**: Complete ad management with impression/click tracking and position-based display
- ✅ **Enhanced likes system**: Smart LikeButton component with animations, promotion notifications, and milestone badges
- ✅ **Product sharing functionality**: Web Share API integration for mobile with clipboard fallback for desktop
- ✅ **Enhanced AI chatbot assistant**: Natural conversational responses with 8 specialized categories, contextual suggestions, and improved animations
- ✅ **Production deployment guide**: Complete VPS OVH deployment documentation with automated scripts
- ✅ **Fixed car product database persistence**: Corrected schema validation and type conversion for car-specific fields
- ✅ **Functional seller profile viewing**: Added "Voir profil" modal with seller information and contact integration
- ✅ **Updated brand identity**: Integrated custom Tomati logo throughout the application (header, auth, home page)
- ✅ **GitHub repository ready**: Code pushed to https://github.com/imen-nasrii/cool-mobile-spark.git for deployment
- ✅ **SEO optimization**: Added proper meta tags, Open Graph data, and favicon for production
- ✅ **VPS deployment progress**: PM2 running successfully on production server (IP: 51.222.111.183)
- ✅ **Nginx configuration ready**: Reverse proxy configured for domain tomati.org
- ✅ **PM2 configuration resolved**: Application successfully running with ecosystem.config.cjs and start-app.sh script
- ✅ **Production deployment functional**: tomati-production process online and stable
- ✅ **Application fully operational**: Tomati Market serving on localhost:5000 with complete HTML, CSS, JS assets
- ✅ **Production deployment complete**: Application successfully accessible on http://51.222.111.183 via Nginx
- ✅ **Full stack operational**: Frontend, backend API, database, PM2, and Nginx all functioning in production
- ✅ **Ready for domain configuration**: Next steps are DNS setup for tomati.org and SSL certificate
- ✅ **Latest version deployed**: Successfully updated to latest Replit code with PostgreSQL database integration
- ✅ **Database schema migrated**: All tables created and application running without authentication errors
- ✅ **Production fully operational**: Latest version serving on http://51.222.111.183 with new asset hashes

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
- **Real-time messaging system fully operational**
- **Interactive map with direct messaging integration**
- Clean codebase with no critical errors

## Admin Access
- **Admin Account**: admin@tomati.com / admin123
- **Admin Features**: Create, edit, delete products and categories
- **Security**: Only admin role can access dashboard and management functions

## Database Schema
- `users`: User accounts with authentication
- `profiles`: User profile information
- `products`: Product listings with details, like_count, is_promoted, promoted_at
- `categories`: Product categorization
- `conversations`: Chat conversations between users
- `messages`: Real-time messaging system with conversation threading
- `message_reads`: Read status tracking for messages
- `notifications`: Real-time user notifications with read status
- `advertisements`: Advanced advertising system with impression/click tracking
- `product_likes`: Enhanced user-product like relationships with analytics
- All tables properly linked with foreign key relationships and indexes

## User Preferences
- Focus on clean, maintainable code architecture
- Prioritize security and data integrity
- Use modern React patterns and best practices
- Maintain responsive design principles

## Recent Enhancements (January 26, 2025 - Evening)
- ✅ **Product Share Feature**: Implemented native Web Share API for mobile devices with clipboard fallback for desktop
- ✅ **Chatbot Intelligence Upgrade**: Enhanced with 8 specialized response categories (selling, buying, security, payments, technical, promotion)
- ✅ **Natural Language Processing**: Improved keyword detection and contextual responses in French
- ✅ **User Experience**: Added animated typing indicators and more engaging error messages
- ✅ **Deployment Ready**: Created comprehensive VPS OVH deployment guide with automation scripts

## Production Deployment
- **Deployment Guide**: Complete documentation in `DEPLOYMENT_GUIDE.md`
- **Automation Scripts**: `scripts/deploy.sh` and `scripts/backup.sh` for maintenance
- **PM2 Configuration**: `ecosystem.config.js` for production cluster mode
- **VPS Compatible**: Optimized for OVH VPS with Ubuntu, PostgreSQL, Nginx, SSL

## Next Steps for Development
- Add image upload functionality for products
- Implement payment integration with secure gateways
- Add admin role management system
- Enhanced search with full-text indexing
- Mobile app development considerations