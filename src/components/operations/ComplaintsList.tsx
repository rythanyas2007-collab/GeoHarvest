import React, { useState, useEffect } from 'react';
import { Complaint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { MessageSquareWarning, MapPin, Mic, Calendar, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

export const ComplaintsList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ complaints: Complaint[] }>('/api/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      console.warn('Complaints fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="space-y-4">
      <div className="border-b border-[#D9E0E7] pb-3">
        <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-[#2563A6]" />
          Village Community Complaints & Grievance Tracking
        </h1>
        <p className="text-xs text-[#5B6573]">
          Near-real-time registered grievances from farmers and village watershed committees with tracking IDs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {complaints.map((cmp) => (
          <div key={cmp.id} className="p-4 rounded-lg border border-[#D9E0E7] bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-[#2563A6]">{cmp.trackingId}</span>
              <StatusBadge status={cmp.status} size="sm" />
            </div>

            <div className="text-xs font-semibold uppercase text-[#163A63]">
              {cmp.category.replace(/_/g, ' ')}
            </div>

            <p className="text-xs text-[#1F2937]">{cmp.description}</p>

            <div className="pt-2 border-t border-[#D9E0E7] flex items-center justify-between text-[11px] text-[#5B6573]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Village: <strong>{cmp.village}</strong>
              </span>
              {cmp.voiceLanguage && (
                <span className="flex items-center gap-1 text-[#2563A6]">
                  <Mic className="w-3.5 h-3.5" />
                  Voice: {cmp.voiceLanguage.toUpperCase()}
                </span>
              )}
            </div>

            {cmp.assignedOfficerName && (
              <div className="text-[11px] text-[#5B6573] bg-[#F5F7F9] p-1.5 rounded">
                Assigned: <strong className="text-[#1F2937]">{cmp.assignedOfficerName}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
