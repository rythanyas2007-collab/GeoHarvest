import React, { useState } from 'react';
import {
  Settings,
  Database,
  Satellite,
  ShieldCheck,
  RefreshCw,
  Sliders,
  CheckCircle2,
  HardDrive
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [cloudCoverThreshold, setCloudCoverThreshold] = useState(10);
  const [cacheDays, setCacheDays] = useState(30);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#147D9A]" />
            System & Environmental Configuration
          </h1>
          <p className="text-xs text-[#5B6573]">
            Copernicus STAC endpoints, offline GIS cache policies, differential GPS tolerances, and compliance settings.
          </p>
        </div>

        {saved && (
          <div className="px-3 py-1 bg-[#E8F5E9] text-[#287A4B] rounded text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Parameters Updated
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Card 1: Remote Sensing Sentinel-2 STAC */}
        <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D9E0E7] pb-2">
            <Satellite className="w-4 h-4 text-[#147D9A]" />
            <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
              Earth Observation & Sentinel-2 STAC Ingestion
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1F2937] mb-1">
                STAC Catalog Endpoint:
              </label>
              <input
                type="text"
                disabled
                value="https://earth-search.aws.element84.com/v1"
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-[#F5F7F9] font-mono text-[11px] text-[#5B6573]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1F2937] mb-1">
                Maximum Cloud Cover Filter (%):
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={cloudCoverThreshold}
                onChange={(e) => setCloudCoverThreshold(Number(e.target.value))}
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Field Evidence & Geofence Tolerances */}
        <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D9E0E7] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#287A4B]" />
            <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
              Field Evidence Geofence & Spatial Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#1F2937] mb-1">
                Differential GPS Tolerance (Meters):
              </label>
              <input
                type="number"
                disabled
                value="10.0"
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-[#F5F7F9] font-mono text-[11px] text-[#5B6573]"
              />
              <div className="text-[10px] text-[#5B6573] mt-1">
                Photos with accuracy worse than ±10m are flagged for physical re-inspection.
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1F2937] mb-1">
                Offline PWA Vector Cache Retention:
              </label>
              <select
                value={cacheDays}
                onChange={(e) => setCacheDays(Number(e.target.value))}
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
              >
                <option value={14}>14 Days Vector Tiles</option>
                <option value={30}>30 Days Vector Tiles</option>
                <option value={60}>60 Days Vector Tiles</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D9E0E7] flex items-center justify-between">
            <span className="font-semibold text-[#1F2937]">
              Enable Automatic Background Field Evidence Offline Synchronization
            </span>
            <input
              type="checkbox"
              checked={offlineSyncEnabled}
              onChange={(e) => setOfflineSyncEnabled(e.target.checked)}
              className="rounded text-[#163A63]"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-bold text-xs shadow-xs transition-colors"
          >
            Save System Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
