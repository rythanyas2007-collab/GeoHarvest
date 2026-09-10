import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/health
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    application: 'GEOHarvest - Watershed Intelligence and Action Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
});

// POST /api/system/reset-demo (resets data back to pristine demo state)
router.post('/reset-demo', async (req: Request, res: Response) => {
  try {
    await dbRepository.resetToDemo();
    await dbRepository.logAction({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'super_admin',
      action: 'SYSTEM_RESET_DEMO',
      category: 'SYSTEM',
      details: 'Demonstration environment database reset to pristine baseline state.',
      ipAddress: req.ip,
      isDemonstration: true
    });
    res.json({ success: true, message: 'Database reset to clean demonstration baseline.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset demo database' });
  }
});

export default router;
