import React, { useState, useEffect, useCallback } from 'react';
import { Intervention } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Building, Filter, Search, ShieldCheck, MapPin, Calendar, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { getInterventions } from '../../utils/apiClient';

export const InterventionsList: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadInterventions = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getInterventions();
      setInterventions(data);
    } catch (err: any) {
      setFetchError(err.message || 'Unable to load interventions from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterventions();
  }, [loadInterventions]);

  const filtered = interventions.filter(i => {
    const matchesType = filterType === 'ALL' || i.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;
    const matchesSearch = 
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()) ||
      i.villageName.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-[#D9E0E7] pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Building className="w-5 h-5 text-[#2563A6]" />
            Existing Interventions & Water Harvesting Structures
          </h1>
          <p className="text-xs text-[#5B6573]">
            Master register of check dams, farm ponds, percolation tanks, and recharge shafts.
          </p>
        </div>
        <button
          onClick={() => loadInterventions()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#163A63] bg-white border border-[#D9E0E7] rounded-md hover:bg-[#F5F7F9] transition-colors disabled:opacity-50"
          title="Refresh interventions from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#147D9A]' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {fetchError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{fetchError} Serving cached demonstration records.</span>
          </div>
          <button
            onClick={() => loadInterventions()}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-amber-300 rounded hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="p-3 bg-white border border-[#D9E0E7] rounded-lg shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-[#5B6573]" />
          <input
            type="text"
            placeholder="Search structure or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[#D9E0E7] focus:ring-2 focus:ring-[#163A63]/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#5B6573]">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs rounded-md border border-[#D9E0E7] px-2 py-1 bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="check_dam">Check Dam</option>
              <option value="farm_pond">Farm Pond</option>
              <option value="percolation_tank">Percolation Tank</option>
              <option value="recharge_structure">Recharge Structure</option>
              <option value="pond_rejuvenation">Pond Rejuvenation</option>
              <option value="plantation">Plantation</option>
              <option value="contour_trench">Contour Trench</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#5B6573]">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-md border border-[#D9E0E7] px-2 py-1 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="needs_maintenance">Needs Maintenance</option>
              <option value="critical_damage">Critical Damage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#D9E0E7] bg-[#F5F7F9] text-[#5B6573]">
                <th className="py-2.5 px-3 font-semibold">Structure Code & Name</th>
                <th className="py-2.5 px-3 font-semibold">Type</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Approved Cost</th>
                <th className="py-2.5 px-3 font-semibold">Capacity</th>
                <th className="py-2.5 px-3 font-semibold">Condition</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Last Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E0E7]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F7F9]">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-[#163A63]">{item.name}</div>
                    <div className="text-[10px] font-mono text-[#5B6573]">{item.code}</div>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-[#1F2937]">
                    {item.type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-[#1F2937]">
                    <div>{item.villageName}</div>
                    <div className="text-[10px] text-[#5B6573]">{item.watershedName}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#1F2937]">
                    ₹{(item.approvedCostInr / 100000).toFixed(2)} Lakhs
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#147D9A]">
                    {item.capacityCubicMetres.toLocaleString()} m³
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1F2937]">{item.conditionScore}/100</span>
                      {item.siltLevelPercentage > 0 && (
                        <span className="text-[10px] text-[#5B6573]">
                          ({item.siltLevelPercentage}% silt)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#5B6573]">
                    {item.lastInspectionDate}
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
