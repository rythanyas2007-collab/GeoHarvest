import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/maintenance/alerts
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { priority } = req.query as { priority?: string };
    const alerts = await dbRepository.getAlerts(priority);
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance alerts' });
  }
});

// PATCH /api/maintenance/alerts/:id
router.patch('/alerts/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbRepository.updateAlert(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    // Audit log
    if (req.user) {
      await dbRepository.logAction({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'UPDATE_MAINTENANCE_ALERT',
        category: 'WATERSHED',
        details: `Updated alert ${updated.code} status to '${updated.status}'`,
        ipAddress: req.ip,
        isDemonstration: true
      });
    }

    res.json({ alert: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

export default router;
