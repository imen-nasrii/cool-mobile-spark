import express from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Basic middleware only
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

(async () => {
  const server = await registerRoutes(app);

  // Simple error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Serve static files from dist/public 
  const staticDir = path.join(process.cwd(), 'dist/public');
  console.log('Static directory:', staticDir);
  
  // Serve static files with explicit MIME types
  app.use(express.static(staticDir, { 
    extensions: ["html"],
    setHeaders: (res, filePath) => {
      console.log('Serving:', filePath);
      // Force correct MIME types
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      // Disable caching in development
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
  
  // Catch-all route for SPA (excluding API routes)
  app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port}`);
  });
})();