import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';
import { DashboardSummary } from '../../src/types/index';

const router = Router();

// GET /api/dashboard/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const watersheds = await dbRepository.getWatersheds();
    const interventions = await dbRepository.getInterventions();
    const alerts = await dbRepository.getAlerts();
    const complaints = await dbRepository.getComplaints();
    const actions = await dbRepository.getFieldActions();
    const proposals = await dbRepository.getProposals();

    const totalWatersheds = watersheds.length;
    const registeredStructures = interventions.length;
    const functionalStructures = interventions.filter(i => i.status === 'operational').length;
    const structuresNeedingAttention = interventions.filter(i => 
      i.status === 'needs_maintenance' || i.status === 'critical_damage'
    ).length;
    const criticalMaintenanceAlerts = alerts.filter(a => a.priority === 'critical' && a.status !== 'resolved').length;
    const openComplaints = complaints.filter(c => c.status !== 'resolved').length;
    const pendingFieldActions = actions.filter(a => a.status === 'pending' || a.status === 'assigned' || a.status === 'in_progress').length;
    const proposedProjects = proposals.length;

    const estimatedWaterPotentialLakhLitres = watersheds.reduce((sum, w) => sum + (w.waterConservationPotentialLakhLitres || 0), 0);
    const estimatedBeneficiaries = watersheds.reduce((sum, w) => sum + (w.estimatedBeneficiaries || 0), 0);

    const summary: DashboardSummary = {
      totalWatersheds,
      registeredStructures,
      functionalStructures,
      structuresNeedingAttention,
      criticalMaintenanceAlerts,
      openComplaints,
      pendingFieldActions,
      proposedProjects,
      estimatedWaterPotentialLakhLitres: Math.round(estimatedWaterPotentialLakhLitres * 10) / 10,
      estimatedBeneficiaries,
      lastDataFreshness: {
        fieldSync: '2026-09-08T05:14:22.000Z',
        satellitePass: '2026-08-28T05:40:12.000Z',
        weatherUpdate: '2026-09-10T02:00:00.000Z'
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to compute dashboard metrics' });
  }
});

// GET /api/dashboard/priority-actions (critical and overdue first)
router.get('/priority-actions', async (req: Request, res: Response) => {
  try {
    const alerts = await dbRepository.getAlerts();
    const actions = await dbRepository.getFieldActions();
    const complaints = await dbRepository.getComplaints();

    // Sort alerts: critical first, then high, then medium
    const priorityWeight: Record<string, number> = { critical: 3, high: 2, medium: 1, low: 0 };
    const sortedAlerts = [...alerts].sort((a, b) => {
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });

    const pendingActions = actions.filter(a => a.status !== 'completed' && a.status !== 'verified');
    const unresolvedComplaints = complaints.filter(c => c.status !== 'resolved');

    res.json({
      alerts: sortedAlerts,
      actions: pendingActions,
      complaints: unresolvedComplaints
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch priority actions' });
  }
});

// GET /api/dashboard/external-services
router.get('/external-services', async (req: Request, res: Response) => {
  try {
    const services = await dbRepository.getExternalServices();
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch external service statuses' });
  }
});

export default router;
