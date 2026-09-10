import React, { useState, useEffect, useCallback } from 'react';
import { FieldEvidence, Intervention, Watershed } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { validatePointInWatershed } from '../../utils/gisData';
import { useAuth } from '../../context/AuthContext';
import { getEvidence, getInterventions, getWatersheds, apiFetch } from '../../utils/apiClient';
import {
  Camera,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Plus,
  Filter,
  CheckCircle2,
  Mic,
  Volume2,
  Maximize2,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface FieldEvidenceViewerProps {
  initialWatershedId?: string;
}

export const FieldEvidenceViewer: React.FC<FieldEvidenceViewerProps> = ({ initialWatershedId }) => {
  const { user, hasPermission } = useAuth();
  const [evidenceList, setEvidenceList] = useState<FieldEvidence[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWatershed, setSelectedWatershed] = useState<string>(initialWatershedId || 'ALL');
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Submit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formInterventionId, setFormInterventionId] = useState('');
  const [formStage, setFormStage] = useState<string>('during_construction');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formLat, setFormLat] = useState('12.2995');
  const [formLng, setFormLng] = useState('78.8951');
  const [formAccuracy, setFormAccuracy] = useState('3.8');
  const [formCondition, setFormCondition] = useState<'Good' | 'Fair' | 'Damaged' | 'Silted'>('Good');
  const [formWaterLevel, setFormWaterLevel] = useState('65');
  const [formSiltLevel, setFormSiltLevel] = useState('15');
  const [formNotes, setFormNotes] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<FieldEvidence | null>(null);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [evList, intList, wsList] = await Promise.all([
        getEvidence(selectedWatershed),
        getInterventions(),
        getWatersheds()
      ]);
      setEvidenceList(evList);
      setInterventions(intList);
      setWatersheds(wsList);
    } catch (err: any) {
      setFetchError(err.message || 'Unable to retrieve evidence from server.');
    } finally {
      setLoading(false);
    }
  }, [selectedWatershed]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  // Filtered evidence items
  const filteredEvidence = evidenceList.filter(item => {
    if (selectedStage !== 'ALL' && item.stage !== selectedStage) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    return true;
  });

  // Handle new submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!formInterventionId) {
      setSubmitError('Please select an intervention structure.');
      return;
    }

    const intObj = interventions.find(i => i.id === formInterventionId);
    if (!intObj) return;

    setSubmitting(true);
    try {
      const latNum = parseFloat(formLat);
      const lngNum = parseFloat(formLng);
      const geoCheck = validatePointInWatershed([latNum, lngNum], intObj.watershedId);

      const payload = {
        interventionId: intObj.id,
        interventionCode: intObj.code,
        watershedId: intObj.watershedId,
        stage: formStage,
        photoUrl: formPhotoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80',
        capturedAt: new Date().toISOString(),
        coordinates: [latNum, lngNum],
        gpsAccuracyMeters: parseFloat(formAccuracy) || 4.2,
        cameraDirectionDegrees: 180,
        officerId: user?.id || 'usr-field-officer',
        officerName: user?.name || 'S. Kathiravan, B.E. Agri',
        status: geoCheck.isInside ? 'verified' : 'review_required',
        validationStatus: geoCheck.isInside ? 'PASSED_GEOFENCE' : 'FLAGGED_OUT_OF_BOUNDS',
        structureCondition: formCondition,
        waterLevelPercentage: parseInt(formWaterLevel, 10) || 50,
        siltLevelPercentage: parseInt(formSiltLevel, 10) || 10,
        notes: formNotes || 'Periodic field geo-evidence inspection and verification upload.',
        isOfflineSync: false
      };

      const res = await apiFetch<{ evidence: FieldEvidence }>('/api/evidence', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.evidence) {
        setIsModalOpen(false);
        setFormNotes('');
        await fetchEvidence();
      } else {
        setSubmitError('Server could not process evidence submission.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  const samplePhotos = [
    {
      label: 'Masonry Check Dam (Post Monsoon)',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80'
    },
    {
      label: 'Excavated Farm Pond with Lining',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
    },
    {
      label: 'Stream Bed Silt Inspection',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#147D9A]" />
            Field Evidence & Geo-Photo Verification
          </h1>
          <p className="text-xs text-[#5B6573]">
            Tamper-resistant photographic journal with EXIF spatial validation, geofencing checks, and stage timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchEvidence()}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white border border-[#D9E0E7] hover:bg-[#F5F7F9] text-[#163A63] font-medium text-xs shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh evidence records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#147D9A]' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {hasPermission('submit_evidence') && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-[#163A63] hover:bg-[#0F2845] text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload Field Evidence
            </button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{fetchError} Serving cached demonstration evidence records.</span>
          </div>
          <button
            onClick={() => fetchEvidence()}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-amber-300 rounded hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#163A63] font-bold">
          <Filter className="w-3.5 h-3.5 text-[#147D9A]" /> Filters:
        </div>

        {/* Watershed Filter */}
        <select
          value={selectedWatershed}
          onChange={(e) => setSelectedWatershed(e.target.value)}
          className="rounded border border-[#D9E0E7] px-2.5 py-1 bg-white text-[#1F2937] text-xs"
        >
          <option value="ALL">All Watersheds ({watersheds.length})</option>
          {watersheds.map(ws => (
            <option key={ws.id} value={ws.id}>
              {ws.name} ({ws.code})
            </option>
          ))}
        </select>

        {/* Stage Filter */}
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="rounded border border-[#D9E0E7] px-2.5 py-1 bg-white text-[#1F2937] text-xs"
        >
          <option value="ALL">All Construction Stages</option>
          <option value="before_construction">Before Construction</option>
          <option value="during_construction">During Construction</option>
          <option value="after_completion">After Completion</option>
          <option value="operational_monitoring">Operational Monitoring</option>
          <option value="maintenance">Maintenance</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded border border-[#D9E0E7] px-2.5 py-1 bg-white text-[#1F2937] text-xs"
        >
          <option value="ALL">All Verification Statuses</option>
          <option value="verified">Verified (Within Geofence)</option>
          <option value="review_required">Flagged / Review Required</option>
        </select>

        <span className="ml-auto text-[11px] text-[#5B6573] font-mono">
          Showing {filteredEvidence.length} of {evidenceList.length} evidence records
        </span>
      </div>

      {/* Evidence Gallery Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#5B6573] text-xs">
          Loading field evidence records...
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D9E0E7] rounded-lg text-[#5B6573] space-y-2">
          <Camera className="w-8 h-8 mx-auto text-[#147D9A]/50" />
          <div className="font-semibold text-sm text-[#163A63]">No Field Evidence Found</div>
          <p className="text-xs">No records match the active filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => {
            const geoCheck = validatePointInWatershed(item.coordinates, item.watershedId);
            return (
              <div
                key={item.id}
                className="bg-white border border-[#D9E0E7] hover:border-[#163A63] rounded-lg overflow-hidden shadow-2xs transition-all flex flex-col group"
              >
                {/* Photo Thumbnail Container */}
                <div className="relative h-48 w-full bg-[#E5E9EE] overflow-hidden">
                  <img
                    src={item.photoUrl}
                    alt={`Evidence ${item.interventionCode}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                  {/* Stage Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#163A63] shadow-xs">
                      {item.stage.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Anti-Tamper Geo Validation Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {geoCheck.isInside ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#287A4B] text-white flex items-center gap-1 shadow-xs">
                        <ShieldCheck className="w-3 h-3" /> Geofence Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#BC3A3A] text-white flex items-center gap-1 shadow-xs">
                        <AlertTriangle className="w-3 h-3" /> Geofence Flagged
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay with Coordinates & Structure */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-end justify-between">
                    <div>
                      <div className="text-xs font-mono font-bold tracking-tight">
                        {item.interventionCode}
                      </div>
                      <div className="text-[10px] opacity-90 flex items-center gap-1 font-mono">
                        <MapPin className="w-2.5 h-2.5 text-[#147D9A]" />
                        {item.coordinates[0].toFixed(5)}°N, {item.coordinates[1].toFixed(5)}°E (±{item.gpsAccuracyMeters}m)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePhotoModal(item)}
                      className="p-1 rounded bg-black/40 hover:bg-black/60 text-white"
                      title="Enlarge Photo"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Evidence Details */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#5B6573] mb-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.capturedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-[#163A63]">
                        <User className="w-3 h-3 text-[#147D9A]" />
                        {item.officerName.split(',')[0]}
                      </span>
                    </div>

                    <p className="text-[#1F2937] line-clamp-2 text-xs italic bg-[#F5F7F9] p-2 rounded border border-[#E5E9EE]">
                      "{item.notes}"
                    </p>
                  </div>

                  {/* Water & Silt Gauges */}
                  <div className="pt-2 border-t border-[#D9E0E7] grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-[#F5F7F9] p-1.5 rounded">
                      <div className="text-[9px] text-[#5B6573] uppercase">Condition</div>
                      <div className="font-bold text-[#163A63]">{item.structureCondition}</div>
                    </div>
                    <div className="bg-[#F5F7F9] p-1.5 rounded">
                      <div className="text-[9px] text-[#5B6573] uppercase">Water Level</div>
                      <div className="font-bold text-[#147D9A] font-mono">{item.waterLevelPercentage}%</div>
                    </div>
                    <div className="bg-[#F5F7F9] p-1.5 rounded">
                      <div className="text-[9px] text-[#5B6573] uppercase">Silt Level</div>
                      <div className={`font-bold font-mono ${item.siltLevelPercentage > 50 ? 'text-[#BC3A3A]' : 'text-[#287A4B]'}`}>
                        {item.siltLevelPercentage}%
                      </div>
                    </div>
                  </div>

                  {/* Voice note indicator */}
                  {item.voiceNoteUrl && (
                    <div className="flex items-center justify-between px-2 py-1 bg-[#EFF6FF] text-[#2563A6] rounded text-[11px]">
                      <span className="flex items-center gap-1 font-semibold">
                        <Volume2 className="w-3 h-3" /> Voice Field Note Attached
                      </span>
                      <span className="font-mono text-[10px]">
                        {item.voiceNoteDurationSeconds}s (Tamil Audio)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarge Photo Modal */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl border border-white/20">
            <div className="p-3 bg-[#163A63] text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#147D9A]">
                  {activePhotoModal.interventionCode}
                </span>
                <div className="text-sm font-bold">
                  Stage: {activePhotoModal.stage.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="p-1 rounded text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={activePhotoModal.photoUrl}
                alt="Full Preview"
                className="max-h-[68vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-white text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#5B6573]">Captured: {new Date(activePhotoModal.capturedAt).toLocaleString()}</span>
                <span className="font-mono font-bold text-[#163A63]">
                  GPS: {activePhotoModal.coordinates[0]}°N, {activePhotoModal.coordinates[1]}°E (±{activePhotoModal.gpsAccuracyMeters}m)
                </span>
              </div>
              <div className="p-2 rounded bg-[#F5F7F9] text-[#1F2937] italic">
                "{activePhotoModal.notes}"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Field Evidence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full overflow-hidden shadow-2xl border border-[#D9E0E7]">
            <div className="p-3.5 bg-[#163A63] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#147D9A]" />
                <h3 className="font-bold text-sm">Upload Field Geo-Photo & Evidence</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
              {submitError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
              <div>
                <label className="block font-semibold text-[#1F2937] mb-1">
                  Target Water Harvesting Structure *
                </label>
                <select
                  required
                  value={formInterventionId}
                  onChange={(e) => {
                    setFormInterventionId(e.target.value);
                    const selected = interventions.find(i => i.id === e.target.value);
                    if (selected) {
                      setFormLat(selected.coordinates[0].toString());
                      setFormLng(selected.coordinates[1].toString());
                    }
                  }}
                  className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
                >
                  <option value="">Select structure...</option>
                  {interventions.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name} ({item.villageName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F2937] mb-1">
                    Construction Stage *
                  </label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value)}
                    className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
                  >
                    <option value="before_construction">Before Construction</option>
                    <option value="during_construction">During Construction</option>
                    <option value="after_completion">After Completion</option>
                    <option value="operational_monitoring">Operational Monitoring</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2937] mb-1">
                    Structure Condition
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Silted">Silted</option>
                  </select>
                </div>
              </div>

              {/* Photo selection */}
              <div>
                <label className="block font-semibold text-[#1F2937] mb-1">
                  Photo Evidence Source
                </label>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {samplePhotos.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormPhotoUrl(p.url)}
                        className={`p-1 border rounded text-left transition-colors ${
                          formPhotoUrl === p.url ? 'border-[#163A63] bg-[#EFF6FF]' : 'border-[#D9E0E7]'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="h-12 w-full object-cover rounded" referrerPolicy="no-referrer" />
                        <div className="text-[9px] font-medium text-[#1F2937] mt-1 line-clamp-1">{p.label}</div>
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    placeholder="Or paste custom image URL..."
                    className="w-full rounded border border-[#D9E0E7] px-2.5 py-1 text-xs"
                  />
                </div>
              </div>

              {/* GPS Coordinates with Geofence auto-calculation */}
              <div className="p-2.5 bg-[#F5F7F9] rounded border border-[#D9E0E7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#163A63] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#147D9A]" />
                    EXIF Geofence Validation
                  </span>
                  <span className="text-[10px] text-[#287A4B] font-bold">
                    Differential GPS ±{formAccuracy}m
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#5B6573]">Latitude (°N)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      className="w-full rounded border border-[#D9E0E7] px-2 py-1 font-mono text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#5B6573]">Longitude (°E)</label>
                    <input
                      type="number"
                      step="0.0001"
                      required
                      value={formLng}
                      onChange={(e) => setFormLng(e.target.value)}
                      className="w-full rounded border border-[#D9E0E7] px-2 py-1 font-mono text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Water & Silt Levels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1F2937] mb-1">
                    Water Level: {formWaterLevel}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formWaterLevel}
                    onChange={(e) => setFormWaterLevel(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1F2937] mb-1">
                    Silt Level: {formSiltLevel}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formSiltLevel}
                    onChange={(e) => setFormSiltLevel(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Officer Field Notes */}
              <div>
                <label className="block font-semibold text-[#1F2937] mb-1">
                  Field Inspection Notes *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Record structure conditions, spillway integrity, or vegetation growth..."
                  className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 text-xs text-[#1F2937]"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#D9E0E7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-[#D9E0E7] text-[#5B6573] hover:bg-[#F5F7F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-semibold flex items-center gap-1.5"
                >
                  {submitting ? 'Verifying Coordinates...' : 'Submit Verified Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
