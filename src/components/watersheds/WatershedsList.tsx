import React, { useState, useEffect, useCallback } from 'react';
import { Watershed, Intervention } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Droplets, Building, Waves, Users, AlertTriangle, CheckCircle, ExternalLink, Calendar, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { getWatersheds, getInterventions } from '../../utils/apiClient';

export const WatershedsList: React.FC = () => {
  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [selectedWs, setSelectedWs] = useState<Watershed | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadWatersheds = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await getWatersheds();
      setWatersheds(data);
      if (data && data.length > 0) {
        setSelectedWs(prev => prev ? (data.find(w => w.id === prev.id) || data[0]) : data[0]);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Unable to load watersheds from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatersheds();
  }, [loadWatersheds]);

  useEffect(() => {
    if (selectedWs) {
      getInterventions(selectedWs.id)
        .then(data => setInterventions(data))
        .catch(() => {});
    }
  }, [selectedWs]);

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-[#5B6573]">Loading watershed records...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-[#D9E0E7] pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#147D9A]" />
            Watershed Directory & Hydrological Health
          </h1>
          <p className="text-xs text-[#5B6573]">
            Official boundaries, drainages, structures inventory, and health status indicators.
          </p>
        </div>
        <button
          onClick={() => loadWatersheds()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#163A63] bg-white border border-[#D9E0E7] rounded-md hover:bg-[#F5F7F9] transition-colors disabled:opacity-50"
          title="Refresh watersheds from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#147D9A]' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {fetchError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{fetchError} Serving cached demonstration watersheds.</span>
          </div>
          <button
            onClick={() => loadWatersheds()}
            className="px-2.5 py-1 text-xs font-semibold bg-white border border-amber-300 rounded hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid of Watersheds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {watersheds.map((ws) => {
          const isSelected = selectedWs?.id === ws.id;
          return (
            <div
              key={ws.id}
              onClick={() => setSelectedWs(ws)}
              className={`p-4 rounded-lg border transition-all cursor-pointer bg-white shadow-xs ${
                isSelected
                  ? 'border-[#163A63] ring-2 ring-[#163A63]/10'
                  : 'border-[#D9E0E7] hover:border-[#163A63]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#163A63]">{ws.code}</span>
                    <StatusBadge status={ws.healthCategory} size="sm" />
                  </div>
                  <h2 className="text-base font-bold text-[#1F2937] mt-1">{ws.name}</h2>
                  {ws.tamilName && (
                    <div className="text-xs text-[#5B6573] font-medium">{ws.tamilName}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[#163A63]">{ws.healthScore}/100</div>
                  <div className="text-[10px] text-[#5B6573]">Health Index</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#D9E0E7] text-xs">
                <div>
                  <div className="text-[10px] text-[#5B6573]">Area</div>
                  <div className="font-semibold text-[#1F2937] font-mono">{ws.areaHectares} Ha</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#5B6573]">Structures</div>
                  <div className="font-semibold text-[#1F2937]">
                    {ws.structuresCount.total} ({ws.structuresCount.functional} functional)
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#5B6573]">Water Potential</div>
                  <div className="font-semibold text-[#147D9A] font-mono">
                    {ws.waterConservationPotentialLakhLitres} L Lakhs
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#5B6573] bg-[#F5F7F9] p-2 rounded">
                <span>Block: <strong>{ws.block}</strong></span>
                <span>District: <strong>{ws.district}</strong></span>
                <span>Beneficiaries: <strong>{ws.estimatedBeneficiaries}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Watershed Detail Panel */}
      {selectedWs && (
        <div className="p-4 rounded-lg bg-white border border-[#D9E0E7] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E0E7] pb-3">
            <div>
              <div className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
                Watershed Assets & Inventory
              </div>
              <h2 className="text-base font-bold text-[#1F2937]">
                Structures in {selectedWs.name} ({interventions.length} Registered)
              </h2>
            </div>
            <div className="text-xs text-[#5B6573]">
              Centroid: [{selectedWs.coordinates[0].toFixed(4)}, {selectedWs.coordinates[1].toFixed(4)}]
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9E0E7] bg-[#F5F7F9] text-[#5B6573]">
                  <th className="py-2 px-3 font-semibold">Code & Name</th>
                  <th className="py-2 px-3 font-semibold">Type</th>
                  <th className="py-2 px-3 font-semibold">Village</th>
                  <th className="py-2 px-3 font-semibold">Capacity</th>
                  <th className="py-2 px-3 font-semibold">Silt Level</th>
                  <th className="py-2 px-3 font-semibold">Condition Score</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E0E7]">
                {interventions.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F5F7F9]">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#163A63]">{inv.name}</div>
                      <div className="text-[10px] font-mono text-[#5B6573]">{inv.code}</div>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-[#1F2937]">
                      {inv.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-[#1F2937]">{inv.villageName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#1F2937]">
                      {inv.capacityCubicMetres.toLocaleString()} m³
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${inv.siltLevelPercentage > 50 ? 'text-[#BC3A3A]' : 'text-[#1F2937]'}`}>
                          {inv.siltLevelPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[#1F2937]">{inv.conditionScore}/100</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={inv.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
