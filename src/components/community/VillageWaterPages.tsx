import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Droplets,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const VillageWaterPages: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedVillage, setSelectedVillage] = useState<'melchengam' | 'pudur'>('melchengam');

  const villageData = {
    melchengam: {
      nameEn: 'Melchengam',
      nameTa: 'மேல்செங்கம்',
      block: 'Chengam',
      population: 4280,
      households: 940,
      storagePct: 76,
      storageLakhL: 345.5,
      waterSecurityDays: 165,
      functionalStructures: 4,
      totalStructures: 5,
      lastRainfallDate: '2026-08-28',
      tankerDependence: 'Zero (Self-Sufficient)',
      groundwaterDepthM: 28.5,
      recentWorks: [
        {
          titleEn: 'Check Dam 1 Spillway Desilted & Clear',
          titleTa: 'தடுப்பணை 1 கலிங்கல் தூர்வாரப்பட்டு சீரமைக்கப்பட்டது',
          date: '15 Aug 2026',
          status: 'Completed'
        },
        {
          titleEn: 'Farm Pond Inflow Channel Deepening',
          titleTa: 'பண்ணைக்குட்டை நீர்வரத்து வாய்க்கால் ஆழப்படுத்துதல்',
          date: '02 Aug 2026',
          status: 'Completed'
        }
      ]
    },
    pudur: {
      nameEn: 'Annamalai Pudur',
      nameTa: 'அண்ணாமலை புதூர்',
      block: 'Chengam North',
      population: 3150,
      households: 680,
      storagePct: 48,
      storageLakhL: 182.0,
      waterSecurityDays: 85,
      functionalStructures: 2,
      totalStructures: 3,
      lastRainfallDate: '2026-08-25',
      tankerDependence: 'Low (Summer Precaution)',
      groundwaterDepthM: 39.0,
      recentWorks: [
        {
          titleEn: 'PTK-TVM-03 Silt Clearance Tender Sanctioned',
          titleTa: 'ஊரணி தூர்வாருதல் பணிக்கு நிதி அனுமதி வழங்கப்பட்டது',
          date: '20 Aug 2026',
          status: 'In Progress'
        }
      ]
    }
  };

  const current = villageData[selectedVillage];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#147D9A]" />
            {language === 'ta' ? 'கிராம சமூக நீர் வெளிப்படைத்தன்மை தளம்' : 'Village Community Water Transparency Portal'}
          </h1>
          <p className="text-xs text-[#5B6573]">
            {language === 'ta'
              ? 'கிராம பஞ்சாயத்து குடிநீர் நிலை, தடுப்பணை நீர் சேமிப்பு மற்றும் விவசாய பாசன நீர் பாதுகாப்பு விவரங்கள்.'
              : 'Public village dashboard displaying water storage reserve, days of drinking security, and structure status.'}
          </p>
        </div>

        {/* Village Switcher */}
        <div className="flex items-center gap-1 bg-[#F5F7F9] p-1 rounded-lg border border-[#D9E0E7]">
          <button
            type="button"
            onClick={() => setSelectedVillage('melchengam')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              selectedVillage === 'melchengam'
                ? 'bg-[#163A63] text-white shadow-xs'
                : 'text-[#5B6573] hover:text-[#163A63]'
            }`}
          >
            Melchengam / மேல்செங்கம்
          </button>
          <button
            type="button"
            onClick={() => setSelectedVillage('pudur')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              selectedVillage === 'pudur'
                ? 'bg-[#163A63] text-white shadow-xs'
                : 'text-[#5B6573] hover:text-[#163A63]'
            }`}
          >
            Annamalai Pudur / அண்ணாமலை புதூர்
          </button>
        </div>
      </div>

      {/* Main Village Status Card */}
      <div className="bg-gradient-to-r from-[#163A63] to-[#147D9A] rounded-xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-white/80 font-mono uppercase tracking-wider">
              Panchayat Ward Profile • {current.block} Block
            </div>
            <h2 className="text-2xl font-bold mt-1">
              {current.nameEn} / <span className="font-normal font-sans">{current.nameTa}</span>
            </h2>
            <div className="flex items-center gap-4 text-xs text-white/90 mt-2">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {current.population.toLocaleString()} {language === 'ta' ? 'மக்கள் தொகை' : 'Citizens'}
              </span>
              <span>•</span>
              <span>
                {current.households} {language === 'ta' ? 'குடும்பங்கள்' : 'Households'}
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-lg p-4 text-center min-w-[160px]">
            <div className="text-[11px] text-white/80 uppercase font-semibold">
              {language === 'ta' ? 'குடிநீர் பாதுகாப்பு' : 'Water Security'}
            </div>
            <div className="text-3xl font-bold font-mono text-white mt-1">
              {current.waterSecurityDays}
            </div>
            <div className="text-[10px] text-white/90">
              {language === 'ta' ? 'நாட்கள் இருப்பு உள்ளது' : 'Days Remaining'}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] text-[#5B6573] uppercase font-bold">
            {language === 'ta' ? 'நீர்த்தேக்க கொள்ளளவு' : 'Reservoir Storage'}
          </div>
          <div className="text-2xl font-bold font-mono text-[#147D9A] mt-1">
            {current.storagePct}%
          </div>
          <div className="w-full bg-[#E5E9EE] h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#147D9A] h-full rounded-full" style={{ width: `${current.storagePct}%` }} />
          </div>
          <div className="text-[10px] text-[#5B6573] mt-1">
            {current.storageLakhL} {language === 'ta' ? 'லட்சம் லிட்டர் இருப்பு' : 'Lakh Litres Stored'}
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] text-[#5B6573] uppercase font-bold">
            {language === 'ta' ? 'செயல்பாட்டு கட்டமைப்புகள்' : 'Functional Structures'}
          </div>
          <div className="text-2xl font-bold font-mono text-[#287A4B] mt-1">
            {current.functionalStructures} / {current.totalStructures}
          </div>
          <div className="text-[11px] text-[#287A4B] font-semibold mt-1">
            {language === 'ta' ? 'முறையாக பராமரிக்கப்படுகிறது' : 'Operational & Checked'}
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] text-[#5B6573] uppercase font-bold">
            {language === 'ta' ? 'நிலத்தடி நீர்மட்டம்' : 'Average Borewell Depth'}
          </div>
          <div className="text-2xl font-bold font-mono text-[#163A63] mt-1">
            {current.groundwaterDepthM}m
          </div>
          <div className="text-[11px] text-[#287A4B] font-semibold mt-1">
            {language === 'ta' ? '+3.2 மீ உயர்ந்துள்ளது' : '+3.2m Water Table Rise'}
          </div>
        </div>

        <div className="bg-white border border-[#D9E0E7] rounded-lg p-3.5 shadow-2xs">
          <div className="text-[10px] text-[#5B6573] uppercase font-bold">
            {language === 'ta' ? 'லாரி தண்ணீர் தேவை' : 'Tanker Dependency'}
          </div>
          <div className="text-base font-bold text-[#287A4B] mt-1">
            {current.tankerDependence}
          </div>
          <div className="text-[10px] text-[#5B6573] mt-1">
            {language === 'ta' ? 'சுயசார்பு கிராமம்' : 'Panchayat Self-Sufficient'}
          </div>
        </div>
      </div>

      {/* Community Works & Maintenance Log */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-2">
          <h3 className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#287A4B]" />
            {language === 'ta' ? 'சமீபத்திய பராமரிப்பு & நீர் மேம்பாட்டு பணிகள்' : 'Recent Village Watershed Works & Desilting'}
          </h3>
          <span className="text-[11px] text-[#5B6573]">
            {language === 'ta' ? 'ஊராட்சி மன்ற கண்காணிப்பு' : 'Gram Sabha Audited'}
          </span>
        </div>

        <div className="space-y-2">
          {current.recentWorks.map((w, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#F5F7F9] border border-[#E5E9EE] flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-[#163A63]">
                  {language === 'ta' ? w.titleTa : w.titleEn}
                </div>
                <div className="text-[10px] text-[#5B6573] mt-0.5">
                  {language === 'ta' ? 'முடிவடைந்த தேதி: ' : 'Completed: '} {w.date}
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#287A4B]">
                {w.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
