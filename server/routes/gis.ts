import { Router, Request, Response } from 'express';
import { dbRepository } from '../db/repository';
import * as turf from '@turf/turf';

const router = Router();

// GET /api/gis/status - Reports spatial engine status
router.get('/status', async (req: Request, res: Response) => {
  const hasPostgisConfig = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres'));
  res.json({
    status: 'online',
    spatialEngine: hasPostgisConfig ? 'PostGIS Active (PostgreSQL/PostGIS Extension)' : 'Node.js Turf.js Engine (PostGIS Schema Ready)',
    isPostgisConfigured: hasPostgisConfig,
    supportedProjections: ['EPSG:4326 (WGS 84)', 'EPSG:3857 (Web Mercator)'],
    supportedGeometryTypes: ['Point', 'LineString', 'Polygon', 'MultiPolygon'],
    supportedCalculations: ['Geodesic Area (m², Ha, km²)', 'Line Length (m, km)', 'Buffer Generation', 'Point-in-Polygon', 'Self-intersection Analysis'],
    precisionMeters: 0.1
  });
});

// GET /api/gis/drawn-geometries
router.get('/drawn-geometries', async (req: Request, res: Response) => {
  try {
    const { watershedId } = req.query as { watershedId?: string };
    const geometries = await dbRepository.getDrawnGeometries(watershedId);
    res.json({ geometries });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch drawn geometries', message: error.message });
  }
});

// POST /api/gis/validate-geometry - Validates GeoJSON geometry against GIS criteria
router.post('/validate-geometry', (req: Request, res: Response) => {
  try {
    const { geojson } = req.body;
    if (!geojson || !geojson.type) {
      res.status(400).json({ isValid: false, error: 'Invalid GeoJSON: geometry or feature is required.' });
      return;
    }

    const geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;

    // 1. Validate coordinates bounds: -180..180, -90..90
    const coordsList: [number, number][] = [];
    const extractCoords = (coords: any) => {
      if (typeof coords[0] === 'number') {
        coordsList.push([coords[0], coords[1]]);
      } else {
        coords.forEach(extractCoords);
      }
    };
    extractCoords(geometry.coordinates);

    for (const [lng, lat] of coordsList) {
      if (lng < -180 || lng > 180) {
        res.status(400).json({ isValid: false, error: `Longitude ${lng} is out of bounds (-180 to 180).` });
        return;
      }
      if (lat < -90 || lat > 90) {
        res.status(400).json({ isValid: false, error: `Latitude ${lat} is out of bounds (-90 to 90).` });
        return;
      }
    }

    // 2. Geometry specific validation
    if (geometry.type === 'Polygon') {
      const ring = geometry.coordinates[0];
      if (ring.length < 4) {
        res.status(400).json({ isValid: false, error: 'Polygon ring must have at least 4 coordinates.' });
        return;
      }
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        res.status(400).json({ isValid: false, error: 'Polygon linear ring must be closed (first and last coordinate must be identical).' });
        return;
      }

      const poly = turf.polygon(geometry.coordinates);
      // Check for self-intersection
      const kinks = turf.kinks(poly);
      if (kinks.features.length > 0) {
        res.status(400).json({ isValid: false, error: `Polygon self-intersects at ${kinks.features.length} point(s). Polygons must not self-intersect.` });
        return;
      }

      const areaSqM = turf.area(poly);
      if (areaSqM <= 0) {
        res.status(400).json({ isValid: false, error: 'Calculated polygon area must be greater than zero.' });
        return;
      }

      const bbox = turf.bbox(poly);
      const centroid = turf.centroid(poly);

      res.json({
        isValid: true,
        geometryType: 'Polygon',
        areaSquareMeters: Math.round(areaSqM * 100) / 100,
        areaHectares: Math.round((areaSqM / 10000) * 100) / 100,
        areaSquareKm: Math.round((areaSqM / 1000000) * 1000) / 1000,
        centroid: centroid.geometry.coordinates,
        bbox
      });
      return;
    }

    if (geometry.type === 'LineString') {
      const line = turf.lineString(geometry.coordinates);
      const lengthKm = turf.length(line, { units: 'kilometers' });
      const lengthMeters = Math.round(lengthKm * 1000 * 10) / 10;
      res.json({
        isValid: true,
        geometryType: 'LineString',
        lengthMeters,
        lengthKm: Math.round(lengthKm * 1000) / 1000,
        bbox: turf.bbox(line)
      });
      return;
    }

    if (geometry.type === 'Point') {
      res.json({
        isValid: true,
        geometryType: 'Point',
        coordinates: geometry.coordinates
      });
      return;
    }

    res.json({ isValid: true, geometryType: geometry.type });
  } catch (error: any) {
    res.status(400).json({ isValid: false, error: error.message || 'Spatial validation error' });
  }
});

// POST /api/gis/drawn-geometries - Persists a validated drawn geometry
router.post('/drawn-geometries', async (req: Request, res: Response) => {
  try {
    const {
      name,
      geometryType,
      geojson,
      watershedId,
      category,
      structureType,
      notes,
      bufferDistanceMeters
    } = req.body;

    if (!geojson) {
      res.status(400).json({ error: 'GeoJSON geometry is required.' });
      return;
    }

    const geometry = geojson.type === 'Feature' ? geojson.geometry : geojson;

    let areaSquareMeters: number | undefined;
    let areaHectares: number | undefined;
    let areaSquareKm: number | undefined;
    let lengthMeters: number | undefined;
    let bufferGeojson: any;

    if (geometry.type === 'Polygon') {
      const poly = turf.polygon(geometry.coordinates);
      const kinks = turf.kinks(poly);
      if (kinks.features.length > 0) {
        res.status(400).json({ error: 'Polygon self-intersects. Polygons must not self-intersect.' });
        return;
      }
      const sqM = turf.area(poly);
      areaSquareMeters = Math.round(sqM * 100) / 100;
      areaHectares = Math.round((sqM / 10000) * 100) / 100;
      areaSquareKm = Math.round((sqM / 1000000) * 1000) / 1000;
    } else if (geometry.type === 'LineString') {
      const line = turf.lineString(geometry.coordinates);
      lengthMeters = Math.round(turf.length(line, { units: 'kilometers' }) * 1000 * 10) / 10;
    }

    // Optional buffer generation
    if (bufferDistanceMeters && bufferDistanceMeters > 0) {
      try {
        const buffered = turf.buffer(geojson, bufferDistanceMeters / 1000, { units: 'kilometers' });
        bufferGeojson = buffered;
      } catch (err) {
        console.warn('Buffer calculation warning:', err);
      }
    }

    const saved = await dbRepository.createDrawnGeometry({
      name: name || `Drawn ${geometryType || geometry.type} - ${new Date().toLocaleDateString()}`,
      geometryType: geometryType || geometry.type,
      geojson,
      areaSquareMeters,
      areaHectares,
      areaSquareKm,
      lengthMeters,
      bufferDistanceMeters,
      bufferGeojson,
      watershedId,
      category: category || 'proposed_structure',
      structureType,
      notes,
      createdBy: req.user?.email || 'User'
    });

    res.status(201).json({ geometry: saved });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save drawn geometry', message: error.message });
  }
});

// DELETE /api/gis/drawn-geometries/:id
router.delete('/drawn-geometries/:id', async (req: Request, res: Response) => {
  try {
    const success = await dbRepository.deleteDrawnGeometry(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Drawn geometry not found' });
      return;
    }
    res.json({ message: 'Drawn geometry removed successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete drawn geometry', message: error.message });
  }
});

export default router;
