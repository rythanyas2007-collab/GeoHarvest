import React, { useState, useEffect } from 'react';
import { ExternalServiceStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Database, Satellite, Server, ShieldCheck, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../utils/apiClient';

export const DataSourcesView: React.FC = () => {
  const [services, setServices] = useState<ExternalServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{ services: ExternalServiceStatus[] }>('/api/dashboard/external-services');
      setServices(data.services || []);
    } catch (err) {
      console.warn('External services fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="space-y-4">
      <div className="border-b border-[#D9E0E7] pb-3">
        <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-[#163A63]" />
          External Data Sources & Satellite Connectors
        </h1>
        <p className="text-xs text-[#5B6573]">
          Zero-simulation policy: Official status of remote sensing and governmental communication interfaces.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-xs text-[#2563A6]">
        <strong>Integrity Mandate:</strong> Copernicus Sentinel-2, Bhuvan, IMD, and SMS gateways require authorized credentials and are never faked or populated with random values. When services are unconfigured, manual verification or uploaded official datasets are required.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <div key={svc.serviceName} className="p-4 rounded-lg border border-[#D9E0E7] bg-white shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#163A63]">{svc.displayName}</h3>
                <span className="font-mono text-[10px] text-[#5B6573]">{svc.serviceName}</span>
              </div>
              <StatusBadge
                status={svc.status === 'connected' ? 'operational' : 'inactive'}
                label={svc.status === 'connected' ? 'Connected' : 'Not Configured'}
                size="sm"
              />
            </div>

            <p className="text-xs text-[#1F2937]">{svc.message}</p>

            {svc.details && (
              <div className="text-[11px] text-[#5B6573] bg-[#F5F7F9] p-2 rounded">
                {svc.details}
              </div>
            )}

            <div className="text-[10px] text-[#5B6573] pt-2 border-t border-[#D9E0E7] flex items-center justify-between">
              <span>Last verified: {new Date(svc.lastChecked).toLocaleTimeString()}</span>
              <span className="font-mono font-semibold text-[#163A63]">Production Connector</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
