import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';
import { CopernicusService } from '../services/copernicus';
import { SatelliteAnalysisJob, SpectralIndex } from '../../src/types/index';

const router = Router();

/**
 * GET /api/satellite/status
 * Returns Copernicus service configuration status without exposing tokens
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const configStatus = CopernicusService.getConfigStatus();
    res.json(configStatus);
  } catch (err: any) {
    res.status(500).json({ error: 'CONFIG_CHECK_FAILED', message: err.message });
  }
});

/**
 * POST /api/satellite/validate-area
 * Validates GeoJSON area geometry and returns area in hectares + bounds
 */
router.post('/validate-area', async (req: Request, res: Response) => {
  try {
    const { geometry } = req.body;
    const validation = CopernicusService.validateGeoJsonArea(geometry);
    if (!validation.isValid) {
      return res.status(400).json({
        isValid: false,
        error: validation.error
      });
    }

    res.json(validation);
  } catch (err: any) {
    res.status(500).json({ error: 'VALIDATION_ERROR', message: err.message });
  }
});

/**
 * POST /api/satellite/search-scenes
 * Searches live Copernicus Sentinel-2 STAC catalogue for Level-2A scenes
 */
router.post('/search-scenes', async (req: Request, res: Response) => {
  try {
    const { geometry, startDate, endDate, maxCloudCover } = req.body;

    if (!geometry) {
      return res.status(400).json({ error: 'MISSING_GEOMETRY', message: 'GeoJSON geometry is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'MISSING_DATE_RANGE', message: 'Both startDate and endDate are required.' });
    }

    const cloudCover = typeof maxCloudCover === 'number' ? maxCloudCover : 20;

    const result = await CopernicusService.searchSentinelScenes({
      geometry,
      startDate,
      endDate,
      maxCloudCover: cloudCover
    });

    res.json(result);
  } catch (err: any) {
    console.error('[Copernicus Router] Search error:', err);
    res.status(500).json({ error: 'SCENE_SEARCH_FAILED', message: err.message });
  }
});

/**
 * POST /api/satellite/jobs
 * Creates and runs a satellite analysis job
 */
router.post('/jobs', async (req: Request, res: Response) => {
  try {
    const {
      watershedId,
      areaName,
      areaGeojson,
      spectralIndex,
      beforeScene,
      afterScene
    } = req.body;

    // Validate inputs
    if (!areaGeojson) {
      return res.status(400).json({ error: 'MISSING_AREA', message: 'areaGeojson is required' });
    }
    if (!beforeScene || !afterScene) {
      return res.status(400).json({ error: 'MISSING_SCENES', message: 'Both beforeScene and afterScene are required' });
    }

    const validIndices: SpectralIndex[] = ['TRUE_COLOR', 'NDVI', 'NDWI'];
    if (!validIndices.includes(spectralIndex)) {
      return res.status(400).json({ error: 'INVALID_INDEX', message: 'spectralIndex must be TRUE_COLOR, NDVI, or NDWI' });
    }

    const validation = CopernicusService.validateGeoJsonArea(areaGeojson);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'INVALID_AREA', message: validation.error });
    }

    // Check credentials: if not configured, do not fake results; return 412
    const isConfigured = CopernicusService.isConfigured();
    if (!isConfigured) {
      return res.status(412).json({
        error: 'COPERNICUS_CREDENTIALS_REQUIRED',
        message:
          'Copernicus Process API credentials (COPERNICUS_CLIENT_ID and COPERNICUS_CLIENT_SECRET) are required in environment secrets to process live Sentinel-2 imagery. Please configure them in AI Studio Settings.',
        configStatus: CopernicusService.getConfigStatus()
      });
    }

    // Create initial Job in 'queued' state
    const job = await dbRepository.createSatelliteJob({
      status: 'queued',
      watershedId,
      areaName: areaName || 'Custom Area of Interest',
      areaGeojson,
      areaHectares: validation.areaHectares,
      spectralIndex,
      beforeScene,
      afterScene,
      metadata: CopernicusService.generateAnalysisMetadata({
        id: 'tmp',
        status: 'queued',
        areaName: areaName || 'Custom Area of Interest',
        areaGeojson,
        areaHectares: validation.areaHectares,
        spectralIndex,
        beforeScene,
        afterScene,
        createdAt: new Date().toISOString(),
        metadata: {} as any
      })
    });

    // Asynchronously or immediately process the job
    try {
      await dbRepository.updateSatelliteJob(job.id, { status: 'processing' });

      const processed = await CopernicusService.executeProcessJob({
        ...job,
        status: 'processing'
      });

      const updated = await dbRepository.updateSatelliteJob(job.id, {
        status: 'completed',
        beforeImageUrl: processed.beforeImageUrl,
        afterImageUrl: processed.afterImageUrl,
        statistics: processed.statistics,
        metadata: processed.metadata,
        completedAt: new Date().toISOString()
      });

      res.status(201).json({ job: updated });
    } catch (procErr: any) {
      console.error('[Copernicus Process] Job failure:', procErr);
      const failedJob = await dbRepository.updateSatelliteJob(job.id, {
        status: 'failed',
        error: procErr.message,
        completedAt: new Date().toISOString()
      });
      res.status(502).json({
        error: 'PROCESSING_FAILED',
        message: procErr.message,
        job: failedJob
      });
    }
  } catch (err: any) {
    console.error('[Copernicus Router] Create job error:', err);
    res.status(500).json({ error: 'JOB_CREATION_FAILED', message: err.message });
  }
});

/**
 * GET /api/satellite/jobs
 * Lists satellite analysis jobs
 */
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const watershedId = req.query.watershedId as string | undefined;
    const jobs = await dbRepository.getSatelliteJobs(watershedId);
    res.json({ jobs });
  } catch (err: any) {
    res.status(500).json({ error: 'FETCH_FAILED', message: err.message });
  }
});

/**
 * GET /api/satellite/jobs/:id
 * Retrieve a specific satellite analysis job
 */
router.get('/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await dbRepository.getSatelliteJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Satellite analysis job not found' });
    }
    res.json({ job });
  } catch (err: any) {
    res.status(500).json({ error: 'FETCH_FAILED', message: err.message });
  }
});

export default router;
