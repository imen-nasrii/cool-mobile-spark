import { Request, Response } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { count } from 'drizzle-orm';

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Test de connexion à la base de données
    const dbTest = await db.select({ count: count() }).from(users);
    
    // Informations système
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        connected: true,
        users_count: dbTest[0].count
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json(health);
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Vérification plus approfondie pour Kubernetes/Docker
    await db.select({ count: count() }).from(users);
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
};