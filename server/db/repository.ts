import fs from 'fs';
import path from 'path';
import {
  DatabaseStore,
  IGeoHarvestRepository
} from './schema';
import { INITIAL_DEMO_STORE } from './seedData';
import {
  User,
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

export class JsonFileGeoHarvestRepository implements IGeoHarvestRepository {
  private dataFilePath: string;
  private memoryStore: DatabaseStore | null = null;
  private isInitializing: boolean = false;

  constructor(customPath?: string) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback or exists
      }
    }
    this.dataFilePath = customPath || path.join(dataDir, 'geoharvest_store.json');
  }

  public async init(): Promise<void> {
    if (this.memoryStore) return;
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = await fs.promises.readFile(this.dataFilePath, 'utf8');
        this.memoryStore = JSON.parse(raw) as DatabaseStore;
        if (!this.memoryStore.satelliteJobs) {
          this.memoryStore.satelliteJobs = [];
        }
        if (!this.memoryStore.drawnGeometries) {
          this.memoryStore.drawnGeometries = [];
        }
      } else {
        // Seed initial data
        this.memoryStore = JSON.parse(JSON.stringify(INITIAL_DEMO_STORE));
        if (!this.memoryStore.satelliteJobs) {
          this.memoryStore.satelliteJobs = [];
        }
        if (!this.memoryStore.drawnGeometries) {
          this.memoryStore.drawnGeometries = [];
        }
        await this.persist();
      }
    } catch (err) {
      console.error('Failed to read data file, re-initializing with seed data:', err);
      this.memoryStore = JSON.parse(JSON.stringify(INITIAL_DEMO_STORE));
      if (!this.memoryStore.satelliteJobs) {
        this.memoryStore.satelliteJobs = [];
      }
      if (!this.memoryStore.drawnGeometries) {
        this.memoryStore.drawnGeometries = [];
      }
      await this.persist();
    } finally {
      this.isInitializing = false;
    }
  }

  public async resetToDemo(): Promise<void> {
    this.memoryStore = JSON.parse(JSON.stringify(INITIAL_DEMO_STORE));
    this.memoryStore!.lastUpdated = new Date().toISOString();
    await this.persist();
  }

  private async getStore(): Promise<DatabaseStore> {
    if (!this.memoryStore) {
      await this.init();
    }
    return this.memoryStore!;
  }

  private async persist(): Promise<void> {
    if (!this.memoryStore) return;
    this.memoryStore.lastUpdated = new Date().toISOString();
    const tempPath = `${this.dataFilePath}.${Date.now()}.tmp`;
    const serialized = JSON.stringify(this.memoryStore, null, 2);
    try {
      await fs.promises.writeFile(tempPath, serialized, 'utf8');
      await fs.promises.rename(tempPath, this.dataFilePath);
    } catch (error) {
      console.error('Failed to write database snapshot atomically:', error);
      // Clean up temp file if exists
      if (fs.existsSync(tempPath)) {
        try {
          await fs.promises.unlink(tempPath);
        } catch {}
      }
    }
  }

  // Users & Auth
  public async getUsers(): Promise<User[]> {
    const store = await this.getStore();
    return store.users;
  }

  public async getUserById(id: string): Promise<User | null> {
    const store = await this.getStore();
    return store.users.find(u => u.id === id) || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const store = await this.getStore();
    return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // Watersheds
  public async getWatersheds(): Promise<Watershed[]> {
    const store = await this.getStore();
    return store.watersheds;
  }

  public async getWatershedById(id: string): Promise<Watershed | null> {
    const store = await this.getStore();
    return store.watersheds.find(w => w.id === id) || null;
  }

  // Interventions
  public async getInterventions(watershedId?: string): Promise<Intervention[]> {
    const store = await this.getStore();
    if (watershedId) {
      return store.interventions.filter(i => i.watershedId === watershedId);
    }
    return store.interventions;
  }

  public async getInterventionById(id: string): Promise<Intervention | null> {
    const store = await this.getStore();
    return store.interventions.find(i => i.id === id) || null;
  }

  public async createIntervention(data: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>): Promise<Intervention> {
    const store = await this.getStore();
    const newIntervention: Intervention = {
      ...data,
      id: `int-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.interventions.unshift(newIntervention);
    await this.persist();
    return newIntervention;
  }

  public async updateIntervention(id: string, updates: Partial<Intervention>): Promise<Intervention | null> {
    const store = await this.getStore();
    const index = store.interventions.findIndex(i => i.id === id);
    if (index === -1) return null;
    store.interventions[index] = {
      ...store.interventions[index],
      ...updates
    };
    await this.persist();
    return store.interventions[index];
  }

  // Field Evidence
  public async getEvidence(watershedId?: string): Promise<FieldEvidence[]> {
    const store = await this.getStore();
    if (watershedId) {
      return store.fieldEvidence.filter(e => e.watershedId === watershedId);
    }
    return store.fieldEvidence;
  }

  public async getEvidenceById(id: string): Promise<FieldEvidence | null> {
    const store = await this.getStore();
    return store.fieldEvidence.find(e => e.id === id) || null;
  }

  public async createEvidence(evidence: Omit<FieldEvidence, 'id'>): Promise<FieldEvidence> {
    const store = await this.getStore();
    const newEvidence: FieldEvidence = {
      ...evidence,
      id: `ev-${Date.now().toString(36)}`
    };
    store.fieldEvidence.unshift(newEvidence);
    await this.persist();
    return newEvidence;
  }

  // Maintenance Alerts
  public async getAlerts(priority?: string): Promise<MaintenanceAlert[]> {
    const store = await this.getStore();
    if (priority) {
      return store.maintenanceAlerts.filter(a => a.priority === priority);
    }
    return store.maintenanceAlerts;
  }

  public async getAlertById(id: string): Promise<MaintenanceAlert | null> {
    const store = await this.getStore();
    return store.maintenanceAlerts.find(a => a.id === id) || null;
  }

  public async updateAlert(id: string, updates: Partial<MaintenanceAlert>): Promise<MaintenanceAlert | null> {
    const store = await this.getStore();
    const index = store.maintenanceAlerts.findIndex(a => a.id === id);
    if (index === -1) return null;
    store.maintenanceAlerts[index] = {
      ...store.maintenanceAlerts[index],
      ...updates
    };
    await this.persist();
    return store.maintenanceAlerts[index];
  }

  // Complaints
  public async getComplaints(status?: string): Promise<Complaint[]> {
    const store = await this.getStore();
    if (status) {
      return store.complaints.filter(c => c.status === status);
    }
    return store.complaints;
  }

  public async getComplaintById(id: string): Promise<Complaint | null> {
    const store = await this.getStore();
    return store.complaints.find(c => c.id === id) || null;
  }

  public async createComplaint(data: Omit<Complaint, 'id' | 'trackingId' | 'createdAt' | 'updatedAt'>): Promise<Complaint> {
    const store = await this.getStore();
    const counter = store.complaints.length + 1;
    const trackingId = `CMP-2026-${counter.toString().padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      ...data,
      id: `cmp-${Date.now().toString(36)}`,
      trackingId,
      createdAt: now,
      updatedAt: now
    };
    store.complaints.unshift(newComplaint);
    await this.persist();
    return newComplaint;
  }

  public async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    const store = await this.getStore();
    const index = store.complaints.findIndex(c => c.id === id);
    if (index === -1) return null;
    store.complaints[index] = {
      ...store.complaints[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.persist();
    return store.complaints[index];
  }

  // Field Actions
  public async getFieldActions(officerId?: string): Promise<FieldAction[]> {
    const store = await this.getStore();
    if (officerId) {
      return store.fieldActions.filter(a => a.assignedOfficerId === officerId);
    }
    return store.fieldActions;
  }

  public async createFieldAction(action: Omit<FieldAction, 'id' | 'code' | 'createdAt'>): Promise<FieldAction> {
    const store = await this.getStore();
    const counter = store.fieldActions.length + 101;
    const code = `ACT-2026-${counter}`;
    const newAction: FieldAction = {
      ...action,
      id: `act-${Date.now().toString(36)}`,
      code,
      createdAt: new Date().toISOString()
    };
    store.fieldActions.unshift(newAction);
    await this.persist();
    return newAction;
  }

  public async updateFieldAction(id: string, updates: Partial<FieldAction>): Promise<FieldAction | null> {
    const store = await this.getStore();
    const index = store.fieldActions.findIndex(a => a.id === id);
    if (index === -1) return null;
    store.fieldActions[index] = {
      ...store.fieldActions[index],
      ...updates
    };
    await this.persist();
    return store.fieldActions[index];
  }

  // Proposals & Budgets
  public async getProposals(): Promise<InterventionProposal[]> {
    const store = await this.getStore();
    return store.proposals;
  }

  public async getBudgetScenarios(): Promise<BudgetScenario[]> {
    const store = await this.getStore();
    return store.budgetScenarios;
  }

  // External Services
  public async getExternalServices(): Promise<ExternalServiceStatus[]> {
    const store = await this.getStore();
    return store.externalServices;
  }

  // Audit Logs
  public async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    const store = await this.getStore();
    return store.auditLogs.slice(0, limit);
  }

  public async logAction(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const store = await this.getStore();
    const entry: AuditLog = {
      ...logData,
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    store.auditLogs.unshift(entry);
    // Keep max 500 audit records in local persistent store
    if (store.auditLogs.length > 500) {
      store.auditLogs = store.auditLogs.slice(0, 500);
    }
    await this.persist();
    return entry;
  }

  // Satellite Analysis Jobs
  public async getSatelliteJobs(watershedId?: string): Promise<SatelliteAnalysisJob[]> {
    const store = await this.getStore();
    const jobs = store.satelliteJobs || [];
    if (watershedId) {
      return jobs.filter(j => j.watershedId === watershedId);
    }
    return jobs;
  }

  public async getSatelliteJobById(id: string): Promise<SatelliteAnalysisJob | null> {
    const store = await this.getStore();
    const jobs = store.satelliteJobs || [];
    return jobs.find(j => j.id === id) || null;
  }

  public async createSatelliteJob(
    jobData: Omit<SatelliteAnalysisJob, 'id' | 'createdAt'>
  ): Promise<SatelliteAnalysisJob> {
    const store = await this.getStore();
    if (!store.satelliteJobs) {
      store.satelliteJobs = [];
    }
    const newJob: SatelliteAnalysisJob = {
      ...jobData,
      id: `sat-job-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    store.satelliteJobs.unshift(newJob);
    await this.persist();
    return newJob;
  }

  public async updateSatelliteJob(
    id: string,
    updates: Partial<SatelliteAnalysisJob>
  ): Promise<SatelliteAnalysisJob | null> {
    const store = await this.getStore();
    if (!store.satelliteJobs) {
      store.satelliteJobs = [];
    }
    const index = store.satelliteJobs.findIndex(j => j.id === id);
    if (index === -1) return null;

    store.satelliteJobs[index] = {
      ...store.satelliteJobs[index],
      ...updates
    };
    await this.persist();
    return store.satelliteJobs[index];
  }

  // Drawn Geometries (GIS Vector Store)
  public async getDrawnGeometries(watershedId?: string): Promise<DrawnGeometry[]> {
    const store = await this.getStore();
    if (!store.drawnGeometries) store.drawnGeometries = [];
    if (watershedId) {
      return store.drawnGeometries.filter(g => g.watershedId === watershedId);
    }
    return store.drawnGeometries;
  }

  public async getDrawnGeometryById(id: string): Promise<DrawnGeometry | null> {
    const store = await this.getStore();
    if (!store.drawnGeometries) store.drawnGeometries = [];
    return store.drawnGeometries.find(g => g.id === id) || null;
  }

  public async createDrawnGeometry(data: Omit<DrawnGeometry, 'id' | 'createdAt'>): Promise<DrawnGeometry> {
    const store = await this.getStore();
    if (!store.drawnGeometries) store.drawnGeometries = [];
    const newGeometry: DrawnGeometry = {
      ...data,
      id: `geom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    store.drawnGeometries.unshift(newGeometry);
    await this.persist();
    return newGeometry;
  }

  public async deleteDrawnGeometry(id: string): Promise<boolean> {
    const store = await this.getStore();
    if (!store.drawnGeometries) return false;
    const initialLen = store.drawnGeometries.length;
    store.drawnGeometries = store.drawnGeometries.filter(g => g.id !== id);
    if (store.drawnGeometries.length !== initialLen) {
      await this.persist();
      return true;
    }
    return false;
  }

  public async exportStore(): Promise<DatabaseStore> {
    return this.getStore();
  }
}

// Global repository singleton
export const dbRepository: IGeoHarvestRepository = new JsonFileGeoHarvestRepository();
