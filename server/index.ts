import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

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

  // Setup vite or static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port}`);
  });
})();