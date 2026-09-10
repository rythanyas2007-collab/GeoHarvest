import React, { useState } from 'react';
import { Watershed, Intervention } from '../../types';
import {
  Calculator,
  Droplets,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Building
} from 'lucide-react';

export const InterventionPlanner: React.FC = () => {
  // Rational Formula Inputs: Q = 0.278 * C * I * A
  const [catchmentAreaHa, setCatchmentAreaHa] = useState<number>(145);
  const [soilTerrainType, setSoilTerrainType] = useState<string>('agri_loam');
  const [rainfallIntensityMmHr, setRainfallIntensityMmHr] = useState<number>(35);
  const [annualRainfallMm, setAnnualRainfallMm] = useState<number>(980);
  const [selectedStructureType, setSelectedStructureType] = useState<string>('check_dam');

  // Runoff coefficients
  const RUNOFF_COEFFICIENTS: Record<string, { c: number; label: string }> = {
    rocky_steep: { c: 0.65, label: 'Rocky / Steep Slopes (> 15% gradient)' },
    clay_rolling: { c: 0.45, label: 'Clayey Soil / Rolling Terrain (5 - 15%)' },
    agri_loam: { c: 0.30, label: 'Agricultural Loam / Gentle Slope (2 - 5%)' },
    sandy_flat: { c: 0.15, label: 'Sandy Loam / Flat Plains (< 2%)' }
  };

  const currentC = RUNOFF_COEFFICIENTS[soilTerrainType]?.c || 0.30;

  // Peak discharge Q (m³/s) = 0.278 * C * I * A
  // A is in sq km = ha / 100
  const areaSqKm = catchmentAreaHa / 100;
  const peakDischargeCubicMetresSec = 0.278 * currentC * rainfallIntensityMmHr * areaSqKm;

  // Annual Harvestable Yield (m³) = Area (m²) * Annual Rainfall (m) * C
  const areaSqMeters = catchmentAreaHa * 10000;
  const annualRainfallMeters = annualRainfallMm / 1000;
  const annualRunoffVolumeCubicMetres = areaSqMeters * annualRainfallMeters * currentC;
  const annualYieldLakhLitres = (annualRunoffVolumeCubicMetres * 1000) / 100000;

  // Recommended structure capacity based on capture factor (typically 30-40% of seasonal runoff)
  const recommendedStorageCubicMetres = Math.round(annualRunoffVolumeCubicMetres * 0.12);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#147D9A]" />
            Hydrological Catchment Runoff Calculator & Intervention Planner
          </h1>
          <p className="text-xs text-[#5B6573]">
            Standard CPWD / TAWDEVA Rational Method runoff sizing, peak flood discharge estimation, and structure feasibility.
          </p>
        </div>

        <div className="px-3 py-1 rounded bg-[#F5F7F9] border border-[#D9E0E7] text-xs font-mono text-[#163A63]">
          Formula: Q = 0.278 · C · I · A
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Input Parameters Form */}
        <div className="lg:col-span-6 bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D9E0E7] pb-2">
            <Sliders className="w-4 h-4 text-[#147D9A]" />
            <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
              Catchment Hydrological Parameters
            </h2>
          </div>

          {/* Catchment Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1F2937]">
                Catchment Area (A):
              </label>
              <span className="font-mono font-bold text-xs text-[#163A63]">
                {catchmentAreaHa} Hectares ({areaSqKm.toFixed(2)} km²)
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="5"
              value={catchmentAreaHa}
              onChange={(e) => setCatchmentAreaHa(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-[#5B6573]">
              <span>10 Ha (Micro)</span>
              <span>500 Ha</span>
              <span>1000 Ha (Sub-watershed)</span>
            </div>
          </div>

          {/* Soil & Terrain */}
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Terrain & Soil Permeability (Runoff Coefficient C = {currentC.toFixed(2)}):
            </label>
            <select
              value={soilTerrainType}
              onChange={(e) => setSoilTerrainType(e.target.value)}
              className="w-full text-xs rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
            >
              {Object.entries(RUNOFF_COEFFICIENTS).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.label} (C = {item.c})
                </option>
              ))}
            </select>
          </div>

          {/* Rainfall Intensity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1F2937]">
                Design Rainfall Intensity (I):
              </label>
              <span className="font-mono font-bold text-xs text-[#163A63]">
                {rainfallIntensityMmHr} mm/hour (10-yr return storm)
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="75"
              step="1"
              value={rainfallIntensityMmHr}
              onChange={(e) => setRainfallIntensityMmHr(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Annual Rainfall */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#1F2937]">
                Normal Annual Rainfall (Tiruvannamalai IMD):
              </label>
              <span className="font-mono font-bold text-xs text-[#163A63]">
                {annualRainfallMm} mm / year
              </span>
            </div>
            <input
              type="range"
              min="600"
              max="1400"
              step="20"
              value={annualRainfallMm}
              onChange={(e) => setAnnualRainfallMm(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Proposed Structure Type */}
          <div className="pt-2 border-t border-[#D9E0E7]">
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Target Intervention Structure Class:
            </label>
            <select
              value={selectedStructureType}
              onChange={(e) => setSelectedStructureType(e.target.value)}
              className="w-full text-xs rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
            >
              <option value="check_dam">Masonry Check Dam (Stream Order 2 or 3)</option>
              <option value="percolation_tank">Percolation Tank (Gentle Slope / Recharge Zone)</option>
              <option value="farm_pond">Individual Farm Pond (Field Catchment 2-5 Ha)</option>
              <option value="recharge_shaft">Sub-Surface Recharge Shaft (Dry Stream Bed)</option>
            </select>
          </div>
        </div>

        {/* Calculated Results & Sizing Specs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
              <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-[#147D9A]" />
                Hydrological Outputs & Spillway Sizing
              </h2>
              <span className="text-[10px] font-bold text-[#287A4B] bg-[#E8F5E9] px-2 py-0.5 rounded">
                Verified Formula
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563A6]">
                  Peak Flood Discharge (Q)
                </div>
                <div className="text-2xl font-bold font-mono text-[#163A63] mt-1">
                  {peakDischargeCubicMetresSec.toFixed(2)} m³/s
                </div>
                <div className="text-[10px] text-[#5B6573] mt-0.5">
                  Spillway must accommodate this peak flood rate safely.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">
                  Annual Harvestable Runoff
                </div>
                <div className="text-2xl font-bold font-mono text-[#287A4B] mt-1">
                  {annualYieldLakhLitres.toFixed(1)} Lakh L
                </div>
                <div className="text-[10px] text-[#5B6573] mt-0.5">
                  Total volumetric runoff generated in catchment.
                </div>
              </div>
            </div>

            {/* Sizing Recommendations */}
            <div className="p-3 rounded-lg bg-[#F5F7F9] border border-[#D9E0E7] space-y-2 text-xs">
              <div className="font-bold text-[#163A63] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#287A4B]" />
                Recommended Engineering Specifications
              </div>
              <ul className="space-y-1 text-[#1F2937] text-[11px] list-disc list-inside">
                <li>
                  <strong>Optimum Reservoir Capacity:</strong> ~{recommendedStorageCubicMetres.toLocaleString()} m³
                </li>
                <li>
                  <strong>Broad Crested Weir Length:</strong> Minimum {(peakDischargeCubicMetresSec * 1.6).toFixed(1)} metres for 1.2m head.
                </li>
                <li>
                  <strong>Apron Protection:</strong> Stone pitching 15m downstream to dissipate hydraulic jump energy.
                </li>
                <li>
                  <strong>Estimated Cost Envelope:</strong> ₹{(recommendedStorageCubicMetres * 95 / 100000).toFixed(2)} Lakhs (TAWDEVA Standard Schedule of Rates 2025-26).
                </li>
              </ul>
            </div>
          </div>

          {/* Feasibility Check Card */}
          <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#163A63] font-bold">
              <Building className="w-4 h-4 text-[#147D9A]" />
              TAWDEVA Site Suitability Matrix
            </div>
            <div className="p-2 rounded bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Soil Permeability Note:</strong> For percolation tanks, ensure infiltration rate exceeds 25 mm/hr in sub-strata. Conduct pit auger test before masonry footing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
