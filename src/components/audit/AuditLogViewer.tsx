import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuditLog } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldCheck, History, Filter, Search, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

export const AuditLogViewer: React.FC = () => {
  const { hasPermission, role } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ logs: AuditLog[] }>('/api/audit-logs', { skipFallback: true });
      setLogs(data.logs || []);
    } catch (err: any) {
      if (err.status === 403) {
        setError('Access denied. Audit logs are restricted to Super Administrators and Government Administrators.');
      } else {
        setError(err.message || 'Error loading audit logs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [role]);

  const filteredLogs = logs.filter((l) => {
    const matchesCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesSearch =
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.ipAddress && l.ipAddress.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const exportCsv = () => {
    const headers = ['Timestamp', 'User Name', 'Role', 'Category', 'Action', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `geoharvest_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasPermission('view_audit_logs')) {
    return (
      <div className="p-8 bg-white border border-[#D9E0E7] rounded-lg text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#BC3A3A] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#163A63]">Restricted Administrative Area</h2>
        <p className="text-xs text-[#5B6573] max-w-md mx-auto">
          Audit logs contain security-sensitive timestamps, user identification, and administrative decisions. Your current active role ({role}) does not have permission to inspect system audit logs.
        </p>
        <div className="text-xs text-[#2563A6] font-semibold">
          Switch to "Super Administrator" or "Government Administrator" using the role selector in the top bar to inspect this log.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-[#163A63]" />
            System Audit & Governance Logs
          </h1>
          <p className="text-xs text-[#5B6573]">
            Immutable trace of authentication, field assignments, verification approvals, and data synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-1.5 rounded-md border border-[#D9E0E7] bg-white hover:bg-[#F5F7F9] text-[#163A63] text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredLogs.length === 0}
            className="px-2.5 py-1.5 rounded-md bg-[#163A63] hover:bg-[#0F2845] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F8C8C8] text-[#BC3A3A] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-3 bg-white border border-[#D9E0E7] rounded-lg shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#5B6573]" />
          <input
            type="text"
            placeholder="Search action, user, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#D9E0E7] focus:outline-none focus:ring-2 focus:ring-[#163A63]/20 focus:border-[#163A63]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#5B6573] font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs rounded-md border border-[#D9E0E7] px-2.5 py-1.5 bg-white text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#163A63]/20"
          >
            <option value="ALL">All Categories</option>
            <option value="AUTH">AUTH</option>
            <option value="WATERSHED">WATERSHED</option>
            <option value="EVIDENCE">EVIDENCE</option>
            <option value="COMPLAINT">COMPLAINT</option>
            <option value="FIELD_ACTION">FIELD_ACTION</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D9E0E7] bg-[#F5F7F9] text-[#5B6573]">
                <th className="py-2.5 px-3 font-semibold">Timestamp (UTC)</th>
                <th className="py-2.5 px-3 font-semibold">User & Role</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">Details</th>
                <th className="py-2.5 px-3 font-semibold">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E0E7]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-[#5B6573]">
                    {isLoading ? 'Loading audit records...' : 'No matching audit logs found.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F5F7F9] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573] whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#163A63]">{log.userName}</div>
                      <div className="text-[10px] text-[#5B6573] font-mono">{log.userRole}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F5F7F9] border border-[#D9E0E7] text-[#163A63]">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#1F2937] font-mono text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-[#1F2937] max-w-md">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573] whitespace-nowrap">
                      {log.ipAddress || 'Internal'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2.5 border-t border-[#D9E0E7] bg-[#F5F7F9] text-[11px] text-[#5B6573] flex items-center justify-between">
          <span>Displaying {filteredLogs.length} audit entries</span>
          <span className="font-medium text-[#163A63]">Tamper-Resistant Local Repository Journal</span>
        </div>
      </div>
    </div>
  );
};
