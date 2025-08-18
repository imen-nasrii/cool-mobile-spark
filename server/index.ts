import express from "express";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

// Basic middleware only
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(async () => {
  const server = await registerRoutes(app);

  // Simple error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Server error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Always serve static files from dist/public (built version)
  const staticDir = path.join(process.cwd(), 'dist/public');
  
  // Static files middleware
  app.use(express.static(staticDir, { 
    extensions: ["html"],
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
    }
  }));
  
  // Catch-all route for SPA (excluding API routes)
  app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    const indexPath = path.join(staticDir, "index.html");
    res.sendFile(indexPath);
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port}`);
  });
})();