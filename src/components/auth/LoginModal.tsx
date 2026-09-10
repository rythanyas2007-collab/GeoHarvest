import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, X, Check, Lock, Mail, Building2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_ACCOUNTS: { role: UserRole; name: string; designation: string; department: string; email: string }[] = [
  {
    role: 'super_admin',
    name: 'Dr. R. Sundaramurthy, IAS',
    designation: 'Principal Secretary & State Mission Director',
    department: 'Dept of Agriculture & Watershed Dev',
    email: 'superadmin@geoharvest.gov.in'
  },
  {
    role: 'government_admin',
    name: 'K. Sangeetha, DRO',
    designation: 'Joint Director (Watershed Management)',
    department: 'Rural Development & Panchayat Raj',
    email: 'govadmin@geoharvest.gov.in'
  },
  {
    role: 'district_admin',
    name: 'M. Arumugam, DRDA',
    designation: 'Project Director, DRDA',
    department: 'District Rural Development Agency',
    email: 'distadmin@geoharvest.gov.in'
  },
  {
    role: 'gis_analyst',
    name: 'P. Vigneshwaran, M.Tech GIS',
    designation: 'Senior Remote Sensing Specialist',
    department: 'State Remote Sensing Centre',
    email: 'gisanalyst@geoharvest.gov.in'
  },
  {
    role: 'field_officer',
    name: 'S. Kathiravan, B.E. Agri',
    designation: 'Assistant Agricultural Engineer',
    department: 'Agricultural Engineering Department',
    email: 'fieldofficer@geoharvest.gov.in'
  },
  {
    role: 'verification_officer',
    name: 'V. Jayaprakash, M.E. Hydrology',
    designation: 'Executive Engineer (Quality Audit)',
    department: 'Quality Control Cell',
    email: 'verifier@geoharvest.gov.in'
  },
  {
    role: 'community_user',
    name: 'C. Muthulakshmi',
    designation: 'Secretary, Watershed User Association',
    department: 'Melchengam Village Committee',
    email: 'farmer.muthulakshmi@village.geoharvest.in'
  },
  {
    role: 'public_viewer',
    name: 'Citizen Guest / Academic Researcher',
    designation: 'Public Domain Viewer',
    department: 'Public Information Portal',
    email: 'public@geoharvest.gov.in'
  }
];

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, role: currentRole } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await login({ email: emailInput.trim() });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoUser = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await login({ role });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-[#D9E0E7] shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#163A63] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#147D9A]" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Government Officer & Community Sign-In
              </h2>
              <div className="text-[11px] text-white/70">
                GEOHarvest Integrated Authentication
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-[#FDF2F2] border border-[#F8C8C8] text-[#BC3A3A] text-xs">
              {error}
            </div>
          )}

          {/* Quick Demo Sign-In Selector */}
          <div>
            <div className="text-xs font-bold text-[#163A63] uppercase tracking-wider mb-2">
              Select Official Role for Instant Verification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemoUser(acc.role)}
                  disabled={loading}
                  className={`p-2.5 text-left rounded-md border text-xs transition-colors relative flex flex-col justify-between ${
                    currentRole === acc.role
                      ? 'border-[#163A63] bg-[#EFF6FF]'
                      : 'border-[#D9E0E7] hover:bg-[#F5F7F9] hover:border-[#163A63]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-[#163A63] flex items-center justify-between">
                      <span>{acc.name}</span>
                      {currentRole === acc.role && (
                        <Check className="w-3.5 h-3.5 text-[#163A63]" />
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-[#1F2937] mt-0.5">
                      {acc.designation}
                    </div>
                    <div className="text-[10px] text-[#5B6573] truncate">
                      {acc.department}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-[#2563A6]">
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#D9E0E7]"></div>
            <span className="flex-shrink mx-3 text-[11px] text-[#5B6573] font-medium">Or enter registered email</span>
            <div className="flex-grow border-t border-[#D9E0E7]"></div>
          </div>

          {/* Email input form */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#1F2937] mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[#5B6573]" />
                <input
                  type="email"
                  placeholder="name@geoharvest.gov.in"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#D9E0E7] focus:ring-2 focus:ring-[#163A63]/20 focus:border-[#163A63]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !emailInput.trim()}
              className="w-full py-2 px-4 rounded-md bg-[#163A63] hover:bg-[#0F2845] text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In with Government Identity'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#F5F7F9] border-t border-[#D9E0E7] text-[11px] text-[#5B6573] flex items-center justify-between">
          <span>Role-Based Access Control Enforced</span>
          <span>TAWDEVA Protected System</span>
        </div>
      </div>
    </div>
  );
};
