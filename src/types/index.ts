// GEOHarvest Core Domain Types and Interfaces

export type UserRole =
  | 'super_admin'
  | 'government_admin'
  | 'district_admin'
  | 'gis_analyst'
  | 'field_officer'
  | 'verification_officer'
  | 'community_user'
  | 'public_viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  district?: string;
  assignedWatershedIds?: string[];
  phoneNumber?: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  state: string;
  createdAt: string;
}

export interface District {
  id: string;
  name: string;
  state: string;
  code: string;
}

export interface Block {
  id: string;
  districtId: string;
  name: string;
  code: string;
}

export interface Village {
  id: string;
  blockId: string;
  name: string;
  tamilName?: string;
  code: string;
  population: number;
  households: number;
  coordinates: [number, number]; // [lat, lng]
}

export interface Watershed {
  id: string;
  code: string;
  name: string;
  tamilName?: string;
  district: string;
  block: string;
  villages: string[];
  areaHectares: number;
  drainageOrder: number;
  averageRainfallMm: number;
  healthScore: number;
  healthCategory: 'Healthy' | 'Moderate' | 'Needs Attention' | 'Critical';
  structuresCount: {
    total: number;
    functional: number;
    needsAttention: number;
    critical: number;
  };
  waterConservationPotentialLakhLitres: number;
  estimatedBeneficiaries: number;
  coordinates: [number, number]; // Centroid [lat, lng]
  bounds: [[number, number], [number, number]]; // Bounding box
  lastSatelliteDate?: string;
  lastFieldInspectionDate?: string;
  isDemonstration: boolean;
}

export type InterventionType =
  | 'check_dam'
  | 'farm_pond'
  | 'percolation_tank'
  | 'recharge_structure'
  | 'pond_rejuvenation'
  | 'contour_trench'
  | 'vegetative_barrier'
  | 'plantation'
  | 'drainage_restoration';

export type InterventionStatus =
  | 'operational'
  | 'needs_maintenance'
  | 'critical_damage'
  | 'under_construction'
  | 'proposed'
  | 'rejuvenated';

export interface Intervention {
  id: string;
  code: string;
  name: string;
  type: InterventionType;
  watershedId: string;
  watershedName: string;
  villageId: string;
  villageName: string;
  status: InterventionStatus;
  conditionScore: number; // 0 - 100
  coordinates: [number, number]; // [lat, lng]
  constructionYear: number;
  implementingAgency: string;
  approvedCostInr: number;
  capacityCubicMetres: number;
  catchmentAreaHectares: number;
  commandAreaHectares: number;
  beneficiaryHouseholds: number;
  siltLevelPercentage: number;
  lastInspectionDate: string;
  nextInspectionDueDate: string;
  responsibleOfficerId?: string;
  responsibleOfficerName?: string;
  isDemonstration: boolean;
}

export type EvidenceStage =
  | 'before_construction'
  | 'during_construction'
  | 'after_completion'
  | 'operational_monitoring'
  | 'maintenance'
  | 'post_maintenance';

export type EvidenceStatus =
  | 'verified'
  | 'review_required'
  | 'insufficient_evidence'
  | 'missing_information'
  | 'rejected';

export interface FieldEvidence {
  id: string;
  interventionId: string;
  interventionCode: string;
  watershedId: string;
  stage: EvidenceStage;
  photoUrl: string;
  capturedAt: string;
  coordinates: [number, number];
  gpsAccuracyMeters: number;
  cameraDirectionDegrees?: number;
  officerId: string;
  officerName: string;
  status: EvidenceStatus;
  validationStatus: string;
  structureCondition: 'Good' | 'Fair' | 'Damaged' | 'Silted';
  waterLevelPercentage: number;
  siltLevelPercentage: number;
  notes: string;
  voiceNoteUrl?: string;
  voiceNoteDurationSeconds?: number;
  isOfflineSync: boolean;
  syncedAt?: string;
  isDemonstration: boolean;
}

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'open' | 'action_assigned' | 'in_progress' | 'resolved';

export interface MaintenanceAlert {
  id: string;
  code: string;
  interventionId: string;
  interventionCode: string;
  interventionName: string;
  watershedId: string;
  watershedName: string;
  issue: string;
  issueTamil?: string;
  priority: AlertPriority;
  status: AlertStatus;
  confidenceScore: number;
  supportingEvidence: string;
  recommendedAction: string;
  responsibleOfficerName?: string;
  dueDate: string;
  createdAt: string;
  isDemonstration: boolean;
}

export type ComplaintCategory =
  | 'check_dam_damaged'
  | 'pond_filled_with_silt'
  | 'drainage_blocked'
  | 'water_not_reaching_farms'
  | 'plantation_failed'
  | 'encroachment'
  | 'illegal_dumping'
  | 'incomplete_work'
  | 'other';

export type ComplaintStatus =
  | 'submitted'
  | 'location_verified'
  | 'under_review'
  | 'officer_assigned'
  | 'inspection_completed'
  | 'action_approved'
  | 'work_in_progress'
  | 'resolution_evidence_submitted'
  | 'resolution_verification'
  | 'resolved';

