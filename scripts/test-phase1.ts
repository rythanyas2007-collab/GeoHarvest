import { JsonFileGeoHarvestRepository } from '../server/db/repository';
import { generateToken } from '../server/middleware/auth';
import { UserRole } from '../src/types/index';
import path from 'path';
import fs from 'fs';

async function runPhase1AutomatedTests() {
  console.log('====================================================');
  console.log('   GEOHarvest Phase 1: Automated Verification Suite  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failed++;
    }
  }

  // 1. Database Initialization & Repository Layer Test
  console.log('--- 1. Testing Database & Repository Abstraction ---');
  const testDbPath = path.resolve(process.cwd(), 'data', 'test_store.json');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const repo = new JsonFileGeoHarvestRepository(testDbPath);
  await repo.init();

  assert(fs.existsSync(testDbPath), 'Database file initialized and persisted to disk');

  // 2. Demonstration Data Validation
  console.log('\n--- 2. Validating Required Demonstration Dataset ---');
  const watersheds = await repo.getWatersheds();
  assert(watersheds.length === 2, 'Exactly 2 demonstration watersheds seeded', `Found ${watersheds.length}`);
  assert(watersheds.every(w => w.isDemonstration), 'All watersheds labelled as Demonstration Data');

  const interventions = await repo.getInterventions();
  assert(interventions.length === 8, 'Exactly 8 interventions seeded', `Found ${interventions.length}`);
  assert(interventions.every(i => i.isDemonstration), 'All interventions marked as Demonstration Data');

  const evidence = await repo.getEvidence();
  assert(evidence.length === 8, 'Exactly 8 field-evidence records seeded', `Found ${evidence.length}`);

  const alerts = await repo.getAlerts();
  assert(alerts.length === 3, 'Exactly 3 maintenance alerts seeded', `Found ${alerts.length}`);
  assert(alerts.some(a => a.priority === 'critical'), 'Critical alert present (CKD-TVM-06 silt & breach risk)');

  const complaints = await repo.getComplaints();
  assert(complaints.length === 4, 'Exactly 4 community complaints seeded', `Found ${complaints.length}`);

  const actions = await repo.getFieldActions();
  assert(actions.length === 4, 'Exactly 4 field actions seeded', `Found ${actions.length}`);

  const proposals = await repo.getProposals();
  assert(proposals.length === 3, 'Exactly 3 intervention proposals seeded', `Found ${proposals.length}`);

  const scenarios = await repo.getBudgetScenarios();
  assert(scenarios.length === 2, 'Exactly 2 budget scenarios seeded', `Found ${scenarios.length}`);

  // 3. User Roles and Authentication Verification
  console.log('\n--- 3. Validating All 8 User Roles & Authentication ---');
  const users = await repo.getUsers();
  const requiredRoles: UserRole[] = [
    'super_admin',
    'government_admin',
    'district_admin',
    'gis_analyst',
    'field_officer',
    'verification_officer',
    'community_user',
    'public_viewer'
  ];

  for (const r of requiredRoles) {
    const u = users.find(user => user.role === r);
    assert(Boolean(u), `Role '${r}' registered with official designation: ${u?.designation}`);
  }

  const superAdmin = await repo.getUserByEmail('superadmin@geoharvest.gov.in');
  assert(Boolean(superAdmin && superAdmin.role === 'super_admin'), 'Super Admin user retrieved by email');

  const testToken = generateToken(superAdmin!.id);
  assert(Boolean(testToken && testToken.startsWith('gh_')), 'Secure authentication token generated for Super Admin');

  // 4. Persistence and State Mutation Test
  console.log('\n--- 4. Testing Persistence & Atomic Write Guarantees ---');
  const testAlert = alerts[0];
  const updatedAlert = await repo.updateAlert(testAlert.id, {
    status: 'in_progress'
  });
  assert(updatedAlert?.status === 'in_progress', 'Memory store updated successfully');

  // Reload new repository instance from disk to verify true persistence
  const reloadedRepo = new JsonFileGeoHarvestRepository(testDbPath);
  await reloadedRepo.init();
  const reloadedAlert = await reloadedRepo.getAlertById(testAlert.id);
  assert(reloadedAlert?.status === 'in_progress', 'State persisted across repository instances and disk reloads');

  // 5. Audit Logging Verification
  console.log('\n--- 5. Validating Audit Logging & Tamper-Resistant Journal ---');
  const initialLogCount = (await reloadedRepo.getAuditLogs()).length;
  await reloadedRepo.logAction({
    userId: superAdmin!.id,
    userName: superAdmin!.name,
    userRole: superAdmin!.role,
    action: 'TEST_VERIFICATION_PASS',
    category: 'SYSTEM',
    details: 'Automated test suite ran verification check on audit system.',
    ipAddress: '127.0.0.1',
    isDemonstration: true
  });

  const updatedLogs = await reloadedRepo.getAuditLogs();
  assert(updatedLogs.length === initialLogCount + 1, 'Audit log count incremented on recorded action');
  assert(updatedLogs[0].action === 'TEST_VERIFICATION_PASS', 'Latest audit log entry retrieved correctly');
  assert(Boolean(updatedLogs[0].timestamp), 'Audit log timestamp automatically generated');

  // 6. Metric Calculations Verification
  console.log('\n--- 6. Validating Dashboard Derived Metrics ---');
  const totalWs = watersheds.length;
  const totalStructures = interventions.length;
  const functionalStructures = interventions.filter(i => i.status === 'operational').length;
  const criticalAlerts = (await reloadedRepo.getAlerts('critical')).length;

  assert(totalWs === 2, 'Total watersheds metric matches 2');
  assert(totalStructures === 8, 'Total registered structures metric matches 8');
  assert(functionalStructures === 5, 'Functional structures metric derived correctly', `Count: ${functionalStructures}`);
  assert(criticalAlerts === 1, 'Critical alerts metric derived correctly', `Count: ${criticalAlerts}`);

  // 7. Cleanup test store
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  console.log('\n====================================================');
  console.log(`   Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1AutomatedTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
