import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';
import { requireRole } from '../middleware/auth';

const router = Router();

// GET /api/audit-logs (Accessible to super_admin, government_admin, district_admin)
router.get('/', requireRole(['super_admin', 'government_admin', 'district_admin']), async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await dbRepository.getAuditLogs(limit);
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
