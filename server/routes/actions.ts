import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/field-actions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { officerId } = req.query as { officerId?: string };
    const actions = await dbRepository.getFieldActions(officerId);
    res.json({ actions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch field actions' });
  }
});

// POST /api/field-actions
router.post('/', async (req: Request, res: Response) => {
  try {
    const newAction = await dbRepository.createFieldAction(req.body);
    
    await dbRepository.logAction({
      userId: req.user?.id || 'admin',
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'government_admin',
      action: 'CREATE_FIELD_ACTION',
      category: 'FIELD_ACTION',
      details: `Created new field task ${newAction.code}: ${newAction.title} assigned to ${newAction.assignedOfficerName}.`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.status(201).json({ action: newAction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create field action' });
  }
});

// PATCH /api/field-actions/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbRepository.updateFieldAction(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Field action not found' });
      return;
    }

    await dbRepository.logAction({
      userId: req.user?.id || 'officer',
      userName: req.user?.name || 'Assigned Officer',
      userRole: req.user?.role || 'field_officer',
      action: 'UPDATE_FIELD_ACTION',
      category: 'FIELD_ACTION',
      details: `Task ${updated.code} status changed to '${updated.status}'.`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.json({ action: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update field action' });
  }
});

export default router;
