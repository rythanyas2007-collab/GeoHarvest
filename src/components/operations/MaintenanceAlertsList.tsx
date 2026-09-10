import React, { useState, useEffect } from 'react';
import { MaintenanceAlert } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

export const MaintenanceAlertsList: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ alerts: MaintenanceAlert[] }>('/api/maintenance/alerts');
      setAlerts(data.alerts || []);
    } catch (err) {
      console.warn('Alerts fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-4">
      <div className="border-b border-[#D9E0E7] pb-3">
        <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#BC3A3A]" />
          Health & Maintenance Alerts
        </h1>
        <p className="text-xs text-[#5B6573]">
          Automated rule-based detection for silt accumulation, scour holes, and structural risks.
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-4 rounded-lg border bg-white shadow-xs ${
              alt.priority === 'critical' ? 'border-[#F8C8C8]' : 'border-[#D9E0E7]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={alt.priority} size="sm" />
                <span className="font-mono text-xs font-bold text-[#163A63]">{alt.code}</span>
                <span className="text-xs text-[#5B6573]">
                  • Structure: <strong className="text-[#1F2937]">{alt.interventionCode}</strong> ({alt.interventionName})
                </span>
              </div>
              <StatusBadge status={alt.status} size="sm" />
            </div>

            <h3 className="text-sm font-bold text-[#1F2937] mt-2">{alt.issue}</h3>
            {alt.issueTamil && (
              <p className="text-xs text-[#5B6573] mt-0.5">{alt.issueTamil}</p>
            )}

            <div className="mt-3 p-2.5 rounded bg-[#F5F7F9] text-xs space-y-1">
              <div>
                <strong className="text-[#163A63]">Supporting Evidence:</strong> {alt.supportingEvidence}
              </div>
              <div>
                <strong className="text-[#163A63]">Recommended Action:</strong> {alt.recommendedAction}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#5B6573] pt-2 border-t border-[#D9E0E7]">
              <span>Responsible Officer: <strong className="text-[#1F2937]">{alt.responsibleOfficerName}</strong></span>
              <span>Due Date: <strong className="text-[#BC3A3A]">{alt.dueDate}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
