import { CopernicusService } from '../server/services/copernicus';
import { JsonFileGeoHarvestRepository } from '../server/db/repository';
import { SentinelScene, SpectralIndex } from '../src/types/index';
import path from 'path';
import fs from 'fs';

// TEST FIXTURES - Explicitly isolated from user-facing production results
const MOCK_VALID_POLYGON = {
  type: 'Polygon',
  coordinates: [
    [
      [78.865, 12.285],
      [78.935, 12.285],
      [78.935, 12.335],
      [78.865, 12.335],
      [78.865, 12.285]
    ]
  ]
};

const MOCK_UNCLOSED_POLYGON = {
  type: 'Polygon',
  coordinates: [
    [
      [78.865, 12.285],
      [78.935, 12.285],
      [78.935, 12.335],
      [78.865, 12.335]
      // missing closing coordinate
    ]
  ]
};

const MOCK_BEFORE_SCENE: SentinelScene = {
  sceneId: 'S2A_MSIL2A_20230315T050701_N0509_R019_T44VLR_20230315T081523',
  collection: 'Sentinel-2 Level-2A (BOA Reflectance)',
  platform: 'Sentinel-2A',
  observationDate: '2023-03-15',
  cloudCoverPercentage: 1.8,
  tileId: '44VLR',
  spatialResolutionMeters: 10,
  bbox: [78.865, 12.285, 78.935, 12.335],
  geometry: MOCK_VALID_POLYGON,
  sunElevationAngle: 63.5,
  instrument: 'MSI'
};

const MOCK_AFTER_SCENE: SentinelScene = {
  sceneId: 'S2B_MSIL2A_20260828T050649_N0511_R019_T44VLR_20260828T082010',
  collection: 'Sentinel-2 Level-2A (BOA Reflectance)',
  platform: 'Sentinel-2B',
  observationDate: '2026-08-28',
  cloudCoverPercentage: 2.1,
  tileId: '44VLR',
  spatialResolutionMeters: 10,
  bbox: [78.865, 12.285, 78.935, 12.335],
  geometry: MOCK_VALID_POLYGON,
  sunElevationAngle: 61.8,
  instrument: 'MSI'
};

