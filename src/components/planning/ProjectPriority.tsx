import React, { useState } from 'react';
import { StatusBadge } from '../common/StatusBadge';
import {
  ListOrdered,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Users,
  Droplets,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface ProposedProject {
  id: string;
  code: string;
  name: string;
  type: string;
  village: string;
  watershed: string;
  costInr: number;
  capacityLakhL: number;
  beneficiaryFarms: number;
  storageScore: number;
  costEfficiencyScore: number;
  socialScore: number;
  siltRiskScore: number;
  compositeMcdaScore: number;
}

const PROPOSED_PROJECTS: ProposedProject[] = [
  {
    id: 'prop-01',
    code: 'PROP-TVM-01',
    name: 'Masonry Check Dam - Pudur Stream Reach B',
    type: 'Check Dam',
    village: 'Annamalai Pudur',
    watershed: 'Upper Cheyyar',
    costInr: 1450000,
    capacityLakhL: 160,
    beneficiaryFarms: 110,
    storageScore: 92,
    costEfficiencyScore: 88,
    socialScore: 94,
    siltRiskScore: 85,
    compositeMcdaScore: 90.2
  },
  {
    id: 'prop-02',
    code: 'PROP-TVM-02',
    name: 'Community Percolation Pond - Survey 88/1',
    type: 'Percolation Pond',
    village: 'Melchengam',
    watershed: 'Upper Cheyyar',
    costInr: 680000,
    capacityLakhL: 85,
    beneficiaryFarms: 55,
    storageScore: 84,
    costEfficiencyScore: 92,
    socialScore: 82,
    siltRiskScore: 88,
    compositeMcdaScore: 86.8
  },
  {
    id: 'prop-03',
    code: 'PROP-TVM-03',
    name: 'Varahanadi Stream Desilting & Silt Trap',
    type: 'Silt Trap & Desilting',
    village: 'Annamalai Pudur',
    watershed: 'Varahanadi',
    costInr: 520000,
    capacityLakhL: 65,
    beneficiaryFarms: 48,
    storageScore: 78,
    costEfficiencyScore: 89,
    socialScore: 80,
    siltRiskScore: 95,
    compositeMcdaScore: 84.5
  },
  {
    id: 'prop-04',
    code: 'PROP-TVM-04',
    name: 'Deep Aquifer Recharge Shaft (2 Units)',
    type: 'Recharge Shaft',
    village: 'Melchengam',
    watershed: 'Upper Cheyyar',
    costInr: 390000,
    capacityLakhL: 45,
    beneficiaryFarms: 35,
    storageScore: 75,
    costEfficiencyScore: 85,
    socialScore: 76,
    siltRiskScore: 80,
    compositeMcdaScore: 78.9
  },
  {
    id: 'prop-05',
    code: 'PROP-TVM-05',
    name: 'Ridge Contour Stone Bunding (2.4 km)',
    type: 'Contour Bunding',
    village: 'Annamalai Pudur',
    watershed: 'Varahanadi',
    costInr: 880000,
    capacityLakhL: 70,
    beneficiaryFarms: 40,
    storageScore: 70,
    costEfficiencyScore: 74,
    socialScore: 72,
    siltRiskScore: 90,
    compositeMcdaScore: 75.6
  }
];

export const ProjectPriority: React.FC = () => {
  const [budgetLakhs, setBudgetLakhs] = useState<number>(30); // in Lakhs

  const budgetInr = budgetLakhs * 100000;

  // Calculate cumulative allocations
  let runningCost = 0;
  const prioritizedWithStatus = PROPOSED_PROJECTS.map((proj) => {
    const isFunded = runningCost + proj.costInr <= budgetInr;
    if (isFunded) {
      runningCost += proj.costInr;
    }
    return {
      ...proj,
      isFunded
    };
  });

  const fundedProjects = prioritizedWithStatus.filter(p => p.isFunded);
  const totalAllocatedInr = fundedProjects.reduce((sum, p) => sum + p.costInr, 0);
  const totalWaterSavedLakhL = fundedProjects.reduce((sum, p) => sum + p.capacityLakhL, 0);
  const totalFarmsBenefited = fundedProjects.reduce((sum, p) => sum + p.beneficiaryFarms, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-[#147D9A]" />
            MCDA Project Prioritization & Budget Scenarios
          </h1>
          <p className="text-xs text-[#5B6573]">
            Multi-Criteria Decision Analysis ranking based on volumetric storage, cost per liter, social equity, and silt mitigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5B6573] font-semibold">Quick Budget:</span>
          {[15, 25, 35, 50].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBudgetLakhs(b)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                budgetLakhs === b
                  ? 'bg-[#163A63] text-white shadow-xs'
                  : 'bg-white border border-[#D9E0E7] text-[#163A63] hover:bg-[#F5F7F9]'
              }`}
            >
              ₹{b}L
            </button>
          ))}
        </div>
      </div>

      {/* Budget Slider & Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
              Capital Budget Envelope
            </span>
            <span className="text-lg font-bold font-mono text-[#163A63]">
              ₹{budgetLakhs.toFixed(1)} Lakhs
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={budgetLakhs}
            onChange={(e) => setBudgetLakhs(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex justify-between text-[10px] text-[#5B6573]">
            <span>₹10 Lakhs (Lean)</span>
            <span>₹35 Lakhs (Medium)</span>
            <span>₹60 Lakhs (Full Scheme)</span>
          </div>

          <div className="pt-2 border-t border-[#D9E0E7] text-xs text-[#5B6573]">
            TAWDEVA RIDF XXXI allocation for Chengam watershed block.
          </div>
        </div>

        {/* Projected Impact Under Budget */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-2xs">
            <div className="text-[10px] text-[#5B6573] uppercase font-semibold">Funded Interventions</div>
            <div className="text-2xl font-bold font-mono text-[#163A63] mt-1">
              {fundedProjects.length} / {PROPOSED_PROJECTS.length}
            </div>
            <div className="text-[11px] text-[#287A4B] font-semibold mt-1">
              ₹{(totalAllocatedInr / 100000).toFixed(2)}L committed
            </div>
          </div>

          <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-2xs">
            <div className="text-[10px] text-[#5B6573] uppercase font-semibold">New Water Storage</div>
            <div className="text-2xl font-bold font-mono text-[#147D9A] mt-1">
              {totalWaterSavedLakhL} L
            </div>
            <div className="text-[11px] text-[#5B6573] mt-1">
              Lakh Litres harvest potential
            </div>
          </div>

          <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-2xs">
            <div className="text-[10px] text-[#5B6573] uppercase font-semibold">Direct Beneficiaries</div>
            <div className="text-2xl font-bold font-mono text-[#287A4B] mt-1">
              {totalFarmsBenefited}
            </div>
            <div className="text-[11px] text-[#5B6573] mt-1">
              Farming households
            </div>
          </div>
        </div>
      </div>

      {/* Ranked Proposals Table */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg overflow-hidden shadow-2xs">
        <div className="p-3 bg-[#F5F7F9] border-b border-[#D9E0E7] flex items-center justify-between">
          <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
            Prioritized Proposed Works Register (MCDA Weighted)
          </span>
          <span className="text-[11px] text-[#5B6573]">
            Sorted by Composite Multi-Criteria Score
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E5E9EE] text-[#163A63] font-bold text-[11px] uppercase tracking-wider">
                <th className="p-2.5">Rank</th>
                <th className="p-2.5">Proposed Structure</th>
                <th className="p-2.5">Village / Watershed</th>
                <th className="p-2.5 text-right">Est. Cost (INR)</th>
                <th className="p-2.5 text-right">Storage (Lakh L)</th>
                <th className="p-2.5 text-center">MCDA Score</th>
                <th className="p-2.5 text-center">Budget Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EE]">
              {prioritizedWithStatus.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`hover:bg-[#F5F7F9] transition-colors ${
                    p.isFunded ? 'bg-white' : 'bg-[#FAFAFA] text-[#8892A0]'
                  }`}
                >
                  <td className="p-2.5 font-bold font-mono text-[#163A63]">
                    #{idx + 1}
                  </td>
                  <td className="p-2.5">
                    <div className="font-semibold text-[#1F2937]">{p.name}</div>
                    <div className="text-[10px] text-[#5B6573] font-mono">{p.code} • {p.type}</div>
                  </td>
                  <td className="p-2.5">
                    <div>{p.village}</div>
                    <div className="text-[10px] text-[#5B6573]">{p.watershed}</div>
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold">
                    ₹{(p.costInr / 100000).toFixed(2)} L
                  </td>
                  <td className="p-2.5 text-right font-mono text-[#147D9A] font-bold">
                    {p.capacityLakhL} L
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-[#287A4B]">
                    {p.compositeMcdaScore}
                  </td>
                  <td className="p-2.5 text-center">
                    {p.isFunded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#287A4B]">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F7F9] text-[#8892A0] border border-[#D9E0E7]">
                        Unfunded (Backlog)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
