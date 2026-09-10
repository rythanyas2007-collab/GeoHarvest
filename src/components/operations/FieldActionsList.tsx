import React, { useState, useEffect } from 'react';
import { FieldAction } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ClipboardList, Calendar, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

export const FieldActionsList: React.FC = () => {
  const [actions, setActions] = useState<FieldAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ actions: FieldAction[] }>('/api/field-actions');
      setActions(data.actions || []);
    } catch (err) {
      console.warn('Field actions fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="border-b border-[#D9E0E7] pb-3">
        <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#163A63]" />
          Field Operations & Inspection Assignments
        </h1>
        <p className="text-xs text-[#5B6573]">
          Priority field tasks, engineering assessments, desilting works, and completion verifications.
        </p>
      </div>

      <div className="space-y-3">
        {actions.map((act) => (
          <div key={act.id} className="p-4 rounded-lg border border-[#D9E0E7] bg-white shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#163A63]">{act.code}</span>
                <StatusBadge status={act.priority} size="sm" />
                <span className="text-xs font-semibold text-[#5B6573] uppercase tracking-wider">
                  [{act.type.replace(/_/g, ' ')}]
                </span>
              </div>
              <StatusBadge status={act.status} size="sm" />
            </div>

            <h3 className="text-sm font-bold text-[#1F2937]">{act.title}</h3>

            {act.notes && (
              <div className="text-xs text-[#5B6573] bg-[#F5F7F9] p-2 rounded">
                {act.notes}
              </div>
            )}

            <div className="pt-2 border-t border-[#D9E0E7] flex items-center justify-between text-xs text-[#5B6573] flex-wrap gap-2">
              <span>Assigned Officer: <strong className="text-[#1F2937]">{act.assignedOfficerName}</strong></span>
              <span>Due Date: <strong className="text-[#163A63]">{act.dueDate}</strong></span>
              <span>Watershed: {act.watershedName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
