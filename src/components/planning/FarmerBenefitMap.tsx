import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Droplets,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';

interface FarmerCluster {
  id: string;
  surveyNumber: string;
  farmerName: string;
  village: string;
  category: 'Marginal (<1 Ha)' | 'Small (1-2 Ha)' | 'Semi-Medium (2-4 Ha)';
  holdingAreaHa: number;
  zoneType: 'Direct Ayacut' | 'Groundwater Recharge Zone';
  primaryCrop: string;
  preBorewellDepthM: number;
  postBorewellDepthM: number;
  rechargeBenefitM: number;
}

const FARMER_RECORDS: FarmerCluster[] = [
  {
    id: 'f-01',
    surveyNumber: '142/1A',
    farmerName: 'K. Ramanathan',
    village: 'Melchengam',
    category: 'Marginal (<1 Ha)',
    holdingAreaHa: 0.85,
    zoneType: 'Direct Ayacut',
    primaryCrop: 'Paddy & Blackgram',
    preBorewellDepthM: 32.5,
    postBorewellDepthM: 28.0,
    rechargeBenefitM: 4.5
  },
  {
    id: 'f-02',
    surveyNumber: '142/3B',
    farmerName: 'M. Chinnathambi',
    village: 'Melchengam',
    category: 'Small (1-2 Ha)',
    holdingAreaHa: 1.40,
    zoneType: 'Direct Ayacut',
    primaryCrop: 'Groundnut & Ragi',
    preBorewellDepthM: 34.0,
    postBorewellDepthM: 30.2,
    rechargeBenefitM: 3.8
  },
  {
    id: 'f-03',
    surveyNumber: '158/2',
    farmerName: 'C. Muthulakshmi',
    village: 'Melchengam',
    category: 'Marginal (<1 Ha)',
    holdingAreaHa: 0.65,
    zoneType: 'Groundwater Recharge Zone',
    primaryCrop: 'Vegetables & Floriculture',
    preBorewellDepthM: 38.0,
    postBorewellDepthM: 33.5,
    rechargeBenefitM: 4.5
  },
  {
    id: 'f-04',
    surveyNumber: '88/4',
    farmerName: 'V. Palani',
    village: 'Annamalai Pudur',
    category: 'Small (1-2 Ha)',
    holdingAreaHa: 1.80,
    zoneType: 'Groundwater Recharge Zone',
    primaryCrop: 'Sugarcane & Paddy',
    preBorewellDepthM: 42.0,
    postBorewellDepthM: 39.0,
    rechargeBenefitM: 3.0
  },
  {
    id: 'f-05',
    surveyNumber: '91/1C',
    farmerName: 'A. Selvaraj',
    village: 'Annamalai Pudur',
    category: 'Semi-Medium (2-4 Ha)',
    holdingAreaHa: 2.50,
    zoneType: 'Groundwater Recharge Zone',
    primaryCrop: 'Groundnut',
    preBorewellDepthM: 45.0,
    postBorewellDepthM: 42.5,
    rechargeBenefitM: 2.5
  },
  {
    id: 'f-06',
    surveyNumber: '104/2',
    farmerName: 'S. Arumugam',
    village: 'Melchengam',
    category: 'Marginal (<1 Ha)',
    holdingAreaHa: 0.90,
    zoneType: 'Direct Ayacut',
    primaryCrop: 'Paddy',
    preBorewellDepthM: 31.0,
    postBorewellDepthM: 27.5,
    rechargeBenefitM: 3.5
  }
];

export const FarmerBenefitMap: React.FC = () => {
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = FARMER_RECORDS.filter(f => {
    if (selectedVillage !== 'ALL' && f.village !== selectedVillage) return false;
    if (selectedZone !== 'ALL' && f.zoneType !== selectedZone) return false;
    if (searchQuery && !f.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) && !f.surveyNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#147D9A]" />
            Farmer Ayacut & Well Recharge Beneficiary Register
          </h1>
          <p className="text-xs text-[#5B6573]">
            Survey-number level landholding register with pre vs post water table levels and command zone categorization.
          </p>
        </div>

        <div className="text-xs text-[#5B6573]">
          TAWDEVA Social Audit Compliant • Form VII
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#5B6573]" />
          <input
            type="text"
            placeholder="Search farmer name or survey no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded border border-[#D9E0E7] text-xs bg-white"
          />
        </div>

        <select
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value)}
          className="rounded border border-[#D9E0E7] px-2.5 py-1 bg-white text-xs text-[#1F2937]"
        >
          <option value="ALL">All Villages</option>
          <option value="Melchengam">Melchengam</option>
          <option value="Annamalai Pudur">Annamalai Pudur</option>
        </select>

        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="rounded border border-[#D9E0E7] px-2.5 py-1 bg-white text-xs text-[#1F2937]"
        >
          <option value="ALL">All Impact Zones</option>
          <option value="Direct Ayacut">Direct Ayacut (Gravity Surface Flow)</option>
          <option value="Groundwater Recharge Zone">Groundwater Recharge Zone</option>
        </select>

        <span className="text-[11px] text-[#5B6573] font-mono">
          Showing {filtered.length} of {FARMER_RECORDS.length} records
        </span>
      </div>

      {/* Beneficiary Register Table */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#E5E9EE] text-[#163A63] font-bold text-[11px] uppercase tracking-wider">
                <th className="p-2.5">Survey No.</th>
                <th className="p-2.5">Farmer Name</th>
                <th className="p-2.5">Village</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">Holding (Ha)</th>
                <th className="p-2.5">Zone Type</th>
                <th className="p-2.5">Primary Crops</th>
                <th className="p-2.5 text-right">Pre-Scheme Water Table</th>
                <th className="p-2.5 text-right">Current Water Table</th>
                <th className="p-2.5 text-center">Net Recharge Gain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EE]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#F5F7F9] transition-colors">
                  <td className="p-2.5 font-mono font-bold text-[#163A63]">{f.surveyNumber}</td>
                  <td className="p-2.5 font-semibold text-[#1F2937]">{f.farmerName}</td>
                  <td className="p-2.5 text-[#5B6573]">{f.village}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F7F9] text-[#163A63] border border-[#D9E0E7]">
                      {f.category}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold">{f.holdingAreaHa} Ha</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.zoneType === 'Direct Ayacut' ? 'bg-[#E0F2FE] text-[#147D9A]' : 'bg-[#E8F5E9] text-[#287A4B]'
                    }`}>
                      {f.zoneType}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#5B6573]">{f.primaryCrop}</td>
                  <td className="p-2.5 text-right font-mono text-[#5B6573]">{f.preBorewellDepthM}m</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#163A63]">{f.postBorewellDepthM}m</td>
                  <td className="p-2.5 text-center font-mono font-bold text-[#287A4B]">
                    +{f.rechargeBenefitM}m
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
