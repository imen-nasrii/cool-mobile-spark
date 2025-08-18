import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import express from "express";
import path from "path";

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
  const isDev = process.env.NODE_ENV === 'development';
  let server;

  if (isDev) {
    console.log('Setting up Vite dev server...');
    // Set up Vite with existing config
    const vite = await import('vite');
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      configFile: path.resolve('./vite.config.ts')
    });
    
    // Register API routes first
    server = await registerRoutes(app);
    
    // Then add Vite middleware
    app.use(viteServer.middlewares);
    
    // Handle SPA for development (catch-all for non-API routes)
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const fs = await import('fs');
        const template = fs.readFileSync(path.resolve('./client/index.html'), 'utf-8');
        const html = await viteServer.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        viteServer.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production mode
    server = await registerRoutes(app);
    const staticDir = path.join(process.cwd(), 'dist/public');
    app.use(express.static(staticDir));
    app.get("*", (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(staticDir, "index.html"));
    });
  }

  // Simple error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port} in ${isDev ? 'development' : 'production'} mode`);
  });
})();