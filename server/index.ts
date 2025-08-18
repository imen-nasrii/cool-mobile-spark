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
  
  // Serve assets directory with explicit routing and MIME types
  app.use('/assets', express.static(path.join(staticDir, 'assets'), {
    setHeaders: (res, filePath) => {
      console.log('Serving asset:', filePath);
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));
  
  // Serve other static files
  app.use(express.static(staticDir, {
    index: false, // Don't serve index.html automatically
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    }
  }));
  
  // SPA fallback for non-API, non-asset routes
  app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    console.log('SPA fallback for:', req.path);
    res.sendFile(path.join(staticDir, "index.html"));
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port} (production mode)`);
  });
})();