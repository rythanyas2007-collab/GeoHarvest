import { Watershed, Intervention } from '../types';
import * as turf from '@turf/turf';

// Upper Cheyyar Watershed Polygon Coordinates [lng, lat]
export const UPPER_CHEYYAR_POLYGON_COORDS: [number, number][] = [
  [78.875, 12.285],
  [78.882, 12.315],
  [78.895, 12.332],
  [78.920, 12.335],
  [78.942, 12.322],
  [78.945, 12.298],
  [78.932, 12.280],
  [78.905, 12.275],
  [78.885, 12.278],
  [78.875, 12.285]
];

// Varahanadi Watershed Polygon Coordinates [lng, lat]
export const VARAHANADI_POLYGON_COORDS: [number, number][] = [
  [78.918, 12.325],
  [78.922, 12.355],
  [78.940, 12.368],
  [78.968, 12.365],
  [78.978, 12.345],
  [78.965, 12.320],
  [78.942, 12.315],
  [78.918, 12.325]
];

// Drainage Network Stream Segments
export const DRAINAGE_STREAMS_GEOJSON: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'str-01', name: 'Melchengam Main Stream', order: 3, watershedId: 'ws-tvm-04a' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.885, 12.282],
          [78.892, 12.291],
          [78.895, 12.299],
          [78.908, 12.310],
          [78.925, 12.322],
          [78.938, 12.328]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'str-02', name: 'Muniyappan Kovil Feeder Stream', order: 2, watershedId: 'ws-tvm-04a' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.902, 12.330],
          [78.906, 12.322],
          [78.908, 12.310]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'str-03', name: 'Pudur Hillside Tributary', order: 1, watershedId: 'ws-tvm-04a' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.878, 12.302],
          [78.886, 12.296],
          [78.892, 12.291]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'str-04', name: 'Varahanadi Stream Reach A', order: 3, watershedId: 'ws-tvm-07b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.928, 12.332],
          [78.938, 12.342],
          [78.948, 12.352],
          [78.962, 12.360]
        ]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'str-05', name: 'North Chengam Ridge Runoff', order: 2, watershedId: 'ws-tvm-07b' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [78.960, 12.330],
          [78.954, 12.342],
          [78.948, 12.352]
        ]
      }
    }
  ]
};

// Build GeoJSON FeatureCollection for Watershed Boundaries
export function buildWatershedGeoJson(watersheds: Watershed[]): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  return {
    type: 'FeatureCollection',
    features: watersheds.map((ws) => {
      const coords = ws.id === 'ws-tvm-04a' ? UPPER_CHEYYAR_POLYGON_COORDS : VARAHANADI_POLYGON_COORDS;
      return {
        type: 'Feature',
        properties: {
          id: ws.id,
          code: ws.code,
          name: ws.name,
          tamilName: ws.tamilName,
          healthScore: ws.healthScore,
          healthCategory: ws.healthCategory,
          areaHectares: ws.areaHectares,
          drainageOrder: ws.drainageOrder,
          structuresCount: ws.structuresCount.total,
          waterPotential: ws.waterConservationPotentialLakhLitres,
          beneficiaries: ws.estimatedBeneficiaries
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };
    })
  };
}

// Build GeoJSON FeatureCollection for Interventions
export function buildInterventionsGeoJson(interventions: Intervention[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: interventions.map((item) => ({
      type: 'Feature',
      properties: {
        id: item.id,
        code: item.code,
        name: item.name,
        type: item.type,
        status: item.status,
        conditionScore: item.conditionScore,
        siltLevelPercentage: item.siltLevelPercentage,
        capacityCubicMetres: item.capacityCubicMetres,
        approvedCostInr: item.approvedCostInr,
        beneficiaryHouseholds: item.beneficiaryHouseholds,
        villageName: item.villageName,
        watershedName: item.watershedName
      },
      geometry: {
        type: 'Point',
        coordinates: [item.coordinates[1], item.coordinates[0]] // MapLibre uses [lng, lat]
      }
    }))
  };
}

// Check if a point [lat, lng] is inside the watershed boundary polygon
export function validatePointInWatershed(
  pointLatLng: [number, number],
  watershedId: string
): { isInside: boolean; distanceToNearestBoundaryKm: number } {
  const pt = turf.point([pointLatLng[1], pointLatLng[0]]); // [lng, lat]
  const coords = watershedId === 'ws-tvm-04a' ? UPPER_CHEYYAR_POLYGON_COORDS : VARAHANADI_POLYGON_COORDS;
  const poly = turf.polygon([coords]);

  const isInside = turf.booleanPointInPolygon(pt, poly);
  const boundaryLine = turf.polygonToLine(poly);
  
  // Calculate distance to boundary
  const nearest = turf.nearestPointOnLine(boundaryLine as any, pt);
  const distanceKm = turf.distance(pt, nearest, { units: 'kilometers' });

  return {
    isInside,
    distanceToNearestBoundaryKm: Math.round(distanceKm * 1000) / 1000
  };
}
