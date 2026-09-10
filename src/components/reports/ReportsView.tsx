import React, { useState, useEffect } from 'react';
import { Watershed, Intervention } from '../../types';
import {
  Printer,
  Download,
  FileText,
  Building,
  CheckCircle2,
  Droplets,
  Award,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { getWatersheds, getInterventions } from '../../utils/apiClient';

export const ReportsView: React.FC = () => {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [selectedWsId, setSelectedWsId] = useState<string>('ws-tvm-04a');
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      getWatersheds(),
      getInterventions()
    ])
      .then(([wsList, intList]) => {
        setWatersheds(wsList);
        setInterventions(intList);
      })
      .catch(err => {
        console.warn('ReportsView data fetch notice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const currentWs = watersheds.find(w => w.id === selectedWsId) || watersheds[0];
  const wsInterventions = interventions.filter(i => i.watershedId === selectedWsId);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !currentWs) {
    return <div className="text-center py-20 text-xs text-[#5B6573]">Loading watershed report docket...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#147D9A]" />
            Official Watershed Inspection & Health Dossier
          </h1>
          <p className="text-xs text-[#5B6573]">
            Government compliant report card suitable for administrative review, NABARD / RIDF audits, and Gram Sabha presentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedWsId}
            onChange={(e) => setSelectedWsId(e.target.value)}
            className="rounded border border-[#D9E0E7] px-2.5 py-1 text-xs bg-white text-[#1F2937]"
          >
            {watersheds.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Formal Government Dossier Document Container */}
      <div className="bg-white border border-[#D9E0E7] shadow-sm rounded-lg p-8 max-w-4xl mx-auto space-y-6 text-[#1F2937] print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-[#163A63] pb-4 text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-[#5B6573]">
            Government of Tamil Nadu • Agriculture & Farmers Welfare Department
          </div>
          <h2 className="text-lg font-extrabold text-[#163A63] tracking-tight">
            Tamil Nadu Watershed Development Agency (TAWDEVA)
          </h2>
          <div className="text-xs font-medium text-[#147D9A]">
            Comprehensive Watershed Hydrological Health & Asset Verification Report
          </div>
          <div className="text-[11px] text-[#5B6573] font-mono pt-1">
            Docket ID: TAWDEVA/TVM/{currentWs.code}/2026-Q3 • Generated: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </div>
        </div>

        {/* Section 1: Basic Profile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#F5F7F9] border border-[#E5E9EE]">
            <div className="text-[10px] text-[#5B6573] uppercase font-bold">Watershed Code</div>
            <div className="font-mono font-bold text-[#163A63] text-sm">{currentWs.code}</div>
          </div>
          <div className="p-2.5 rounded bg-[#F5F7F9] border border-[#E5E9EE]">
            <div className="text-[10px] text-[#5B6573] uppercase font-bold">Catchment Area</div>
            <div className="font-bold text-[#1F2937] text-sm">{currentWs.areaHectares} Ha</div>
          </div>
          <div className="p-2.5 rounded bg-[#F5F7F9] border border-[#E5E9EE]">
            <div className="text-[10px] text-[#5B6573] uppercase font-bold">Drainage Order</div>
            <div className="font-bold text-[#1F2937] text-sm">Order {currentWs.drainageOrder}</div>
          </div>
          <div className="p-2.5 rounded bg-[#F5F7F9] border border-[#E5E9EE]">
            <div className="text-[10px] text-[#5B6573] uppercase font-bold">Normal Rainfall</div>
            <div className="font-bold text-[#1F2937] text-sm">{currentWs.averageRainfallMm} mm/yr</div>
          </div>
        </div>

        {/* Section 2: Health Score Card */}
        <div className="p-4 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#147D9A]" />
              Hydrological Composite Health Index: {currentWs.healthScore} / 100
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#287A4B] text-white">
              {currentWs.healthCategory}
            </span>
          </div>

          <p className="text-xs text-[#1F2937] leading-relaxed">
            Upper Cheyyar demonstrates robust water conservation efficiency with 462.5 Lakh Litres holding potential across 5 monitored structures. Downstream biomass response (NDVI) has improved by 86% compared to pre-project baseline, stabilizing irrigation for 820 farming households.
          </p>
        </div>

        {/* Section 3: Structures Inventory */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
            Water Harvesting Infrastructure Inventory & Health Audit
          </div>

          <table className="w-full text-left text-xs border-collapse border border-[#D9E0E7]">
            <thead>
              <tr className="bg-[#F5F7F9] text-[#163A63] font-bold text-[11px] uppercase border-b border-[#D9E0E7]">
                <th className="p-2 border-r border-[#D9E0E7]">Code</th>
                <th className="p-2 border-r border-[#D9E0E7]">Structure Name & Type</th>
                <th className="p-2 border-r border-[#D9E0E7]">Capacity (m³)</th>
                <th className="p-2 border-r border-[#D9E0E7]">Approved Cost</th>
                <th className="p-2 border-r border-[#D9E0E7]">Silt %</th>
                <th className="p-2 border-r border-[#D9E0E7]">Condition</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E0E7]">
              {wsInterventions.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 font-mono font-bold text-[#163A63] border-r border-[#D9E0E7]">{item.code}</td>
                  <td className="p-2 border-r border-[#D9E0E7]">
                    <div className="font-semibold text-[#1F2937]">{item.name}</div>
                    <div className="text-[10px] text-[#5B6573]">{item.villageName}</div>
                  </td>
                  <td className="p-2 font-mono border-r border-[#D9E0E7]">{item.capacityCubicMetres.toLocaleString()}</td>
                  <td className="p-2 font-mono border-r border-[#D9E0E7]">₹{(item.approvedCostInr / 100000).toFixed(2)}L</td>
                  <td className="p-2 font-mono border-r border-[#D9E0E7]">{item.siltLevelPercentage}%</td>
                  <td className="p-2 font-bold border-r border-[#D9E0E7]">{item.conditionScore}/100</td>
                  <td className="p-2 capitalize">{item.status.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Official Sign-Off Block */}
        <div className="pt-8 border-t border-[#D9E0E7] grid grid-cols-2 gap-8 text-xs text-center">
          <div className="space-y-12">
            <div className="font-bold text-[#163A63]">Verified & Inspected By:</div>
            <div>
              <div className="font-bold">S. Kathiravan, B.E. Agri</div>
              <div className="text-[11px] text-[#5B6573]">Assistant Agricultural Engineer (Watershed)</div>
              <div className="text-[10px] text-[#5B6573]">Chengam Block, Tiruvannamalai</div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="font-bold text-[#163A63]">Countersigned & Approved By:</div>
            <div>
              <div className="font-bold">M. Arumugam, DRDA</div>
              <div className="text-[11px] text-[#5B6573]">Project Director, DRDA & Joint Mission Director</div>
              <div className="text-[10px] text-[#5B6573]">District Rural Development Agency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
