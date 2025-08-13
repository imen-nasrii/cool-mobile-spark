#!/bin/bash

# Script to deploy the fixed version to VPS
echo "🚀 Deploying fixed version to VPS..."

# Check if we have the fixed server/index.ts
if ! grep -q "process.env.PORT" server/index.ts; then
    echo "❌ server/index.ts not properly fixed"
    exit 1
fi

echo "✅ server/index.ts contains dynamic port configuration"

# Commands to run on VPS
echo "
Execute these commands on your VPS as hamdi user:

# 1. Navigate to the project directory
cd ~/cool-mobile-spark

# 2. Pull latest changes from GitHub (if pushed)
git pull origin main

# 3. OR manually update server/index.ts with this content:
cat > server/index.ts << 'EOF'
import express, { type Request, Response, NextFunction } from \"express\";
import { registerRoutes } from \"./routes\";
import { setupVite, serveStatic, log } from \"./vite\";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on(\"finish\", () => {
    const duration = Date.now() - start;
    if (path.startsWith(\"/api\")) {
      let logLine = \`\${req.method} \${path} \${res.statusCode} in \${duration}ms\`;
      if (capturedJsonResponse) {
        logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + \"…\";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || \"Internal Server Error\";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get(\"env\") === \"development\") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT from environment or default to 5000
  const port = parseInt(process.env.PORT || \"5000\", 10);
  const host = process.env.HOST || \"0.0.0.0\";
  server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    log(\`serving on port \${port}\`);
  });
})();
EOF

# 4. Kill all conflicting processes
sudo fuser -k 5000/tcp 2>/dev/null || true
sudo fuser -k 3001/tcp 2>/dev/null || true
pm2 delete all
pm2 kill

# 5. Rebuild the application
npm run build

# 6. Update PM2 configuration for fork mode (not cluster)
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tomati-hamdi',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      HOST: '0.0.0.0',
      DATABASE_URL: 'postgresql://tomatii_user:tomatii_password_2024!@localhost:5432/tomatii_db',
      PGDATABASE: 'tomatii_db',
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'tomatii_user',
      PGPASSWORD: 'tomatii_password_2024!',
      JWT_SECRET: 'tomati_super_secret_jwt_key_2024_production',
      SESSION_SECRET: 'tomati_session_secret_key_2024_production',
      REPL_ID: 'tomati-production',
      REPLIT_DOMAINS: 'tomati.org',
      ISSUER_URL: 'https://replit.com/oidc'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 7. Start the application
pm2 start ecosystem.config.cjs

# 8. Wait a moment and check
sleep 3
pm2 status
pm2 logs tomati-hamdi --lines 5

# 9. Test the application
curl http://localhost:3001

# 10. If successful, save configuration
pm2 save

echo '🎉 If you see the application running on port 3001, the deployment is successful!'
echo 'Next step: Configure Nginx to serve tomati.org'
"

echo "📋 Commands copied to clipboard. Execute them on your VPS!"