export interface Complaint {
  id: string;
  trackingId: string;
  category: ComplaintCategory;
  description: string;
  village: string;
  watershedId?: string;
  coordinates: [number, number];
  photoUrl?: string;
  voiceNoteUrl?: string;
  voiceLanguage?: 'ta' | 'en';
  status: ComplaintStatus;
  assignedOfficerName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  isDemonstration: boolean;
}

export interface FieldAction {
  id: string;
  code: string;
  title: string;
  type: 'inspection' | 'desilting' | 'repair' | 'verification' | 'complaint_investigation';
  priority: AlertPriority;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'verified';
  interventionId?: string;
  interventionName?: string;
  complaintId?: string;
  watershedId: string;
  watershedName: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  isDemonstration: boolean;
}

export interface InterventionProposal {
  id: string;
  code: string;
  title: string;
  type: InterventionType;
  watershedId: string;
  watershedName: string;
  villageName: string;
  estimatedCostInr: number;
  potentialWaterLakhLitres: number;
  beneficiaryFarmersCount: number;
  beneficiaryAreaHectares: number;
  priorityScore: number; // 0 - 100
  rank: number;
  status: 'draft' | 'under_review' | 'ranked' | 'approved' | 'rejected';
  isDemonstration: boolean;
}

export interface BudgetScenario {
  id: string;
  name: string;
  totalBudgetInr: number;
  allocatedBudgetInr: number;
  selectedProjectsCount: number;
  expectedWaterYieldLakhLitres: number;
  totalBeneficiaries: number;
  status: 'active' | 'draft' | 'archived';
  isDemonstration: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'AUTH' | 'WATERSHED' | 'EVIDENCE' | 'COMPLAINT' | 'FIELD_ACTION' | 'ADMIN' | 'SYSTEM';
  details: string;
  ipAddress?: string;
  isDemonstration: boolean;
}

export interface ExternalServiceStatus {
  serviceName: string;
  displayName: string;
  status: 'connected' | 'not_configured' | 'mock_prohibited' | 'error';
  lastChecked: string;
  message: string;
  details?: string;
}

export type SpectralIndex = 'TRUE_COLOR' | 'NDVI' | 'NDWI';
export type SatelliteJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface SentinelScene {
  sceneId: string;
  collection: string;
  platform: string;
  observationDate: string;
  cloudCoverPercentage: number;
  tileId: string;
  spatialResolutionMeters: number;
  thumbnailUrl?: string;
  bbox: [number, number, number, number];
  geometry: any;
  sunElevationAngle?: number;
  instrument?: string;
}

export interface SatelliteAnalysisJob {
  id: string;
  status: SatelliteJobStatus;
  error?: string;
  watershedId?: string;
  areaName: string;
  areaGeojson: any;
  areaHectares: number;
  spectralIndex: SpectralIndex;
  beforeScene: SentinelScene;
  afterScene: SentinelScene;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  statistics?: {
    beforeMean: number;
    afterMean: number;
    deltaValue: number;
    deltaPercentage: number;
    spatialResolutionMeters: number;
    areaAnalyzedHectares: number;
    vegetationGainHectares?: number;
    waterSurfaceExpansionHectares?: number;
  };
  metadata: {
    satelliteSource: string;
    collection: string;
    observationDates: { before: string; after: string };
    cloudCover: { before: number; after: number };
    spatialResolution: string;
    indexFormula: string;
    areaOfInterest: string;
    processingDate: string;
    confidenceScore: number;
    confidenceRationale: string;
    limitations: string[];
    dataProvider: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface CopernicusServiceConfigStatus {
  configured: boolean;
  missingCredentials: string[];
  provider: string;
  stacEndpoint: string;
  processApiEndpoint: string;
  supportedCollections: string[];
  instructions: string;
}

export interface DashboardSummary {
  totalWatersheds: number;
  registeredStructures: number;
  functionalStructures: number;
  structuresNeedingAttention: number;
  criticalMaintenanceAlerts: number;
  openComplaints: number;
  pendingFieldActions: number;
  proposedProjects: number;
  estimatedWaterPotentialLakhLitres: number;
  estimatedBeneficiaries: number;
  lastDataFreshness: {
    fieldSync: string;
    satellitePass: string;
    weatherUpdate: string;
  };
}

export interface DrawnGeometry {
  id: string;
  name: string;
  geometryType: 'Point' | 'LineString' | 'Polygon';
  geojson: any;
  areaSquareMeters?: number;
  areaHectares?: number;
  areaSquareKm?: number;
  lengthMeters?: number;
  bufferDistanceMeters?: number;
  bufferGeojson?: any;
  watershedId?: string;
  category: 'proposed_structure' | 'custom_boundary' | 'drainage_reach' | 'survey_zone';
  structureType?: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface SpatialCalculationResult {
  isValid: boolean;
  validationError?: string;
  geometryType: 'Point' | 'LineString' | 'Polygon';
  coordinatesCount: number;
  areaSquareMeters?: number;
  areaHectares?: number;
  areaSquareKm?: number;
  lengthMeters?: number;
  lengthKm?: number;
  centroid?: [number, number];
  bbox?: [number, number, number, number];
  isInsideWatershed?: boolean;
  watershedId?: string;
}

