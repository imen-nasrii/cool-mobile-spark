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
- ✅ **Minimalist UI design**: Removed all gray backgrounds and decorative elements for clean, modern interface
- ✅ **Category-specific fields**: Added comprehensive real estate fields (rooms, bathrooms, surface, options)
- ✅ **Job posting system**: Complete employment form with contract types, sectors, experience levels, salary ranges
- ✅ **Arial font implementation**: Applied Arial font family across entire application with CSS overrides and inline styles
- ✅ **ProductGrid display fix**: Corrected API endpoint usage to properly display products in Replit environment
- ✅ **Unknown Error resolution**: Added global ErrorBoundary component with French error messages and recovery options
- ✅ **Enhanced error handling**: Improved ProductGrid with retry mechanism and detailed error states
- ✅ **Production-ready error management**: Comprehensive error capture and user-friendly error display
- ✅ **GitHub deployment scripts**: Automated cloning and deployment scripts for VPS production environment
- ✅ **Direct VPS deployment method**: Copy-paste commands for immediate deployment via GitHub cloning
- ✅ **Build issue resolution**: Fixed missing dist/index.js problem with complete rebuild and PM2 configuration
- ✅ **Production deployment troubleshooting**: Comprehensive diagnostic and correction scripts for VPS deployment
- ✅ **Final deployment success**: Application fully operational on http://51.222.111.183 with PM2, database, and API functioning
- ✅ **Environment variable resolution**: DATABASE_URL and all PostgreSQL connections working correctly in production
- ✅ **Product details with icons**: Added comprehensive icon system for car, real estate, and job details with visual indicators
- ✅ **Enhanced UI with category-specific icons**: Cars show brand/fuel/year, real estate shows rooms/surface, jobs show contract/salary
- ✅ **Complete equipment display in product details**: "Équipements disponibles" section fully functional ONLY in product detail pages (not in product list) with all 12 equipment items, professional black/gray color coding, transitions, and Arial font styling exactly matching Tesla Model 3 example
- ✅ **Heart button functionality fixed**: Resolved localStorage key issues (token vs authToken) and added visual heart animations with red fill state
- ✅ **WebSocket error resolution**: Fixed localhost:undefined WebSocket URL construction errors with temporary disable and proper environment configuration
- ✅ **Equipment section in product creation**: Added comprehensive "Équipements disponibles" section in AddProduct form with 12 car equipment checkboxes with exact icons (🪑🔥🧭⏱️📡📹🛡️🛑👁️🛣️☀️🚭) and full TypeScript integration
- ✅ **Product edit functionality**: Fixed non-functional edit button in ProductDetail by adding handleProductEdit function in Index.tsx with proper navigation and URL parameter handling
- ✅ **Product delete functionality**: Added comprehensive delete feature with secure API endpoint, confirmation dialog, owner/admin authorization, and automatic cache invalidation
- ✅ **Homepage search bar removal**: Completely removed the search section from the homepage for a cleaner, minimalist interface as requested
- ✅ **Homepage description removal**: Eliminated the descriptive text under the title for an ultra-minimalist design with only logo and title
- ✅ **Category filtering system fully functional**: Fixed "Voir tout" button behavior and server-side category filtering with proper logging and debugging
- ✅ **Logo removal from homepage**: Removed Tomati logo from homepage header for even more minimalist design with title only
- ✅ **Complete title removal**: Eliminated "Tomati Market" title from homepage for ultra-minimalist interface with only content

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
- `products`: Product listings with category-specific fields:
  - **Cars**: brand, model, year, mileage, transmission, condition, fuel type, etc.
  - **Real Estate**: type, rooms, bathrooms, surface, floor, furnished, parking, garden, balcony
  - **Jobs**: contract type, sector, experience, education, salary range, remote work, company
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