async function runCopernicusAutomatedTests() {
  console.log('===========================================================');
  console.log('  Copernicus Satellite Integration: Automated Verification  ');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Credentials and Configuration Test
  console.log('--- 1. Testing Credential Detection & Configuration Screen Status ---');
  const initialStatus = CopernicusService.getConfigStatus();
  assert(typeof initialStatus.configured === 'boolean', 'Configuration status returns boolean');
  assert(initialStatus.provider.includes('Copernicus'), 'Provider name identified correctly');
  assert(initialStatus.supportedCollections.includes('sentinel-2-l2a'), 'Sentinel-2 L2A collection registered');
  assert(Array.isArray(initialStatus.missingCredentials), 'Missing credentials list is returned');

  // 2. GeoJSON Area Validation Test (Workflow Step 4)
  console.log('\n--- 2. Testing Backend GeoJSON Area Validation (Step 4) ---');
  const validRes = CopernicusService.validateGeoJsonArea(MOCK_VALID_POLYGON);
  assert(validRes.isValid === true, 'Valid polygon correctly accepted');
  assert(validRes.areaHectares > 0, `Calculated area is positive (${validRes.areaHectares} Ha)`);
  assert(validRes.bbox.length === 4, 'Bounding box returned with 4 coordinates');
  assert(validRes.centroid.length === 2, 'Centroid coordinates returned');

  const unclosedRes = CopernicusService.validateGeoJsonArea(MOCK_UNCLOSED_POLYGON);
  assert(unclosedRes.isValid === false, 'Unclosed polygon linear ring correctly rejected');

  const invalidCoordsRes = CopernicusService.validateGeoJsonArea({
    type: 'Polygon',
    coordinates: [[ [250, 100], [250, 101], [251, 101], [250, 100] ]]
  });
  assert(invalidCoordsRes.isValid === false, 'Out-of-range coordinates correctly rejected');

  // 3. Spectral Index Evalscripts & Formulas (Workflow Step 8)
  console.log('\n--- 3. Testing Spectral Index Formulas & Evalscripts ---');
  const ndviScript = CopernicusService.getEvalscriptForIndex('NDVI');
  assert(ndviScript.includes('B04') && ndviScript.includes('B08'), 'NDVI script uses Red (B04) and NIR (B08) bands');
  assert(ndviScript.includes('(sample.B08 - sample.B04) / (sample.B08 + sample.B04)'), 'NDVI standard formula verified');

  const ndwiScript = CopernicusService.getEvalscriptForIndex('NDWI');
  assert(ndwiScript.includes('B03') && ndwiScript.includes('B08'), 'NDWI script uses Green (B03) and NIR (B08) bands');
  assert(ndwiScript.includes('(sample.B03 - sample.B08) / (sample.B03 + sample.B08)'), 'NDWI McFeeters formula verified');

  const rgbScript = CopernicusService.getEvalscriptForIndex('TRUE_COLOR');
  assert(rgbScript.includes('B02') && rgbScript.includes('B03') && rgbScript.includes('B04'), 'True Colour script maps B04-B03-B02 to RGB');

  // 4. Statistics Calculation
  console.log('\n--- 4. Testing Quantitative Delta Statistics ---');
  const ndviStats = CopernicusService.computeSpectralStatistics('NDVI', MOCK_BEFORE_SCENE, MOCK_AFTER_SCENE, 3420);
  assert(ndviStats.deltaValue > 0, `Positive delta computed: ${ndviStats.deltaValue}`);
  assert(ndviStats.deltaPercentage > 0, `Delta percentage computed: +${ndviStats.deltaPercentage}%`);
  assert(ndviStats.spatialResolutionMeters === 10, 'Ground resolution specified at 10m');
  assert(typeof ndviStats.vegetationGainHectares === 'number', 'Vegetation gain in hectares calculated for NDVI');

  const ndwiStats = CopernicusService.computeSpectralStatistics('NDWI', MOCK_BEFORE_SCENE, MOCK_AFTER_SCENE, 1850);
  assert(typeof ndwiStats.waterSurfaceExpansionHectares === 'number', 'Water surface expansion calculated for NDWI');

  // 5. Metadata Specification & Scientific Limitations
  console.log('\n--- 5. Testing Metadata Generation & Limitations ---');
  const metadata = CopernicusService.generateAnalysisMetadata({
    id: 'test-job',
    status: 'completed',
    areaName: 'Upper Cheyyar',
    areaGeojson: MOCK_VALID_POLYGON,
    areaHectares: 3420,
    spectralIndex: 'NDVI',
    beforeScene: MOCK_BEFORE_SCENE,
    afterScene: MOCK_AFTER_SCENE,
    createdAt: new Date().toISOString(),
    metadata: {} as any
  });

  assert(metadata.satelliteSource.includes('Copernicus Sentinel-2'), 'Satellite source identifies Copernicus Sentinel-2');
  assert(metadata.collection.includes('Level-2A'), 'Collection confirms Level-2A Bottom-of-Atmosphere Reflectance');
  assert(metadata.spatialResolution.includes('10m'), 'Spatial resolution confirms 10m');
  assert(metadata.confidenceScore >= 90, `Confidence score generated accurately: ${metadata.confidenceScore}%`);
  assert(metadata.limitations.length >= 3, 'Operational limitations explicitly documented');
  assert(metadata.limitations.some(l => l.includes('10m')), 'Includes 10m mixed-pixel caveat');
  assert(metadata.limitations.some(l => l.includes('5 days')), 'Includes 5-day revisit cadence caveat');

  // 6. Job Lifecycle Storage in Repository (Queued -> Processing -> Completed)
  console.log('\n--- 6. Testing Job Lifecycle State Transitions in Database ---');
  const testRepoPath = path.resolve(process.cwd(), 'data', 'test_satellite_jobs.json');
  if (fs.existsSync(testRepoPath)) {
    fs.unlinkSync(testRepoPath);
  }

  const repo = new JsonFileGeoHarvestRepository(testRepoPath);
  await repo.init();

  // Test Create Job (Queued)
  const job = await repo.createSatelliteJob({
    status: 'queued',
    areaName: 'Upper Cheyyar Test Area',
    areaGeojson: MOCK_VALID_POLYGON,
    areaHectares: 3420,
    spectralIndex: 'NDVI',
    beforeScene: MOCK_BEFORE_SCENE,
    afterScene: MOCK_AFTER_SCENE,
    metadata
  });

  assert(job.id.startsWith('sat-job-'), 'Job ID properly prefixed');
  assert(job.status === 'queued', 'Initial state is queued');

  // Test Update to Processing
  const processingJob = await repo.updateSatelliteJob(job.id, { status: 'processing' });
  assert(processingJob?.status === 'processing', 'Job status transitions to processing');

  // Test Update to Completed
  const completedJob = await repo.updateSatelliteJob(job.id, {
    status: 'completed',
    statistics: ndviStats,
    completedAt: new Date().toISOString()
  });
  assert(completedJob?.status === 'completed', 'Job status transitions to completed');
  assert(completedJob?.statistics?.deltaPercentage !== undefined, 'Completed job persists statistics');

  // Clean up test file
  if (fs.existsSync(testRepoPath)) {
    fs.unlinkSync(testRepoPath);
  }

  console.log('\n===========================================================');
  console.log(`  Tests Passed: ${passed} | Tests Failed: ${failed}`);
  console.log('===========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCopernicusAutomatedTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
