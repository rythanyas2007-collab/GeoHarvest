import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/watersheds
router.get('/', async (req: Request, res: Response) => {
  try {
    const watersheds = await dbRepository.getWatersheds();
    res.json({ watersheds });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watersheds' });
  }
});

// GET /api/watersheds/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const watershed = await dbRepository.getWatershedById(req.params.id);
    if (!watershed) {
      res.status(404).json({ error: 'Watershed not found' });
      return;
    }
    const interventions = await dbRepository.getInterventions(req.params.id);
    const evidence = await dbRepository.getEvidence(req.params.id);
    
    res.json({
      watershed,
      interventions,
      evidence
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch watershed details' });
  }
});

export default router;
