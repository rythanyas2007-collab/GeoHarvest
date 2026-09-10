import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CompletionCase {
  id: string;
  code: string;
  structureName: string;
  contractorName: string;
  schemeCode: string;
  village: string;
  watershed: string;
  approvedCostInr: number;
  submittedCostInr: number;
  designedCapacityM3: number;
  builtCapacityM3: number;
  beforePhotoUrl: string;
  afterPhotoUrl: string;
  completionDate: string;
  gpsCoordinates: [number, number];
  gpsAccuracyMeters: number;
  status: 'pending_verification' | 'approved' | 'joint_inspection_required' | 'rejected';
  officerRemarks?: string;
}

const SAMPLE_CASES: CompletionCase[] = [
  {
    id: 'comp-01',
    code: 'CKD-TVM-01',
    structureName: 'Masonry Check Dam 1 - Melchengam Stream',
    contractorName: 'M/s Sri Murugan Infrastructure & Co.',
    schemeCode: 'TAWDEVA-RIDF-XXVIII',
    village: 'Melchengam',
    watershed: 'Upper Cheyyar Sub-Watershed',
    approvedCostInr: 1250000,
    submittedCostInr: 1242000,
    designedCapacityM3: 14500,
    builtCapacityM3: 14680,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    completionDate: '2026-08-20',
    gpsCoordinates: [12.2995, 78.8951],
    gpsAccuracyMeters: 3.2,
    status: 'approved',
    officerRemarks: 'Weir crest height and wing wall masonry verified with field level instrument. Apron stone pitching compliant.'
  },
  {
    id: 'comp-02',
    code: 'FPD-TVM-02',
    structureName: 'Community Farm Pond - Survey No. 142/3',
    contractorName: 'Village Watershed Committee Self-Help Group',
    schemeCode: 'MGNREGS-WATERSHED-2025',
    village: 'Melchengam',
    watershed: 'Upper Cheyyar Sub-Watershed',
    approvedCostInr: 340000,
    submittedCostInr: 338500,
    designedCapacityM3: 3200,
    builtCapacityM3: 3250,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    completionDate: '2026-08-18',
    gpsCoordinates: [12.2941, 78.8892],
    gpsAccuracyMeters: 2.8,
    status: 'pending_verification'
  },
  {
    id: 'comp-03',
    code: 'CKD-TVM-06',
    structureName: 'Stone Masonry Check Dam - Pudur Stream Reach 2',
    contractorName: 'K.V.R. Earthworks Tiruvannamalai',
    schemeCode: 'TAWDEVA-RIDF-XXX',
    village: 'Annamalai Pudur',
    watershed: 'Varahanadi Micro-Watershed',
    approvedCostInr: 1100000,
    submittedCostInr: 1095000,
    designedCapacityM3: 11200,
    builtCapacityM3: 10100,
    beforePhotoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
    completionDate: '2026-08-22',
    gpsCoordinates: [12.3489, 78.9512],
    gpsAccuracyMeters: 4.1,
    status: 'joint_inspection_required',
    officerRemarks: 'Capacity is 10% lower than technical sanction. Embankment compaction test report required.'
  }
];

