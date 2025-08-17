import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Disable TLS verification for internal calls in production VPS
if (process.env.NODE_ENV === "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const app = express();

// Performance optimizations
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Trop de requêtes, veuillez réessayer plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Initialize cache
export const serverCache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
});

app.use(express.json({ limit: '10mb' })); // Reduced from 50mb
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// No middleware - direct to routes

(async () => {
  const server = await registerRoutes(app);

  // Simple error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment or default to 5000
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
