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

  // Serve static files from dist/public
  const staticDir = path.join(process.cwd(), 'dist/public');
  app.use(express.static(staticDir, { extensions: ["html"] }));
  
  // Catch-all route for SPA
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({ port, host }, () => {
    console.log(`Server running on port ${port}`);
  });
})();