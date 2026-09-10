import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbRepository } from './server/db/repository';
import { authMiddleware } from './server/middleware/auth';

import authRoutes from './server/routes/auth';
import dashboardRoutes from './server/routes/dashboard';
import watershedRoutes from './server/routes/watersheds';
import interventionRoutes from './server/routes/interventions';
import maintenanceRoutes from './server/routes/maintenance';
import complaintRoutes from './server/routes/complaints';
import actionRoutes from './server/routes/actions';
import evidenceRoutes from './server/routes/evidence';
import auditLogRoutes from './server/routes/auditLogs';
import copernicusRoutes from './server/routes/copernicus';
import gisRoutes from './server/routes/gis';
import systemRoutes from './server/routes/system';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB repository
  await dbRepository.init();
  console.log('[GEOHarvest] Persistent database repository initialized.');

  // Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global auth extractor
  app.use(authMiddleware);

  // Health and System routes FIRST
  app.use('/api', systemRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/watersheds', watershedRoutes);
  app.use('/api/interventions', interventionRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/field-actions', actionRoutes);
  app.use('/api/evidence', evidenceRoutes);
  app.use('/api/audit-logs', auditLogRoutes);
  app.use('/api/satellite', copernicusRoutes);
  app.use('/api/gis', gisRoutes);

  // Fallback for unmatched API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', message: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[GEOHarvest] Vite SPA middleware mounted in development mode.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[GEOHarvest] Static production distribution mounted.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GEOHarvest] Platform running on http://0.0.0.0:${PORT}`);
    console.log(`[GEOHarvest] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error('[GEOHarvest] Fatal server startup error:', err);
  process.exit(1);
});
