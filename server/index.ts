import express from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

(async () => {
  const server = await registerRoutes(app);

  // Always use production mode to avoid Vite conflicts
  const staticDir = path.join(process.cwd(), 'dist/public');
  console.log('Serving static files from:', staticDir);
  
  // Disable all caching
  app.use((req, res, next) => {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    next();
  });

  // Serve static files with correct MIME types
  app.use(express.static(staticDir, {
    setHeaders: (res, filePath) => {
      console.log('Serving file:', filePath);
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    }
  }));
  
  // API routes first
  app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });
  
  // SPA fallback only for non-API routes
  app.get("*", (req, res) => {
    console.log('SPA fallback for:', req.path);
    res.sendFile(path.join(staticDir, "index.html"));
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port} (production mode)`);
  });
})();