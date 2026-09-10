import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  Map, 
  Droplets, 
  Building, 
  Camera, 
  Satellite, 
  Compass, 
  SlidersHorizontal, 
  Coins, 
  Users, 
  FileText, 
  AlertTriangle, 
  MessageSquareWarning, 
  ClipboardList, 
  CheckCircle2, 
  Home, 
  ShieldAlert, 
  UserCheck, 
  Database, 
  History, 
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  titleKey: string;
  items: {
    id: string;
    labelKey: string;
    icon: React.ElementType;
    requiredPermission?: string;
    badgeCount?: number;
    phase?: number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { role, hasPermission, user } = useAuth();
  const { t } = useLanguage();

  const navSections: NavSection[] = [
    {
      titleKey: 'navOverview',
      items: [
        { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard },
        { id: 'gis-explorer', labelKey: 'navGisExplorer', icon: Map }
      ]
    },
    {
      titleKey: 'navWatershedManagement',
      items: [
        { id: 'watersheds', labelKey: 'navWatersheds', icon: Droplets },
        { id: 'interventions', labelKey: 'navExistingInterventions', icon: Building },
        { id: 'field-evidence', labelKey: 'navFieldEvidence', icon: Camera },
        { id: 'satellite-analysis', labelKey: 'navSatelliteAnalysis', icon: Satellite },
        { id: 'intervention-planner', labelKey: 'navInterventionPlanner', icon: Compass }
      ]
    },
    {
      titleKey: 'navPlanningDecisions',
      items: [
        { id: 'project-priority', labelKey: 'navProjectPriority', icon: SlidersHorizontal },
        { id: 'cost-benefits', labelKey: 'navCostBenefits', icon: Coins },
        { id: 'farmer-benefit-map', labelKey: 'navFarmerBenefitMap', icon: Users },
        { id: 'reports', labelKey: 'navReports', icon: FileText }
      ]
    },
    {
      titleKey: 'navOperations',
      items: [
        { id: 'health-maintenance', labelKey: 'navHealthMaintenance', icon: AlertTriangle, badgeCount: 3 },
        { id: 'complaints', labelKey: 'navComplaints', icon: MessageSquareWarning, badgeCount: 4 },
        { id: 'field-actions', labelKey: 'navFieldActions', icon: ClipboardList, badgeCount: 4 },
        { id: 'completion-verification', labelKey: 'navCompletionVerification', icon: CheckCircle2 }
      ]
    },
    {
      titleKey: 'navCommunity',
      items: [
        { id: 'village-water-pages', labelKey: 'navVillageWaterPages', icon: Home },
        { id: 'community-reports', labelKey: 'navCommunityReports', icon: ShieldAlert }
      ]
    },
    {
      titleKey: 'navAdministration',
      items: [
        { id: 'users-roles', labelKey: 'navUsersRoles', icon: UserCheck, requiredPermission: 'manage_users' },
        { id: 'data-sources', labelKey: 'navDataSources', icon: Database },
        { id: 'audit-logs', labelKey: 'navAuditLogs', icon: History, requiredPermission: 'view_audit_logs' },
        { id: 'settings', labelKey: 'navSettings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Navigation Sidebar Panel */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-white border-r border-[#D9E0E7] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#D9E0E7] lg:hidden">
          <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#5B6573] hover:text-[#1F2937]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Context Banner */}
        <div className="p-3 bg-[#F5F7F9] border-b border-[#D9E0E7]">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">
            Active Evaluation Role
          </div>
          <div className="text-xs font-bold text-[#163A63] truncate">
            {t(role as any) || role}
          </div>
          <div className="text-[11px] text-[#5B6573] truncate">
            {user?.district || 'Tiruvannamalai District'}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section) => {
            // Filter items based on user permissions
            const visibleItems = section.items.filter(item => {
              if (item.requiredPermission) {
                return hasPermission(item.requiredPermission);
              }
              // Public viewer sees restricted tabs
              if (role === 'public_viewer') {
                return ['dashboard', 'gis-explorer', 'watersheds', 'interventions', 'village-water-pages', 'data-sources'].includes(item.id);
              }
              return true;
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.titleKey} className="space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">
                  {t(section.titleKey as any) || section.titleKey}
                </div>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#163A63] text-white font-semibold'
                          : 'text-[#1F2937] hover:bg-[#F5F7F9] hover:text-[#163A63]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#5B6573]'}`} />
                        <span className="truncate">{t(item.labelKey as any) || item.labelKey}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badgeCount !== undefined && item.badgeCount > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-white text-[#163A63]'
                                : 'bg-[#BC3A3A]/10 text-[#BC3A3A]'
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                        {item.phase && (
                          <span
                            className={`text-[9px] font-mono px-1 rounded ${
                              isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            P{item.phase}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#D9E0E7] bg-white text-[10px] text-[#5B6573]">
          <div className="font-semibold text-[#163A63]">GEOHarvest v1.0.0</div>
          <div>Gov of Tamil Nadu & TAWDEVA</div>
        </div>
      </aside>
    </>
  );
};
