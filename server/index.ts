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
  
  // Serve static files with correct MIME types
  app.use(express.static(staticDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));
  
  // SPA fallback - only for non-asset routes
  app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    // Don't serve index.html for asset requests
    if (req.path.startsWith('/assets/')) {
      return res.status(404).send('Asset not found');
    }
    res.sendFile(path.join(staticDir, "index.html"));
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port} (production mode)`);
  });
})();