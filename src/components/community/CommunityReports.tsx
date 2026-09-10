import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintCategory } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { apiFetch } from '../../utils/apiClient';
import {
  MessageSquare,
  Mic,
  Camera,
  MapPin,
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Volume2
} from 'lucide-react';

export const CommunityReports: React.FC = () => {
  const { language } = useLanguage();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [village, setVillage] = useState<string>('Melchengam');
  const [category, setCategory] = useState<ComplaintCategory>('pond_filled_with_silt');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [hasVoiceNote, setHasVoiceNote] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Search tracker
  const [searchTrackingId, setSearchTrackingId] = useState<string>('');
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ complaints: Complaint[] }>('/api/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.warn('Complaints fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please describe the issue.');
      return;
    }

    setSubmitting(true);
    try {
      const trackingCode = `CMP-2026-${String(complaints.length + 1).padStart(3, '0')}`;
      const payload = {
        trackingId: trackingCode,
        category,
        description,
        village,
        coordinates: village === 'Melchengam' ? [12.2982, 78.8924] : [12.3341, 78.9312],
        photoUrl: photoUrl || (category === 'check_dam_damaged' ? 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800' : 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800'),
        voiceNoteUrl: hasVoiceNote ? 'https://audio.geoharvest.gov.in/voice/note-sample.mp3' : undefined,
        voiceLanguage: language === 'ta' ? 'ta' : 'en',
        status: 'submitted',
        isDemonstration: true
      };

      const res = await apiFetch<{ complaint: Complaint }>('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.complaint) {
        setSubmittedId(trackingCode);
        setDescription('');
        setPhotoUrl('');
        setHasVoiceNote(false);
        await fetchComplaints();
      } else {
        alert('Could not submit complaint at this moment. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error submitting complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSearch = () => {
    if (!searchTrackingId.trim()) return;
    const found = complaints.find(
      c => c.trackingId.toLowerCase() === searchTrackingId.trim().toLowerCase()
    );
    setTrackedComplaint(found || null);
  };

  const CATEGORY_OPTIONS: { id: ComplaintCategory; labelEn: string; labelTa: string }[] = [
    { id: 'pond_filled_with_silt', labelEn: 'Pond Filled with Heavy Silt', labelTa: 'ஊரணி / குட்டையில் வண்டல் படிவு' },
    { id: 'check_dam_damaged', labelEn: 'Check Dam Spillway Damaged', labelTa: 'தடுப்பணை கலிங்கல் உடைப்பு / விரிசல்' },
    { id: 'drainage_blocked', labelEn: 'Drainage Stream Blocked by Debris', labelTa: 'நீர்வரத்து கால்வாய் அடைப்பு' },
    { id: 'water_not_reaching_farms', labelEn: 'Water Not Reaching Tail-End Farms', labelTa: 'கடைமடை விவசாயிகளுக்கு தண்ணீர் கிடைக்கவில்லை' },
    { id: 'encroachment', labelEn: 'Water Body Encroachment', labelTa: 'நீர்நிலை ஆக்கிரமிப்பு' }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#147D9A]" />
            {language === 'ta' ? 'பொதுமக்கள் நீர் குறைதீர்ப்பு & தகவல் பதிவு' : 'Citizen Water Grievance & Feedback Portal'}
          </h1>
          <p className="text-xs text-[#5B6573]">
            {language === 'ta'
              ? 'குரல் பதிவு அல்லது புகைப்படத்துடன் நீர் கட்டமைப்பு புகார்களை சமர்ப்பிக்கவும் மற்றும் நிலை கண்காணிக்கவும்.'
              : 'Submit photo and voice-backed water infrastructure complaints with instant tracking ID issuance.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Submit New Grievance */}
        <div className="lg:col-span-7 bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
            <h2 className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#147D9A]" />
              {language === 'ta' ? 'புதிய குறைதீர்ப்பு மனு பதிவு' : 'Register New Grievance'}
            </h2>
            <span className="text-[10px] text-[#5B6573]">Tamil / English Enabled</span>
          </div>

          {submittedId && (
            <div className="p-3 bg-[#E8F5E9] border border-[#A7F3D0] rounded-lg text-xs space-y-1">
              <div className="font-bold text-[#166534] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'ta' ? 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Grievance Registered Successfully!'}
              </div>
              <div className="text-[#1F2937]">
                Your Tracking ID: <strong className="font-mono text-[#163A63]">{submittedId}</strong>.
                Assigned to Assistant Agricultural Engineer (Watershed).
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1F2937] mb-1">
                  {language === 'ta' ? 'கிராமம் *' : 'Panchayat Village *'}
                </label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
                >
                  <option value="Melchengam">Melchengam / மேல்செங்கம்</option>
                  <option value="Annamalai Pudur">Annamalai Pudur / அண்ணாமலை புதூர்</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1F2937] mb-1">
                  {language === 'ta' ? 'பிரச்சனை வகை *' : 'Issue Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937]"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ta' ? cat.labelTa : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#1F2937] mb-1">
                {language === 'ta' ? 'விளக்கம் *' : 'Description of the Issue *'}
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'ta' ? 'பிரச்சனை பற்றிய விவரங்களை பதிவு செய்யவும்...' : 'Describe what structure is damaged, silted, or overflowing...'}
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1.5 text-xs text-[#1F2937]"
              />
            </div>

            {/* Voice note recorder widget */}
            <div className="p-3 bg-[#F5F7F9] rounded-lg border border-[#D9E0E7] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#163A63] flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#147D9A]" />
                  {language === 'ta' ? 'குரல் பதிவு (தமிழ் / English)' : 'Voice Message Recording'}
                </span>
                {hasVoiceNote && (
                  <span className="text-[10px] text-[#287A4B] font-bold">
                    ✓ Voice Note Recorded (18s)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecording(!isRecording);
                    if (!hasVoiceNote) setHasVoiceNote(true);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isRecording
                      ? 'bg-[#BC3A3A] text-white animate-pulse'
                      : hasVoiceNote
                      ? 'bg-[#E8F5E9] text-[#287A4B] border border-[#A7F3D0]'
                      : 'bg-[#163A63] text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isRecording
                    ? (language === 'ta' ? 'பதிவாகிறது... நிறுத்து' : 'Recording... Click to Stop')
                    : hasVoiceNote
                    ? (language === 'ta' ? 'மறுபதிவு செய்' : 'Re-record Voice')
                    : (language === 'ta' ? 'குரல் பதிவு தொடங்கு' : 'Start Voice Recording')}
                </button>

                {hasVoiceNote && (
                  <span className="text-[11px] text-[#5B6573] italic">
                    {language === 'ta' ? 'குரல் பதிவு இணைக்கப்பட்டுள்ளது' : 'Tamil audio file attached'}
                  </span>
                )}
              </div>
            </div>

            {/* Photo upload input */}
            <div>
              <label className="block font-semibold text-[#1F2937] mb-1">
                {language === 'ta' ? 'புகைப்பட ஆதாரம் (விருப்பத்திற்குட்பட்டது)' : 'Geo-Tagged Photo URL (Optional)'}
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded border border-[#D9E0E7] px-2.5 py-1 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-bold text-xs transition-colors shadow-xs"
            >
              {submitting
                ? (language === 'ta' ? 'பதிவாகிறது...' : 'Submitting Grievance...')
                : (language === 'ta' ? 'புகாரை சமர்ப்பிக்கவும்' : 'Submit Grievance with Tracking Code')}
            </button>
          </form>
        </div>

        {/* Right Column: Tracking & Active Grievances */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tracking Search Box */}
          <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#147D9A]" />
              {language === 'ta' ? 'புகார் நிலை கண்காணிப்பு' : 'Track Existing Grievance Status'}
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. CMP-2026-001"
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                className="flex-1 rounded border border-[#D9E0E7] px-2.5 py-1 text-xs font-mono uppercase"
              />
              <button
                type="button"
                onClick={handleTrackSearch}
                className="px-3 py-1 bg-[#163A63] text-white rounded font-bold text-xs"
              >
                Track
              </button>
            </div>

            {trackedComplaint && (
              <div className="p-3 bg-[#F5F7F9] rounded border border-[#D9E0E7] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#163A63]">{trackedComplaint.trackingId}</span>
                  <StatusBadge status={trackedComplaint.status} size="sm" />
                </div>
                <div className="text-[11px] text-[#5B6573]">
                  Village: {trackedComplaint.village} • Category: {trackedComplaint.category.replace(/_/g, ' ')}
                </div>
                <p className="italic text-[#1F2937] bg-white p-2 rounded border border-[#E5E9EE]">
                  "{trackedComplaint.description}"
                </p>
                {trackedComplaint.assignedOfficerName && (
                  <div className="text-[11px] font-semibold text-[#287A4B]">
                    Assigned Officer: {trackedComplaint.assignedOfficerName}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Community Feed */}
          <div className="bg-white border border-[#D9E0E7] rounded-lg overflow-hidden shadow-2xs">
            <div className="p-3 bg-[#F5F7F9] border-b border-[#D9E0E7] text-xs font-bold text-[#163A63] uppercase tracking-wider">
              {language === 'ta' ? 'கிராம குறைதீர்ப்பு பட்டியல்' : 'Active Grievances Log'}
            </div>

            <div className="divide-y divide-[#E5E9EE] max-h-[320px] overflow-y-auto">
              {complaints.map((c) => (
                <div key={c.id} className="p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#163A63]">{c.trackingId}</span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <div className="text-[#1F2937] line-clamp-2">{c.description}</div>
                  <div className="text-[10px] text-[#5B6573] flex items-center justify-between pt-1">
                    <span>{c.village}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
