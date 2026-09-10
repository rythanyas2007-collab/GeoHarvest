import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Droplets,
  Users,
  Sprout,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const CostBenefits: React.FC = () => {
  const costComparisonData = [
    { name: 'Check Dam', costPer1000L: 0.86, tankerCost: 45.0 },
    { name: 'Farm Pond', costPer1000L: 0.71, tankerCost: 45.0 },
    { name: 'Percolation Tank', costPer1000L: 0.62, tankerCost: 45.0 },
    { name: 'Recharge Shaft', costPer1000L: 0.54, tankerCost: 45.0 }
  ];

  const beneficiaryDistribution = [
    { name: 'Marginal Farmers (< 1 Ha)', value: 54, color: '#287A4B' },
    { name: 'Small Farmers (1 - 2 Ha)', value: 32, color: '#147D9A' },
    { name: 'Semi-Medium Farmers (2 - 4 Ha)', value: 14, color: '#2563A6' }
  ];

  const cropYieldDelta = [
    { crop: 'Paddy (Kharif)', preKgHa: 3200, postKgHa: 4100, increasePct: 28 },
    { crop: 'Groundnut (Rabi)', preKgHa: 1450, postKgHa: 1850, increasePct: 27 },
    { crop: 'Finger Millet (Ragi)', preKgHa: 1800, postKgHa: 2250, increasePct: 25 },
    { crop: 'Pulses / Blackgram', preKgHa: 620, postKgHa: 780, increasePct: 26 }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#147D9A]" />
            Hydrological Economic Cost-Benefit & Farmer Impact Analysis
          </h1>
          <p className="text-xs text-[#5B6573]">
            Audited return on investment, cost per 1,000 Litres stored, crop productivity deltas, and equity distribution.
          </p>
        </div>

        <div className="px-3 py-1 bg-[#E8F5E9] border border-[#A7F3D0] rounded text-xs font-bold text-[#166534] flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          Benefit-Cost Ratio (BCR): 2.84 : 1.00
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#5B6573]">Levelized Water Cost</div>
          <div className="text-2xl font-bold font-mono text-[#163A63] mt-1">
            ₹0.74 <span className="text-xs font-normal text-[#5B6573]">/ 1,000 Litres</span>
          </div>
          <div className="text-[11px] text-[#287A4B] font-semibold mt-1">
            vs ₹45/1000L private tanker supply
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#5B6573]">Total Ayacut Stabilized</div>
          <div className="text-2xl font-bold font-mono text-[#147D9A] mt-1">
            184.5 <span className="text-xs font-normal text-[#5B6573]">Hectares</span>
          </div>
          <div className="text-[11px] text-[#5B6573] mt-1">
            Across Melchengam & Annamalai Pudur
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#5B6573]">Water Table Recharge</div>
          <div className="text-2xl font-bold font-mono text-[#287A4B] mt-1">
            +2.85 <span className="text-xs font-normal text-[#5B6573]">Metres</span>
          </div>
          <div className="text-[11px] text-[#287A4B] font-semibold mt-1">
            Measured in 24 monitoring borewells
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#5B6573]">Annual Farm Income Boost</div>
          <div className="text-2xl font-bold font-mono text-[#163A63] mt-1">
            ₹42,800 <span className="text-xs font-normal text-[#5B6573]">/ household</span>
          </div>
          <div className="text-[11px] text-[#5B6573] mt-1">
            Due to second season cropping
          </div>
        </div>
      </div>

      {/* Chart Row 1: Cost comparison and Farmer equity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Water Cost per 1000L vs Tanker */}
        <div className="lg:col-span-7 bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
            <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-[#147D9A]" />
              Levelized Cost per 1,000 Litres Harvested (₹)
            </h2>
            <span className="text-[11px] text-[#287A4B] font-bold">Over 15-Year Asset Life</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E9EE" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5B6573' }} />
                <YAxis domain={[0, 1.2]} tick={{ fontSize: 11, fill: '#5B6573' }} />
                <Tooltip />
                <Bar dataKey="costPer1000L" name="Harvested Cost (₹/1000L)" fill="#147D9A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-[#5B6573]">
            Every ₹1.00 invested in check dams captures ~1,160 Litres of rainwater for downstream irrigation.
          </div>
        </div>

        {/* Right: Farmer Beneficiary Equity Distribution */}
        <div className="lg:col-span-5 bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
            <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#287A4B]" />
              Beneficiary Landholding Distribution
            </h2>
            <span className="text-[11px] font-mono text-[#163A63]">820 Total Farms</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={beneficiaryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {beneficiaryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {beneficiaryDistribution.map((b) => (
              <div key={b.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#1F2937]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  {b.name}
                </span>
                <span className="font-mono font-bold text-[#163A63]">{b.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Crop Productivity Table */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg overflow-hidden shadow-2xs">
        <div className="p-3 bg-[#F5F7F9] border-b border-[#D9E0E7] flex items-center justify-between">
          <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-[#287A4B]" />
            Agronomic Productivity Gains (Pre vs Post Scheme)
          </span>
          <span className="text-[11px] text-[#5B6573]">
            Verified via TAWDEVA Crop Cutting Experiments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E5E9EE] text-[#163A63] font-bold text-[11px] uppercase tracking-wider">
                <th className="p-2.5">Crop Variety</th>
                <th className="p-2.5 text-right">Pre-Scheme Yield (kg/Ha)</th>
                <th className="p-2.5 text-right">Post-Scheme Yield (kg/Ha)</th>
                <th className="p-2.5 text-right">Yield Improvement</th>
                <th className="p-2.5 text-right">Net Value Addition (₹/Ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EE]">
              {cropYieldDelta.map((c) => (
                <tr key={c.crop} className="hover:bg-[#F5F7F9]">
                  <td className="p-2.5 font-semibold text-[#1F2937]">{c.crop}</td>
                  <td className="p-2.5 text-right font-mono text-[#5B6573]">{c.preKgHa.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#163A63]">{c.postKgHa.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#287A4B]">+{c.increasePct}%</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#147D9A]">
                    +₹{((c.postKgHa - c.preKgHa) * 22).toLocaleString()}
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