export const CompletionVerification: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [cases, setCases] = useState<CompletionCase[]>(SAMPLE_CASES);
  const [selectedCase, setSelectedCase] = useState<CompletionCase>(SAMPLE_CASES[1]);
  const [remarks, setRemarks] = useState<string>('');
  const [acting, setActing] = useState<boolean>(false);

  const handleAction = async (newStatus: CompletionCase['status']) => {
    setActing(true);
    try {
      // Simulate API update
      setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, status: newStatus, officerRemarks: remarks || c.officerRemarks } : c));
      setSelectedCase(prev => ({ ...prev, status: newStatus, officerRemarks: remarks || prev.officerRemarks }));
      setRemarks('');
      alert(`Case ${selectedCase.code} marked as ${newStatus.toUpperCase()}. Audit log recorded.`);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#147D9A]" />
            Works Completion & Stage Certification Verification
          </h1>
          <p className="text-xs text-[#5B6573]">
            Third-party executive verification desk for Verification Officers and Executive Engineers prior to final bill clearance.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-[#163A63] bg-[#EFF6FF] px-2.5 py-1 rounded border border-[#BFDBFE]">
          Queue: {cases.filter(c => c.status === 'pending_verification').length} Pending Review
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Verification Queue List */}
        <div className="lg:col-span-4 bg-white border border-[#D9E0E7] rounded-lg overflow-hidden shadow-2xs space-y-0">
          <div className="p-3 bg-[#F5F7F9] border-b border-[#D9E0E7] text-xs font-bold text-[#163A63] uppercase tracking-wider">
            Certification Docket
          </div>

          <div className="divide-y divide-[#E5E9EE] max-h-[600px] overflow-y-auto">
            {cases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCase(c)}
                className={`w-full text-left p-3 hover:bg-[#F5F7F9] transition-colors flex flex-col gap-1 ${
                  selectedCase.id === c.id ? 'bg-[#EFF6FF] border-l-4 border-l-[#163A63]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#163A63]">{c.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'approved' ? 'bg-[#E8F5E9] text-[#287A4B]' :
                    c.status === 'joint_inspection_required' ? 'bg-[#FEF3C7] text-[#D0641A]' :
                    'bg-[#EFF6FF] text-[#2563A6]'
                  }`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="font-semibold text-xs text-[#1F2937] line-clamp-1">{c.structureName}</div>
                <div className="text-[11px] text-[#5B6573]">{c.village} • ₹{(c.approvedCostInr / 100000).toFixed(2)}L</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Case Inspection & Decision Panel */}
        <div className="lg:col-span-8 bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-4">
          <div className="flex items-start justify-between border-b border-[#D9E0E7] pb-3">
            <div>
              <span className="font-mono text-xs font-bold text-[#147D9A]">{selectedCase.code}</span>
              <h2 className="text-base font-bold text-[#1F2937]">{selectedCase.structureName}</h2>
              <div className="text-xs text-[#5B6573] mt-0.5">
                Contractor: <strong>{selectedCase.contractorName}</strong> • Scheme: {selectedCase.schemeCode}
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
              selectedCase.status === 'approved' ? 'bg-[#E8F5E9] text-[#287A4B]' :
              selectedCase.status === 'joint_inspection_required' ? 'bg-[#FEF3C7] text-[#D0641A]' :
              'bg-[#EFF6FF] text-[#2563A6]'
            }`}>
              {selectedCase.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Before & After Photo Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-[#D9E0E7] rounded-lg overflow-hidden bg-[#F5F7F9]">
              <div className="p-1.5 bg-[#E5E9EE] text-[11px] font-bold text-[#163A63] text-center">
                Stage 1: Pre-Construction Site Condition
              </div>
              <img
                src={selectedCase.beforePhotoUrl}
                alt="Before"
                className="h-44 w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="border border-[#D9E0E7] rounded-lg overflow-hidden bg-[#F5F7F9]">
              <div className="p-1.5 bg-[#E5E9EE] text-[11px] font-bold text-[#163A63] text-center">
                Stage 3: Post-Completion Geo-Evidence
              </div>
              <img
                src={selectedCase.afterPhotoUrl}
                alt="After"
                className="h-44 w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Geo & Engineering Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded bg-[#F5F7F9]">
              <div className="text-[10px] text-[#5B6573]">TS Approved Cost</div>
              <div className="font-bold text-[#163A63]">₹{(selectedCase.approvedCostInr / 100000).toFixed(2)}L</div>
            </div>
            <div className="p-2.5 rounded bg-[#F5F7F9]">
              <div className="text-[10px] text-[#5B6573]">MB Claimed Cost</div>
              <div className="font-bold text-[#1F2937]">₹{(selectedCase.submittedCostInr / 100000).toFixed(2)}L</div>
            </div>
            <div className="p-2.5 rounded bg-[#F5F7F9]">
              <div className="text-[10px] text-[#5B6573]">Designed Capacity</div>
              <div className="font-bold text-[#147D9A] font-mono">{selectedCase.designedCapacityM3} m³</div>
            </div>
            <div className="p-2.5 rounded bg-[#F5F7F9]">
              <div className="text-[10px] text-[#5B6573]">Built Capacity</div>
              <div className="font-bold text-[#287A4B] font-mono">{selectedCase.builtCapacityM3} m³</div>
            </div>
          </div>

          {/* GPS Verification Shield */}
          <div className="p-2.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#163A63] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#287A4B]" />
              GPS Geofence Match: {selectedCase.gpsCoordinates[0]}°N, {selectedCase.gpsCoordinates[1]}°E (±{selectedCase.gpsAccuracyMeters}m)
            </div>
            <span className="text-[10px] font-bold text-[#287A4B] bg-white px-2 py-0.5 rounded border border-[#A7F3D0]">
              Pass (Within Approved Bounds)
            </span>
          </div>

          {/* Existing Officer Remarks if any */}
          {selectedCase.officerRemarks && (
            <div className="p-2.5 rounded bg-[#F5F7F9] border border-[#D9E0E7] text-xs">
              <span className="font-bold text-[#163A63]">Executive Engineer Notes:</span>
              <p className="italic text-[#1F2937] mt-0.5">{selectedCase.officerRemarks}</p>
            </div>
          )}

          {/* Decision Actions for Verification Officers */}
          {hasPermission('verify_completion') && (
            <div className="pt-3 border-t border-[#D9E0E7] space-y-2">
              <label className="block text-xs font-semibold text-[#1F2937]">
                Verification Officer Certification Endorsement:
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter physical inspection observations or measurement book verification notes..."
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 text-xs text-[#1F2937]"
              />

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => handleAction('approved')}
                  className="px-3.5 py-1.5 rounded bg-[#287A4B] hover:bg-[#1E5C38] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Completion Certificate
                </button>

                <button
                  type="button"
                  disabled={acting}
                  onClick={() => handleAction('joint_inspection_required')}
                  className="px-3 py-1.5 rounded bg-[#D0641A] hover:bg-[#B35213] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Flag for Joint Physical Inspection
                </button>

                <button
                  type="button"
                  disabled={acting}
                  onClick={() => handleAction('rejected')}
                  className="px-3 py-1.5 rounded border border-[#BC3A3A] text-[#BC3A3A] hover:bg-[#FEF2F2] font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Docket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
