import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Info, ShieldAlert } from 'lucide-react';

interface AccuracyNoticeProps {
  compact?: boolean;
}

export const AccuracyNotice: React.FC<AccuracyNoticeProps> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-[#163A63]/5 border-y border-[#D9E0E7] px-4 py-1.5 text-xs text-[#5B6573] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#147D9A] shrink-0" />
          <span className="font-medium text-[#163A63]">{t('accuracyStatement')}</span>
        </div>
        <div className="flex items-center gap-1 text-[#C77A13] font-medium">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{t('demoLabel')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-xs mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-md bg-[#147D9A]/10 text-[#147D9A] shrink-0 mt-0.5 sm:mt-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#163A63] uppercase tracking-wider">
              System Verification & Precision Standard
            </div>
            <div className="text-sm text-[#1F2937] font-medium">
              {t('accuracyStatement')}
            </div>
            <div className="text-xs text-[#5B6573] mt-0.5">
              Field evidence, complaints, and assignments update in near-real-time. Satellite metrics reflect Sentinel-2 periodic orbital passes.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#FEF6EC] border border-[#F8DCB3] text-[#C77A13] text-xs font-semibold self-start sm:self-center shrink-0">
          <ShieldAlert className="w-4 h-4" />
          <span>{t('demoLabel')}</span>
        </div>
      </div>
    </div>
  );
};
