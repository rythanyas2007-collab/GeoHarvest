import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/interventions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { watershedId } = req.query as { watershedId?: string };
    const interventions = await dbRepository.getInterventions(watershedId);
    res.json({ interventions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch interventions' });
  }
});

// GET /api/interventions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const intervention = await dbRepository.getInterventionById(req.params.id);
    if (!intervention) {
      res.status(404).json({ error: 'Intervention not found' });
      return;
    }
    const allEvidence = await dbRepository.getEvidence();
    const evidence = allEvidence.filter(e => e.interventionId === req.params.id);

    res.json({
      intervention,
      evidence
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch intervention details' });
  }
});

// POST /api/interventions
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      type,
      status,
      watershedId,
      watershedName,
      villageName,
      coordinates,
      conditionScore,
      siltLevelPercentage,
      capacityCubicMetres,
      approvedCostInr,
      beneficiaryHouseholds,
      constructionDate
    } = req.body;

    if (!name || !type || !coordinates || !Array.isArray(coordinates)) {
      res.status(400).json({ error: 'Name, type, and valid coordinates [lat, lng] are required.' });
      return;
    }

    const [lat, lng] = coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: 'Coordinates out of valid geographical bounds.' });
      return;
    }

    const newIntervention = await dbRepository.createIntervention({
      code: code || `INT-TVM-${Date.now().toString().slice(-4)}`,
      name,
      type,
      status: status || 'operational',
      watershedId: watershedId || 'ws-tvm-04a',
      watershedName: watershedName || 'Upper Cheyyar Sub-Watershed',
      villageName: villageName || 'Melchengam',
      coordinates: [lat, lng],
      conditionScore: conditionScore ?? 90,
      siltLevelPercentage: siltLevelPercentage ?? 10,
      capacityCubicMetres: capacityCubicMetres ?? 5000,
      approvedCostInr: approvedCostInr ?? 850000,
      beneficiaryHouseholds: beneficiaryHouseholds ?? 45,
      constructionDate: constructionDate || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ intervention: newIntervention });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create intervention', message: error.message });
  }
});

export default router;
