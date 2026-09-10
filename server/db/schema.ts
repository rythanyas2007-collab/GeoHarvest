import {
  User,
  Organization,
  District,
  Village,
  Watershed,
  Intervention,
  FieldEvidence,
  MaintenanceAlert,
  Complaint,
  FieldAction,
  InterventionProposal,
  BudgetScenario,
  AuditLog,
  ExternalServiceStatus,
  SatelliteAnalysisJob,
  DrawnGeometry
} from '../../src/types/index';

export interface DatabaseStore {
  version: string;
  lastUpdated: string;
  organizations: Organization[];
  users: User[];
  districts: District[];
  villages: Village[];
  watersheds: Watershed[];
  interventions: Intervention[];
  fieldEvidence: FieldEvidence[];
  maintenanceAlerts: MaintenanceAlert[];
  complaints: Complaint[];
  fieldActions: FieldAction[];
  proposals: InterventionProposal[];
  budgetScenarios: BudgetScenario[];
  auditLogs: AuditLog[];
  externalServices: ExternalServiceStatus[];
  satelliteJobs: SatelliteAnalysisJob[];
  drawnGeometries: DrawnGeometry[];
}

export interface IGeoHarvestRepository {
  init(): Promise<void>;
  resetToDemo(): Promise<void>;
  
  // Users & Auth
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  
  // Watersheds
  getWatersheds(): Promise<Watershed[]>;
  getWatershedById(id: string): Promise<Watershed | null>;
  
  // Interventions
  getInterventions(watershedId?: string): Promise<Intervention[]>;
  getInterventionById(id: string): Promise<Intervention | null>;
  createIntervention(intervention: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>): Promise<Intervention>;
  updateIntervention(id: string, updates: Partial<Intervention>): Promise<Intervention | null>;
  
  // Field Evidence
  getEvidence(watershedId?: string): Promise<FieldEvidence[]>;
  getEvidenceById(id: string): Promise<FieldEvidence | null>;
  createEvidence(evidence: Omit<FieldEvidence, 'id'>): Promise<FieldEvidence>;
  
  // Maintenance Alerts
  getAlerts(priority?: string): Promise<MaintenanceAlert[]>;
  getAlertById(id: string): Promise<MaintenanceAlert | null>;
  updateAlert(id: string, updates: Partial<MaintenanceAlert>): Promise<MaintenanceAlert | null>;
  
  // Complaints
  getComplaints(status?: string): Promise<Complaint[]>;
  getComplaintById(id: string): Promise<Complaint | null>;
  createComplaint(complaint: Omit<Complaint, 'id' | 'trackingId' | 'createdAt' | 'updatedAt'>): Promise<Complaint>;
  updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | null>;
  
  // Field Actions
  getFieldActions(officerId?: string): Promise<FieldAction[]>;
  createFieldAction(action: Omit<FieldAction, 'id' | 'code' | 'createdAt'>): Promise<FieldAction>;
  updateFieldAction(id: string, updates: Partial<FieldAction>): Promise<FieldAction | null>;
  
  // Proposals & Budgets
  getProposals(): Promise<InterventionProposal[]>;
  getBudgetScenarios(): Promise<BudgetScenario[]>;
  
  // External Services
  getExternalServices(): Promise<ExternalServiceStatus[]>;
  
  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  
  // Satellite Analysis Jobs
  getSatelliteJobs(watershedId?: string): Promise<SatelliteAnalysisJob[]>;
  getSatelliteJobById(id: string): Promise<SatelliteAnalysisJob | null>;
  createSatelliteJob(job: Omit<SatelliteAnalysisJob, 'id' | 'createdAt'>): Promise<SatelliteAnalysisJob>;
  updateSatelliteJob(id: string, updates: Partial<SatelliteAnalysisJob>): Promise<SatelliteAnalysisJob | null>;
  
  // Drawn Geometries (GIS Vector Store)
  getDrawnGeometries(watershedId?: string): Promise<DrawnGeometry[]>;
  getDrawnGeometryById(id: string): Promise<DrawnGeometry | null>;
  createDrawnGeometry(geometry: Omit<DrawnGeometry, 'id' | 'createdAt'>): Promise<DrawnGeometry>;
  deleteDrawnGeometry(id: string): Promise<boolean>;

  // Raw Data export
  exportStore(): Promise<DatabaseStore>;
}
