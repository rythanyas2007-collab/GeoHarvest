import { INITIAL_DEMO_STORE } from '../../server/db/seedData';
import { Watershed, Intervention, FieldEvidence } from '../types';

export const FALLBACK_WATERSHEDS: Watershed[] = INITIAL_DEMO_STORE.watersheds;
export const FALLBACK_INTERVENTIONS: Intervention[] = INITIAL_DEMO_STORE.interventions;
export const FALLBACK_EVIDENCE: FieldEvidence[] = INITIAL_DEMO_STORE.fieldEvidence;
export const FALLBACK_ALERTS = INITIAL_DEMO_STORE.maintenanceAlerts;
export const FALLBACK_COMPLAINTS = INITIAL_DEMO_STORE.complaints;
export const FALLBACK_ACTIONS = INITIAL_DEMO_STORE.fieldActions;
