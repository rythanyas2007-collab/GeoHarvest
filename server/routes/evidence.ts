import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/evidence
router.get('/', async (req: Request, res: Response) => {
  try {
    const { watershedId } = req.query as { watershedId?: string };
    const evidence = await dbRepository.getEvidence(watershedId);
    res.json({ evidence });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch field evidence' });
  }
});

// POST /api/evidence
router.post('/', async (req: Request, res: Response) => {
  try {
    const newEvidence = await dbRepository.createEvidence({
      ...req.body,
      isDemonstration: true
    });

    await dbRepository.logAction({
      userId: req.user?.id || 'officer',
      userName: req.user?.name || 'Field Officer',
      userRole: req.user?.role || 'field_officer',
      action: 'SUBMIT_FIELD_EVIDENCE',
      category: 'EVIDENCE',
      details: `Submitted geo-evidence for structure ${newEvidence.interventionCode} (${newEvidence.stage}) with GPS accuracy ±${newEvidence.gpsAccuracyMeters}m.`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.status(201).json({ evidence: newEvidence });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create evidence' });
  }
});

export default router;
