import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoginModal } from '../auth/LoginModal';
import { GovernmentDashboard } from '../dashboard/GovernmentDashboard';
import { WatershedsList } from '../watersheds/WatershedsList';
import { InterventionsList } from '../interventions/InterventionsList';
import { MaintenanceAlertsList } from '../operations/MaintenanceAlertsList';
import { ComplaintsList } from '../operations/ComplaintsList';
import { FieldActionsList } from '../operations/FieldActionsList';
import { AuditLogViewer } from '../audit/AuditLogViewer';
import { DataSourcesView } from '../admin/DataSourcesView';
import { GisExplorer } from '../gis/GisExplorer';
import { FieldEvidenceViewer } from '../evidence/FieldEvidenceViewer';
import { SatelliteAnalysis } from '../satellite/SatelliteAnalysis';
import { InterventionPlanner } from '../planning/InterventionPlanner';
import { ProjectPriority } from '../planning/ProjectPriority';
import { CostBenefits } from '../planning/CostBenefits';
import { FarmerBenefitMap } from '../planning/FarmerBenefitMap';
import { CompletionVerification } from '../operations/CompletionVerification';
import { VillageWaterPages } from '../community/VillageWaterPages';
import { CommunityReports } from '../community/CommunityReports';
import { ReportsView } from '../reports/ReportsView';
import { UsersRolesView } from '../admin/UsersRolesView';
import { SettingsView } from '../admin/SettingsView';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronRight, Home, ShieldAlert, Sparkles } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { role, user } = useAuth();
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const getBreadcrumbLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard': return t('navDashboard');
      case 'watersheds': return t('navWatersheds');
      case 'interventions': return t('navExistingInterventions');
      case 'health-maintenance': return t('navHealthMaintenance');
      case 'complaints': return t('navComplaints');
      case 'field-actions': return t('navFieldActions');
      case 'audit-logs': return t('navAuditLogs');
      case 'data-sources': return t('navDataSources');
      case 'gis-explorer': return 'GIS Spatial Explorer';
      case 'field-evidence': return 'Field Geo-Evidence';
      case 'satellite-analysis': return 'Satellite Earth Observation';
      case 'intervention-planner': return 'Catchment Runoff Planner';
      case 'project-priority': return 'MCDA Project Priority';
      case 'cost-benefits': return 'Cost-Benefit Analysis';
      case 'farmer-benefit-map': return 'Farmer Beneficiary Register';
      case 'completion-verification': return 'Completion Verification';
      case 'village-water-pages': return 'Village Water Portal';
      case 'community-reports': return 'Community Grievances';
      case 'reports': return 'Watershed Health Dossier';
      case 'users-roles': return 'Users & RBAC Roles';
      case 'settings': return 'System Settings';
      default: return tab.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <GovernmentDashboard onNavigateToTab={setCurrentTab} />;
      case 'watersheds':
        return <WatershedsList />;
      case 'interventions':
        return <InterventionsList />;
      case 'health-maintenance':
        return <MaintenanceAlertsList />;
      case 'complaints':
        return <ComplaintsList />;
      case 'field-actions':
        return <FieldActionsList />;
      case 'audit-logs':
        return <AuditLogViewer />;
      case 'data-sources':
        return <DataSourcesView />;
      case 'gis-explorer':
        return (
          <GisExplorer
            onSelectIntervention={(id) => setCurrentTab('interventions')}
            onSelectWatershed={(id) => setCurrentTab('watersheds')}
          />
        );
      case 'field-evidence':
        return <FieldEvidenceViewer />;
      case 'satellite-analysis':
        return <SatelliteAnalysis />;
      case 'intervention-planner':
        return <InterventionPlanner />;
      case 'project-priority':
        return <ProjectPriority />;
      case 'cost-benefits':
        return <CostBenefits />;
      case 'farmer-benefit-map':
        return <FarmerBenefitMap />;
      case 'completion-verification':
        return <CompletionVerification />;
      case 'village-water-pages':
        return <VillageWaterPages />;
      case 'community-reports':
        return <CommunityReports />;
      case 'reports':
        return <ReportsView />;
      case 'users-roles':
        return <UsersRolesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <GovernmentDashboard onNavigateToTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Primary Main Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          {/* Breadcrumb bar */}
          <div className="bg-white border-b border-[#D9E0E7] px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-[#5B6573]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                onClick={() => setCurrentTab('dashboard')} 
                className="hover:text-[#163A63] cursor-pointer flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5" />
                <span>GEOHarvest</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D9E0E7]" />
              <span className="font-semibold text-[#163A63]">
                {getBreadcrumbLabel(currentTab)}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[11px]">
              <span>Tiruvannamalai District</span>
              <span>•</span>
              <span className="font-mono text-[#248A52] font-semibold">Online Sync Active</span>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <ErrorBoundary key={currentTab} fallbackTitle={`Issue in ${getBreadcrumbLabel(currentTab)}`}>
              {renderContent()}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Authentication Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};
