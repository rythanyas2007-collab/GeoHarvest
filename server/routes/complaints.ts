import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';

const router = Router();

// GET /api/complaints
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: string };
    const complaints = await dbRepository.getComplaints(status);
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// POST /api/complaints
router.post('/', async (req: Request, res: Response) => {
  try {
    const { category, description, village, coordinates, voiceLanguage, photoUrl, watershedId } = req.body;
    
    if (!category || !description || !village) {
      res.status(400).json({ error: 'Missing required complaint parameters' });
      return;
    }

    const complaint = await dbRepository.createComplaint({
      category,
      description,
      village,
      watershedId,
      coordinates: coordinates || [12.2982, 78.8924],
      voiceLanguage: voiceLanguage || 'ta',
      photoUrl,
      status: 'submitted',
      isDemonstration: true
    });

    await dbRepository.logAction({
      userId: req.user?.id || 'community-submitter',
      userName: req.user?.name || 'Village Community Resident',
      userRole: req.user?.role || 'community_user',
      action: 'SUBMIT_COMPLAINT',
      category: 'COMPLAINT',
      details: `Registered complaint tracking ID ${complaint.trackingId} for village ${village}. Category: ${category}.`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.status(201).json({ complaint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// PATCH /api/complaints/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await dbRepository.updateComplaint(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }

    await dbRepository.logAction({
      userId: req.user?.id || 'officer',
      userName: req.user?.name || 'Assigned Officer',
      userRole: req.user?.role || 'field_officer',
      action: 'UPDATE_COMPLAINT_STATUS',
      category: 'COMPLAINT',
      details: `Complaint ${updated.trackingId} status updated to '${updated.status}'.`,
      ipAddress: req.ip,
      isDemonstration: true
    });

    res.json({ complaint: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

export default router;
