import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { 
  Globe, 
  UserCheck, 
  Menu, 
  LogOut, 
  LogIn, 
  Shield, 
  Building2, 
  MapPin, 
  Layers,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenLoginModal: () => void;
}

const ROLES_LIST: { role: UserRole; title: string; desc: string }[] = [
  { role: 'super_admin', title: 'Super Administrator', desc: 'Principal Secretary / State Mission Director' },
  { role: 'government_admin', title: 'Government Administrator', desc: 'Joint Director (Watershed Management)' },
  { role: 'district_admin', title: 'District Administrator', desc: 'Project Director, DRDA' },
  { role: 'gis_analyst', title: 'GIS Analyst / Planner', desc: 'Senior Remote Sensing & Spatial Specialist' },
  { role: 'field_officer', title: 'Field Officer', desc: 'Assistant Agricultural Engineer (Watershed)' },
  { role: 'verification_officer', title: 'Verification Officer', desc: 'Executive Engineer (Quality & Verification)' },
  { role: 'community_user', title: 'Community User', desc: 'Melchengam Watershed User Association' },
  { role: 'public_viewer', title: 'Public Viewer', desc: 'Citizen / Academic Guest' }
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenLoginModal }) => {
  const { user, role, switchRole, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#163A63] text-white border-b border-[#0F2845] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Left: Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-1.5 rounded-md hover:bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            {/* Government Emblem / Hex Shield Symbol */}
            <div className="w-8 h-8 rounded-md bg-[#147D9A] flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-tight border border-white/20">
              GH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight leading-none text-white">
                  GEOHarvest
                </span>
                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#287A4B] text-white">
                  Gov TN
                </span>
              </div>
              <div className="text-[11px] text-white/70 tracking-tight leading-none truncate max-w-[200px] sm:max-w-xs">
                {t('tagline')}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls, Role Switcher, Language, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
            title="Switch Language (English / தமிழ்)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Test Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2563A6] hover:bg-[#1E528B] text-xs font-medium text-white transition-colors border border-white/20"
              title="Switch user role for evaluation"
            >
              <Shield className="w-3.5 h-3.5 text-white/80" />
              <span className="hidden sm:inline font-semibold">
                {t(role as any) || role}
              </span>
              <span className="sm:hidden font-semibold">Role</span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {roleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white text-[#1F2937] shadow-xl border border-[#D9E0E7] z-50 py-2">
                  <div className="px-3 py-1.5 border-b border-[#D9E0E7]">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#5B6573]">
                      Evaluation Role Switcher (8 Roles)
                    </div>
                    <div className="text-[10px] text-[#5B6573]">
                      Test role-based access, field actions, and permissions:
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {ROLES_LIST.map(r => (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => {
                          switchRole(r.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-start justify-between hover:bg-[#F5F7F9] transition-colors ${
                          role === r.role ? 'bg-[#EFF6FF] text-[#2563A6] font-bold border-l-4 border-[#2563A6]' : 'text-[#1F2937]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{r.title}</div>
                          <div className="text-[10px] text-[#5B6573] truncate max-w-[210px]">
                            {r.desc}
                          </div>
                        </div>
                        {role === r.role && (
                          <span className="text-[10px] font-bold text-[#2563A6]">Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile / Login status */}
          {isAuthenticated && user ? (
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="text-right leading-tight">
                <div className="text-xs font-semibold text-white truncate max-w-[150px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-white/70 truncate max-w-[150px]">
                  {user.designation}
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#287A4B] hover:bg-[#1E603A] text-xs font-semibold text-white transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('signIn')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
