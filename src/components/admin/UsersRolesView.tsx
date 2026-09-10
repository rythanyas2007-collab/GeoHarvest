import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Shield,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Building,
  MapPin,
  Search,
  Filter
} from 'lucide-react';

export const UsersRolesView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const USERS_LIST: User[] = [
    {
      id: 'usr-super-admin',
      name: 'Dr. R. Sundaramurthy, IAS',
      email: 'superadmin@geoharvest.gov.in',
      role: 'super_admin',
      designation: 'Principal Secretary & State Mission Director',
      department: 'Dept of Agriculture & Watershed Development',
      district: 'State HQ - Chennai',
      isActive: true,
      phoneNumber: '+91 94440 11001'
    },
    {
      id: 'usr-gov-admin',
      name: 'K. Sangeetha, DRO',
      email: 'govadmin@geoharvest.gov.in',
      role: 'government_admin',
      designation: 'Joint Director (Watershed Management)',
      department: 'Rural Development & Panchayat Raj',
      district: 'State HQ',
      isActive: true,
      phoneNumber: '+91 94440 22002'
    },
    {
      id: 'usr-dist-admin',
      name: 'M. Arumugam, DRDA',
      email: 'distadmin@geoharvest.gov.in',
      role: 'district_admin',
      designation: 'Project Director, DRDA',
      department: 'District Rural Development Agency',
      district: 'Tiruvannamalai',
      isActive: true,
      phoneNumber: '+91 94440 33003'
    },
    {
      id: 'usr-gis-analyst',
      name: 'P. Vigneshwaran, M.Tech GIS',
      email: 'gisanalyst@geoharvest.gov.in',
      role: 'gis_analyst',
      designation: 'Senior Remote Sensing & GIS Specialist',
      department: 'State Remote Sensing & Spatial Data Centre',
      district: 'Tiruvannamalai & Vellore Region',
      isActive: true,
      phoneNumber: '+91 94440 44004'
    },
    {
      id: 'usr-field-officer',
      name: 'S. Kathiravan, B.E. Agri',
      email: 'fieldofficer@geoharvest.gov.in',
      role: 'field_officer',
      designation: 'Assistant Agricultural Engineer (Watershed)',
      department: 'Agricultural Engineering Department',
      district: 'Tiruvannamalai (Chengam Block)',
      isActive: true,
      phoneNumber: '+91 94440 55005'
    },
    {
      id: 'usr-verify-officer',
      name: 'V. Jayaprakash, M.E. Hydrology',
      email: 'verifier@geoharvest.gov.in',
      role: 'verification_officer',
      designation: 'Executive Engineer (Quality & Verification)',
      department: 'Quality Control & Third-Party Audit Cell',
      district: 'Tiruvannamalai Division',
      isActive: true,
      phoneNumber: '+91 94440 66006'
    },
    {
      id: 'usr-community-user',
      name: 'C. Muthulakshmi',
      email: 'farmer.muthulakshmi@village.geoharvest.in',
      role: 'community_user',
      designation: 'Secretary, Melchengam Watershed User Association',
      department: 'Village Watershed Committee',
      district: 'Tiruvannamalai',
      isActive: true,
      phoneNumber: '+91 98420 77007'
    },
    {
      id: 'usr-public-viewer',
      name: 'Citizen Guest / Academic Researcher',
      email: 'public@geoharvest.gov.in',
      role: 'public_viewer',
      designation: 'Public Viewer / Citizen',
      department: 'Public Domain Portal',
      district: 'All Districts',
      isActive: true
    }
  ];

  const filteredUsers = USERS_LIST.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#147D9A]" />
            Institutional User & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-[#5B6573]">
            Eight distinct institutional roles governing administrative approvals, GIS analysis, field verification, and public transparency.
          </p>
        </div>

        <div className="text-xs text-[#5B6573] font-mono">
          8 Seed Institutional Accounts Configured
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-[#D9E0E7] rounded-lg p-3 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#5B6573]" />
          <input
            type="text"
            placeholder="Search by name, role, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 rounded border border-[#D9E0E7] text-xs bg-white text-[#1F2937]"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-[#D9E0E7] rounded-lg p-4 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#163A63]">{u.name}</h3>
                  <div className="text-xs font-semibold text-[#147D9A] mt-0.5">{u.designation}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EFF6FF] text-[#2563A6]">
                  {u.role.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1 mt-3 text-xs text-[#5B6573]">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#147D9A]" />
                  <span>{u.department}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#147D9A]" />
                  <span>{u.district || 'State Level'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#147D9A]" />
                  <span className="font-mono text-[11px]">{u.email}</span>
                </div>
                {u.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#147D9A]" />
                    <span className="font-mono text-[11px]">{u.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#D9E0E7] flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[#287A4B] font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Status
              </span>
              <span className="text-[10px] font-mono text-[#5B6573]">{u.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
