import React, { useState, useEffect } from 'react';
import {
  CopernicusServiceConfigStatus,
  SentinelScene,
  SpectralIndex,
  SatelliteAnalysisJob
} from '../../types/index';
import {
  Satellite,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  Sliders,
  Shield,
  ShieldAlert,
  Calendar,
  Cloud,
  Eye,
  ChevronRight,
  Info,
  Maximize2,
  FileCode,
  Sparkles
} from 'lucide-react';

const PREDEFINED_AREAS = [
  {
    id: 'ws-tvm-04a',
    name: 'Upper Cheyyar Sub-Watershed',
    hectares: 3420,
    coordinates: [
      [78.865, 12.285],
      [78.935, 12.285],
      [78.935, 12.335],
      [78.865, 12.335],
      [78.865, 12.285]
    ]
  },
  {
    id: 'ws-tvm-07b',
    name: 'Varahanadi Micro-Watershed',
    hectares: 1850,
    coordinates: [
      [78.915, 12.325],
      [78.975, 12.325],
      [78.975, 12.375],
      [78.915, 12.375],
      [78.915, 12.325]
    ]
  }
];

export const SatelliteAnalysis: React.FC = () => {
  // Service configuration state
  const [configStatus, setConfigStatus] = useState<CopernicusServiceConfigStatus | null>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'analyze' | 'config' | 'history'>('analyze');

  // Step 1: Watershed / AOI selection
  const [selectedAreaId, setSelectedAreaId] = useState<string>('ws-tvm-04a');
  const [customGeoJson, setCustomGeoJson] = useState<string>('');
  const [isCustomAoi, setIsCustomAoi] = useState<boolean>(false);
  const [validatedArea, setValidatedArea] = useState<{
    isValid: boolean;
    areaHectares: number;
    bbox: [number, number, number, number];
    centroid: [number, number];
    error?: string;
  } | null>(null);

  // Step 2 & 3: Dates & Cloud Cover
  const [beforeDateRange, setBeforeDateRange] = useState({
    start: '2023-01-01',
    end: '2023-06-30'
  });
  const [afterDateRange, setAfterDateRange] = useState({
    start: '2026-01-01',
    end: '2026-09-10'
  });
  const [maxCloudCover, setMaxCloudCover] = useState<number>(15);

  // Step 5 & 6: Available Scenes
  const [searchingScenes, setSearchingScenes] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [beforeScenes, setBeforeScenes] = useState<SentinelScene[]>([]);
  const [afterScenes, setAfterScenes] = useState<SentinelScene[]>([]);
  const [dataProvider, setDataProvider] = useState<string>('Copernicus Data Space Ecosystem');

  // Step 7: Selected Scenes
  const [selectedBeforeScene, setSelectedBeforeScene] = useState<SentinelScene | null>(null);
  const [selectedAfterScene, setSelectedAfterScene] = useState<SentinelScene | null>(null);

  // Step 8: Spectral Index Output
  const [spectralIndex, setSpectralIndex] = useState<SpectralIndex>('NDVI');

  // Step 9 & 10: Job Execution & Status
  const [executingJob, setExecutingJob] = useState<boolean>(false);
  const [activeJob, setActiveJob] = useState<SatelliteAnalysisJob | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  // Step 12: Split view slider
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Step 14: Job History
  const [jobHistory, setJobHistory] = useState<SatelliteAnalysisJob[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Check config status on mount
  const checkConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/satellite/status');
      const data = await res.json();
      setConfigStatus(data);
      if (!data.configured) {
        // As instructed: if credentials missing, show configuration screen
        setActiveTab('config');
      }
    } catch (err) {
      console.error('Failed to fetch config status:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchJobHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/satellite/jobs');
      const data = await res.json();
      setJobHistory(data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch job history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    checkConfig();
    fetchJobHistory();
  }, []);

  // Validate geometry whenever area changes
  useEffect(() => {
    const validate = async () => {
      let geom: any;
      if (isCustomAoi) {
        try {
          geom = JSON.parse(customGeoJson);
        } catch {
          setValidatedArea({
            isValid: false,
            areaHectares: 0,
            bbox: [0, 0, 0, 0],
            centroid: [0, 0],
            error: 'Invalid JSON syntax for GeoJSON geometry'
          });
          return;
        }
      } else {
        const area = PREDEFINED_AREAS.find(a => a.id === selectedAreaId) || PREDEFINED_AREAS[0];
        geom = {
          type: 'Polygon',
          coordinates: [area.coordinates]
        };
      }

      try {
        const res = await fetch('/api/satellite/validate-area', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ geometry: geom })
        });
        const data = await res.json();
        setValidatedArea(data);
      } catch (err: any) {
        setValidatedArea({
          isValid: false,
          areaHectares: 0,
          bbox: [0, 0, 0, 0],
          centroid: [0, 0],
          error: err.message
        });
      }
    };

    validate();
  }, [selectedAreaId, isCustomAoi, customGeoJson]);

  // Step 5: Backend searches available Sentinel-2 scenes
  const handleSearchScenes = async () => {
    if (!validatedArea || !validatedArea.isValid) {
      alert('Please select or define a valid geographical area first.');
      return;
    }

    setSearchingScenes(true);
    setSearchError(null);
    setSelectedBeforeScene(null);
    setSelectedAfterScene(null);

    let geom: any;
    if (isCustomAoi) {
      geom = JSON.parse(customGeoJson);
    } else {
      const area = PREDEFINED_AREAS.find(a => a.id === selectedAreaId) || PREDEFINED_AREAS[0];
      geom = {
        type: 'Polygon',
        coordinates: [area.coordinates]
      };
    }

    try {
      // 1. Search Before Scenes
      const beforeRes = await fetch('/api/satellite/search-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geometry: geom,
          startDate: beforeDateRange.start,
          endDate: beforeDateRange.end,
          maxCloudCover
        })
      });

      // 2. Search After Scenes
      const afterRes = await fetch('/api/satellite/search-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          geometry: geom,
          startDate: afterDateRange.start,
          endDate: afterDateRange.end,
          maxCloudCover
        })
      });

      if (!beforeRes.ok || !afterRes.ok) {
        throw new Error('Failed to retrieve Sentinel-2 scenes from Copernicus STAC.');
      }

      const beforeData = await beforeRes.json();
      const afterData = await afterRes.json();

      setBeforeScenes(beforeData.scenes || []);
      setAfterScenes(afterData.scenes || []);
      setDataProvider(beforeData.dataProvider || 'Copernicus Data Space Ecosystem');

      // Auto-select lowest cloud cover scenes if found
      if (beforeData.scenes?.length > 0) {
        setSelectedBeforeScene(beforeData.scenes[0]);
      }
      if (afterData.scenes?.length > 0) {
        setSelectedAfterScene(afterData.scenes[0]);
      }
    } catch (err: any) {
      console.error('Scene search error:', err);
      setSearchError(err.message || 'Error querying Copernicus STAC catalogue.');
    } finally {
      setSearchingScenes(false);
    }
  };

  // Step 8 & 9: Request Process API execution
  const handleExecuteAnalysis = async () => {
    if (!selectedBeforeScene || !selectedAfterScene) {
      alert('Please select both a baseline (before) and a current (after) Sentinel-2 scene.');
      return;
    }

    if (!configStatus?.configured) {
      setActiveTab('config');
      alert('Copernicus credentials are required on the server to process live optical scenes. Please see configuration guide.');
      return;
    }

    let geom: any;
    let areaName: string;
    if (isCustomAoi) {
      geom = JSON.parse(customGeoJson);
      areaName = 'Custom AOI';
    } else {
      const area = PREDEFINED_AREAS.find(a => a.id === selectedAreaId) || PREDEFINED_AREAS[0];
      geom = {
        type: 'Polygon',
        coordinates: [area.coordinates]
      };
      areaName = area.name;
    }

    setExecutingJob(true);
    setJobError(null);

    try {
      const res = await fetch('/api/satellite/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          watershedId: isCustomAoi ? undefined : selectedAreaId,
          areaName,
          areaGeojson: geom,
          spectralIndex,
          beforeScene: selectedBeforeScene,
          afterScene: selectedAfterScene
        })
      });

      const data = await res.json();

      if (res.status === 412) {
        setActiveTab('config');
        setJobError(data.message);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Processing failed.');
      }

      setActiveJob(data.job);
      fetchJobHistory();
    } catch (err: any) {
      console.error('Job submission error:', err);
      setJobError(err.message || 'Analysis job failed to process.');
    } finally {
      setExecutingJob(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Satellite className="w-5 h-5 text-[#147D9A]" />
            Copernicus Sentinel-2 Live Earth Observation
          </h1>
          <p className="text-xs text-[#5B6573]">
            European Space Agency (ESA) Copernicus Data Space Ecosystem • Sentinel-2 Level-2A BOA Multi-Spectral Processing
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#D9E0E7] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'analyze'
                ? 'bg-[#163A63] text-white shadow-xs'
                : 'text-[#5B6573] hover:text-[#163A63]'
            }`}
          >
            Observation Workflow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'config'
                ? 'bg-[#163A63] text-white shadow-xs'
                : 'text-[#5B6573] hover:text-[#163A63]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Copernicus Credentials
            {configStatus && !configStatus.configured && (
              <span className="w-2 h-2 rounded-full bg-[#BC3A3A] inline-block" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-[#163A63] text-white shadow-xs'
                : 'text-[#5B6573] hover:text-[#163A63]'
            }`}
          >
            Job Dossier ({jobHistory.length})
          </button>
        </div>
      </div>

      {/* CONFIGURATION SCREEN (Displayed if credentials missing or tab active) */}
      {activeTab === 'config' && (
        <div className="bg-white border border-[#D9E0E7] rounded-lg p-6 shadow-2xs space-y-5">
          <div className="flex items-start justify-between border-b border-[#D9E0E7] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${configStatus?.configured ? 'text-[#287A4B]' : 'text-[#D0641A]'}`} />
                <h2 className="text-base font-bold text-[#163A63]">
                  Copernicus Data Space Ecosystem (CDSE) Gateway Configuration
                </h2>
              </div>
              <p className="text-xs text-[#5B6573] mt-1">
                Zero-Simulation Policy Enforcement: GEOHarvest connects directly to the official Copernicus Data Space APIs and never manufactures synthetic satellite observations.
              </p>
            </div>

            <button
              type="button"
              onClick={checkConfig}
              disabled={loadingConfig}
              className="px-3 py-1.5 rounded border border-[#D9E0E7] bg-[#F5F7F9] hover:bg-white text-xs font-semibold text-[#163A63] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingConfig ? 'animate-spin' : ''}`} />
              Verify Connection
            </button>
          </div>

          {/* Status Indicator Card */}
          <div className={`p-4 rounded-lg border ${
            configStatus?.configured
              ? 'bg-[#E8F5E9] border-[#A7F3D0] text-[#166534]'
              : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
          }`}>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              {configStatus?.configured ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#287A4B]" />
                  Server Credentials Active • Sentinel Hub Process API Ready
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#D0641A]" />
                  Copernicus Server Credentials Not Configured
                </>
              )}
            </div>
            <p className="text-xs mt-1">
              {configStatus?.configured
                ? 'Your server environment is securely authenticated with Copernicus Data Space Ecosystem. Optical Level-2A scene processing is fully enabled.'
                : 'To request true-colour, NDVI, or NDWI pixel matrices from Sentinel Hub Process API, provide your Copernicus Data Space client credentials in environment secrets.'}
            </p>
          </div>

          {/* Missing Secrets Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#F5F7F9] border border-[#D9E0E7] space-y-2">
              <span className="font-bold text-[#163A63] uppercase tracking-wider text-[11px]">
                Required Server-Side Secrets
              </span>
              <ul className="space-y-1.5 font-mono text-[11px]">
                <li className="flex items-center justify-between p-2 rounded bg-white border border-[#E5E9EE]">
                  <span>COPERNICUS_CLIENT_ID</span>
                  {configStatus?.missingCredentials?.includes('COPERNICUS_CLIENT_ID') ? (
                    <span className="text-[#BC3A3A] font-bold text-[10px]">MISSING</span>
                  ) : (
                    <span className="text-[#287A4B] font-bold text-[10px]">CONFIGURED</span>
                  )}
                </li>
                <li className="flex items-center justify-between p-2 rounded bg-white border border-[#E5E9EE]">
                  <span>COPERNICUS_CLIENT_SECRET</span>
                  {configStatus?.missingCredentials?.includes('COPERNICUS_CLIENT_SECRET') ? (
                    <span className="text-[#BC3A3A] font-bold text-[10px]">MISSING</span>
                  ) : (
                    <span className="text-[#287A4B] font-bold text-[10px]">CONFIGURED</span>
                  )}
                </li>
              </ul>
              <div className="text-[10px] text-[#5B6573] italic pt-1">
                🔒 In accordance with security mandates, tokens and credentials are never handled or stored in browser code.
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#F5F7F9] border border-[#D9E0E7] space-y-2">
              <span className="font-bold text-[#163A63] uppercase tracking-wider text-[11px]">
                Registration & Credentials Guide
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-[#5B6573] leading-relaxed text-xs">
                <li>
                  Create an account on{' '}
                  <a
                    href="https://dataspace.copernicus.eu"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#147D9A] underline font-semibold inline-flex items-center gap-0.5"
                  >
                    Copernicus Data Space Ecosystem <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Go to <strong>User Settings</strong> → <strong>Sentinel Hub Configuration</strong>.</li>
                <li>Create an OAuth Client (select <em>client_credentials</em> grant type).</li>
                <li>Copy the Client ID and Client Secret into the AI Studio <strong>Settings → Secrets</strong> panel.</li>
                <li>Click <strong>Verify Connection</strong> above to refresh.</li>
              </ol>
            </div>
          </div>

          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded text-xs text-[#163A63] flex items-center justify-between">
            <span>
              💡 <strong>Catalogue Discovery is Active:</strong> You can continue searching the public Copernicus Sentinel-2 STAC catalogue below for observation dates and cloud-cover metrics without credentials!
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('analyze')}
              className="px-3 py-1 bg-[#163A63] text-white rounded font-bold text-xs shrink-0"
            >
              Go to Workflow
            </button>
          </div>
        </div>
      )}

      {/* WORKFLOW VIEW (Steps 1 to 14) */}
      {activeTab === 'analyze' && (
        <div className="space-y-4">
          {/* Workflow Stepper Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Controls Column: Configuration & Search */}
            <div className="lg:col-span-5 space-y-4">
              {/* Step 1: Area of Interest Selection */}
              <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
                  <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#163A63] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Select Watershed / Area of Interest
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setIsCustomAoi(false)}
                      className={`px-2 py-0.5 rounded ${!isCustomAoi ? 'bg-[#163A63] text-white font-semibold' : 'text-[#5B6573]'}`}
                    >
                      Watershed
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCustomAoi(true)}
                      className={`px-2 py-0.5 rounded ${isCustomAoi ? 'bg-[#163A63] text-white font-semibold' : 'text-[#5B6573]'}`}
                    >
                      Custom GeoJSON
                    </button>
                  </div>
                </div>

                {!isCustomAoi ? (
                  <div className="space-y-2 text-xs">
                    {PREDEFINED_AREAS.map(area => (
                      <label
                        key={area.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          selectedAreaId === area.id
                            ? 'bg-[#EFF6FF] border-[#163A63] text-[#163A63] font-bold'
                            : 'border-[#D9E0E7] text-[#1F2937] hover:bg-[#F5F7F9]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="watershed"
                            checked={selectedAreaId === area.id}
                            onChange={() => setSelectedAreaId(area.id)}
                            className="text-[#163A63]"
                          />
                          <span>{area.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#5B6573]">{area.hectares.toLocaleString()} Ha</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    <label className="block text-[11px] font-semibold text-[#5B6573]">
                      Paste GeoJSON Polygon Geometry:
                    </label>
                    <textarea
                      rows={4}
                      value={customGeoJson}
                      onChange={(e) => setCustomGeoJson(e.target.value)}
                      placeholder='{"type":"Polygon","coordinates":[[[78.86,12.28],[78.93,12.28],[78.93,12.33],[78.86,12.33],[78.86,12.28]]]}'
                      className="w-full rounded border border-[#D9E0E7] p-2 font-mono text-[10px] bg-[#F5F7F9]"
                    />
                  </div>
                )}

                {/* Step 4 Result: Backend validation feedback */}
                {validatedArea && (
                  <div className={`p-2 rounded text-[11px] flex items-center justify-between ${
                    validatedArea.isValid
                      ? 'bg-[#E8F5E9] text-[#166534] border border-[#A7F3D0]'
                      : 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]'
                  }`}>
                    {validatedArea.isValid ? (
                      <>
                        <span className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#287A4B]" />
                          Area Verified: {validatedArea.areaHectares.toLocaleString()} Ha
                        </span>
                        <span className="font-mono text-[10px]">
                          Centroid: {validatedArea.centroid[1].toFixed(3)}°N, {validatedArea.centroid[0].toFixed(3)}°E
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#BC3A3A]" />
                        {validatedArea.error}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 & 3: Observation Dates & Cloud Cover */}
              <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D9E0E7] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#163A63] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  Temporal Range & Cloud Tolerance
                </span>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                      Baseline (Before Scheme) Date Window:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={beforeDateRange.start}
                        onChange={(e) => setBeforeDateRange(p => ({ ...p, start: e.target.value }))}
                        className="rounded border border-[#D9E0E7] px-2 py-1 text-xs"
                      />
                      <input
                        type="date"
                        value={beforeDateRange.end}
                        onChange={(e) => setBeforeDateRange(p => ({ ...p, end: e.target.value }))}
                        className="rounded border border-[#D9E0E7] px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#1F2937] mb-1">
                      Current (Post-Intervention) Date Window:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={afterDateRange.start}
                        onChange={(e) => setAfterDateRange(p => ({ ...p, start: e.target.value }))}
                        className="rounded border border-[#D9E0E7] px-2 py-1 text-xs"
                      />
                      <input
                        type="date"
                        value={afterDateRange.end}
                        onChange={(e) => setAfterDateRange(p => ({ ...p, end: e.target.value }))}
                        className="rounded border border-[#D9E0E7] px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#1F2937] mb-1">
                      <span>Maximum Cloud Cover Threshold:</span>
                      <span className="font-mono text-[#163A63] font-bold">{maxCloudCover}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={maxCloudCover}
                      onChange={(e) => setMaxCloudCover(Number(e.target.value))}
                      className="w-full accent-[#163A63]"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={searchingScenes || !validatedArea?.isValid}
                    onClick={handleSearchScenes}
                    className="w-full py-2 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Search className={`w-3.5 h-3.5 ${searchingScenes ? 'animate-spin' : ''}`} />
                    {searchingScenes ? 'Searching Copernicus STAC...' : 'Query Copernicus Sentinel-2 STAC'}
                  </button>
                </div>

                {searchError && (
                  <div className="p-2 bg-[#FEF2F2] text-[#991B1B] rounded text-xs border border-[#FECACA]">
                    {searchError}
                  </div>
                )}
              </div>

              {/* Step 8: Spectral Index Output Option */}
              <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D9E0E7] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#163A63] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                  Spectral Index Output
                </span>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSpectralIndex('NDVI')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      spectralIndex === 'NDVI'
                        ? 'bg-[#E8F5E9] border-[#287A4B] text-[#166534]'
                        : 'border-[#D9E0E7] hover:bg-[#F5F7F9]'
                    }`}
                  >
                    <div className="font-bold">NDVI</div>
                    <div className="text-[10px] text-[#5B6573] mt-1">Vegetation Vigor</div>
                    <div className="text-[9px] font-mono mt-0.5">(B08-B04)/(B08+B04)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpectralIndex('NDWI')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      spectralIndex === 'NDWI'
                        ? 'bg-[#E0F2FE] border-[#147D9A] text-[#075985]'
                        : 'border-[#D9E0E7] hover:bg-[#F5F7F9]'
                    }`}
                  >
                    <div className="font-bold">NDWI</div>
                    <div className="text-[10px] text-[#5B6573] mt-1">Water & Moisture</div>
                    <div className="text-[9px] font-mono mt-0.5">(B03-B08)/(B03+B08)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpectralIndex('TRUE_COLOR')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      spectralIndex === 'TRUE_COLOR'
                        ? 'bg-[#EFF6FF] border-[#2563A6] text-[#1E40AF]'
                        : 'border-[#D9E0E7] hover:bg-[#F5F7F9]'
                    }`}
                  >
                    <div className="font-bold">True Colour</div>
                    <div className="text-[10px] text-[#5B6573] mt-1">Natural RGB</div>
                    <div className="text-[9px] font-mono mt-0.5">B04, B03, B02</div>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={executingJob || !selectedBeforeScene || !selectedAfterScene}
                  onClick={handleExecuteAnalysis}
                  className="w-full py-2.5 rounded bg-[#287A4B] hover:bg-[#1E5C38] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${executingJob ? 'animate-spin' : ''}`} />
                  {executingJob ? 'Processing Sentinel-2 Pixels...' : 'Execute Live Copernicus Analysis'}
                </button>

                {jobError && (
                  <div className="p-2 bg-[#FEF2F2] text-[#991B1B] rounded text-xs border border-[#FECACA]">
                    {jobError}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Observation Catalogue & Analysis Output */}
            <div className="lg:col-span-7 space-y-4">
              {/* Step 6 & 7: Available Observation Scenes in Catalogue */}
              {(beforeScenes.length > 0 || afterScenes.length > 0) && (
                <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
                    <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#147D9A]" />
                      Copernicus STAC Observations ({beforeScenes.length + afterScenes.length} scenes discovered)
                    </span>
                    <span className="text-[10px] font-mono text-[#5B6573]">
                      Source: {dataProvider}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Before Scenes List */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#163A63] flex items-center justify-between">
                        <span>Baseline (Before) Scenes</span>
                        <span className="text-[10px] text-[#5B6573]">{beforeScenes.length} found</span>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {beforeScenes.map(scene => (
                          <div
                            key={scene.sceneId}
                            onClick={() => setSelectedBeforeScene(scene)}
                            className={`p-2 rounded border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                              selectedBeforeScene?.sceneId === scene.sceneId
                                ? 'bg-[#EFF6FF] border-[#163A63] font-semibold'
                                : 'border-[#E5E9EE] hover:bg-[#F5F7F9]'
                            }`}
                          >
                            <div>
                              <div className="font-mono text-[#163A63]">{scene.observationDate}</div>
                              <div className="text-[10px] text-[#5B6573]">{scene.platform} • Tile {scene.tileId}</div>
                            </div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#D9E0E7]">
                              {scene.cloudCoverPercentage}% Cloud
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* After Scenes List */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#163A63] flex items-center justify-between">
                        <span>Current (After) Scenes</span>
                        <span className="text-[10px] text-[#5B6573]">{afterScenes.length} found</span>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {afterScenes.map(scene => (
                          <div
                            key={scene.sceneId}
                            onClick={() => setSelectedAfterScene(scene)}
                            className={`p-2 rounded border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                              selectedAfterScene?.sceneId === scene.sceneId
                                ? 'bg-[#EFF6FF] border-[#163A63] font-semibold'
                                : 'border-[#E5E9EE] hover:bg-[#F5F7F9]'
                            }`}
                          >
                            <div>
                              <div className="font-mono text-[#163A63]">{scene.observationDate}</div>
                              <div className="text-[10px] text-[#5B6573]">{scene.platform} • Tile {scene.tileId}</div>
                            </div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-[#D9E0E7]">
                              {scene.cloudCoverPercentage}% Cloud
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 10 & 11: Active Job Status & Comparison Results */}
              {activeJob ? (
                <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-4">
                  {/* Job Header */}
                  <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
                    <div>
                      <div className="font-mono text-xs font-bold text-[#147D9A]">{activeJob.id}</div>
                      <h3 className="text-sm font-bold text-[#163A63]">{activeJob.areaName} Analysis Result</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      activeJob.status === 'completed' ? 'bg-[#E8F5E9] text-[#287A4B]' :
                      activeJob.status === 'processing' ? 'bg-[#EFF6FF] text-[#2563A6] animate-pulse' :
                      activeJob.status === 'failed' ? 'bg-[#FEF2F2] text-[#BC3A3A]' :
                      'bg-[#FEF3C7] text-[#D0641A]'
                    }`}>
                      {activeJob.status}
                    </span>
                  </div>

                  {/* Step 12: Interactive Before & After Visual Slider */}
                  {activeJob.status === 'completed' && activeJob.beforeImageUrl && activeJob.afterImageUrl && (
                    <div className="space-y-2">
                      <div className="relative h-64 w-full rounded-lg overflow-hidden border border-[#D9E0E7] select-none bg-black">
                        <img
                          src={activeJob.beforeImageUrl}
                          alt="Before"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                        >
                          <img
                            src={activeJob.afterImageUrl}
                            alt="After"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                        {/* Divider handle */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md pointer-events-none z-10"
                          style={{ left: `${sliderPos}%` }}
                        />
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderPos}
                          onChange={(e) => setSliderPos(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                        />
                        {/* Labels */}
                        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[10px]">
                          Baseline: {activeJob.beforeScene.observationDate}
                        </div>
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded bg-[#163A63]/80 text-white font-mono text-[10px]">
                          Current: {activeJob.afterScene.observationDate}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#5B6573] text-center">
                        Slide horizontally to cross-compare multi-temporal spectral indices.
                      </div>
                    </div>
                  )}

                  {/* Quantitative Statistics Grid */}
                  {activeJob.statistics && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded bg-[#F5F7F9]">
                        <div className="text-[10px] text-[#5B6573]">Baseline Mean</div>
                        <div className="font-mono font-bold text-[#163A63] text-base">
                          {activeJob.statistics.beforeMean}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-[#F5F7F9]">
                        <div className="text-[10px] text-[#5B6573]">Current Mean</div>
                        <div className="font-mono font-bold text-[#287A4B] text-base">
                          {activeJob.statistics.afterMean}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-[#F5F7F9]">
                        <div className="text-[10px] text-[#5B6573]">Net Shift</div>
                        <div className="font-mono font-bold text-[#147D9A] text-base">
                          +{activeJob.statistics.deltaPercentage}%
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-[#F5F7F9]">
                        <div className="text-[10px] text-[#5B6573]">Analyzed Extent</div>
                        <div className="font-mono font-bold text-[#1F2937] text-base">
                          {activeJob.statistics.areaAnalyzedHectares} Ha
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 13: Mandatory Comprehensive Copernicus Metadata Panel */}
                  {activeJob.metadata && (
                    <div className="p-4 rounded-lg bg-[#F5F7F9] border border-[#D9E0E7] space-y-3 text-xs">
                      <div className="font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#D9E0E7] pb-1.5">
                        <FileCode className="w-3.5 h-3.5 text-[#147D9A]" />
                        Official Remote Sensing Specification & Metadata
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#5B6573]">Satellite Source:</span>{' '}
                          <strong className="text-[#1F2937]">{activeJob.metadata.satelliteSource}</strong>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Collection:</span>{' '}
                          <strong className="text-[#1F2937]">{activeJob.metadata.collection}</strong>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Observation Dates:</span>{' '}
                          <strong className="text-[#1F2937]">{activeJob.metadata.observationDates.before} vs {activeJob.metadata.observationDates.after}</strong>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Cloud Cover:</span>{' '}
                          <strong className="text-[#1F2937]">{activeJob.metadata.cloudCover.before}% & {activeJob.metadata.cloudCover.after}%</strong>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Spatial Resolution:</span>{' '}
                          <strong className="text-[#1F2937]">{activeJob.metadata.spatialResolution}</strong>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Index Formula:</span>{' '}
                          <code className="text-[#163A63] font-bold bg-white px-1 py-0.5 rounded border border-[#E5E9EE]">
                            {activeJob.metadata.indexFormula}
                          </code>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Area of Interest:</span>{' '}
                          <strong className="text-[#1F2937]">{activeJob.metadata.areaOfInterest}</strong>
                        </div>
                        <div>
                          <span className="text-[#5B6573]">Processing Timestamp:</span>{' '}
                          <strong className="text-[#1F2937]">{new Date(activeJob.metadata.processingDate).toLocaleString()}</strong>
                        </div>
                      </div>

                      {/* Confidence Score */}
                      <div className="p-2.5 rounded bg-white border border-[#E5E9EE] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#163A63] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#287A4B]" />
                            Confidence Score: {activeJob.metadata.confidenceScore} / 100
                          </span>
                          <span className="text-[10px] font-bold text-[#287A4B] bg-[#E8F5E9] px-2 py-0.5 rounded">
                            Verified L2A Reflectance
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5B6573] leading-relaxed">
                          {activeJob.metadata.confidenceRationale}
                        </p>
                      </div>

                      {/* Scientific Limitations */}
                      <div className="space-y-1 pt-1">
                        <span className="font-bold text-[#163A63] text-[11px]">Scientific Limitations & Operational Caveats:</span>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#5B6573]">
                          {activeJob.metadata.limitations.map((lim, idx) => (
                            <li key={idx}>{lim}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white border border-[#D9E0E7] rounded-lg p-10 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-[#163A63]/10 text-[#163A63] flex items-center justify-center mx-auto">
                    <Satellite className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#163A63]">No Active Analysis In Progress</h3>
                  <p className="text-xs text-[#5B6573] max-w-md mx-auto leading-relaxed">
                    Select an area of interest on the left, query the live Copernicus Sentinel-2 STAC catalogue, choose baseline and current observation dates, and execute the analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JOB HISTORY TAB (Step 14) */}
      {activeTab === 'history' && (
        <div className="bg-white border border-[#D9E0E7] rounded-lg overflow-hidden shadow-2xs">
          <div className="p-3 bg-[#F5F7F9] border-b border-[#D9E0E7] flex items-center justify-between text-xs">
            <span className="font-bold text-[#163A63] uppercase tracking-wider">
              Recorded Satellite Analysis Jobs ({jobHistory.length})
            </span>
            <button
              type="button"
              onClick={fetchJobHistory}
              className="text-[#147D9A] hover:underline font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {jobHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#5B6573]">
              No satellite analysis jobs recorded yet. Run a new analysis from the Observation Workflow tab.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E9EE]">
              {jobHistory.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    setActiveJob(job);
                    setActiveTab('analyze');
                  }}
                  className="p-3 hover:bg-[#F5F7F9] cursor-pointer transition-colors flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#163A63]">{job.id}</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563A6]">
                        {job.spectralIndex}
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        job.status === 'completed' ? 'bg-[#E8F5E9] text-[#287A4B]' :
                        job.status === 'failed' ? 'bg-[#FEF2F2] text-[#BC3A3A]' :
                        'bg-[#FEF3C7] text-[#D0641A]'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="font-semibold text-[#1F2937]">{job.areaName} ({job.areaHectares} Ha)</div>
                    <div className="text-[11px] text-[#5B6573]">
                      Observed: {job.beforeScene?.observationDate} vs {job.afterScene?.observationDate}
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    {job.statistics && (
                      <div className="font-mono font-bold text-[#287A4B]">
                        +{job.statistics.deltaPercentage}% Shift
                      </div>
                    )}
                    <div className="text-[10px] text-[#5B6573] mt-0.5">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
