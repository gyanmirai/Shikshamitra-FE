import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = process.cwd();
const enrollmentApiDirectory = 'src/redux/student/admissions-crm';
const enrollmentScreenDirectory = 'src/screens/student/enrollment';
const expectedApiModules = [
  'communication-exams-events-api.ts',
  'core-leads-api.ts',
  'final-admission-api.ts',
  'operations-governance-api.ts',
  'public-admissions-api.ts',
  'registration-documents-api.ts',
  'setup-playbooks-api.ts',
];
const expectedEndpointCount = 299;
const expectedEndpointInventoryHash =
  '12267d4ba6340f9be7cdbb64b221827f72da2470c14ebe33b42115cd470afdf9';

// Existing exceptions are frozen at the decomposition baseline. They can shrink, but cannot grow.
const oversizedComponentRatchet = {
  'src/screens/student/enrollment/admissions-crm/applicant-activation-operations.tsx': 822,
  'src/screens/student/enrollment/admissions-crm/applicant-household-identity-operations.tsx': 740,
  'src/screens/student/enrollment/admissions-crm/applicant-workspace-overview.tsx': 718,
  'src/screens/student/enrollment/admissions-crm/applicant-workspace-page.tsx': 802,
  'src/screens/student/enrollment/admissions-crm/direct-registration-dialog.tsx': 980,
  'src/screens/student/enrollment/admissions-crm/enrollment-workspace-context.tsx': 634,
  'src/screens/student/enrollment/admissions-crm/events-workspace.tsx': 999,
  'src/screens/student/enrollment/admissions-crm/overview-workspace.tsx': 857,
  'src/screens/student/enrollment/setting/admission-year-setup.tsx': 1667,
  'src/screens/student/enrollment/setting/admissions-document-configuration.tsx': 714,
  'src/screens/student/enrollment/setting/admissions-governance-configuration.tsx': 858,
  'src/screens/student/enrollment/setting/admissions-policy-pack-configuration.tsx': 669,
  'src/screens/student/enrollment/setting/communication-reminder-settings.tsx': 687,
};

const oversizedControllerRatchet = {
  'src/screens/student/enrollment/admissions-crm/applicant-final-admission-operations-controller.tsx': 379,
  'src/screens/student/enrollment/admissions-crm/applicant-registration-operations-controller.tsx': 406,
  'src/screens/student/enrollment/admissions-crm/exams-workspace-controller.tsx': 1179,
  'src/screens/student/enrollment/admissions-crm/operations-queue-workspace-controller.tsx': 933,
  'src/screens/student/enrollment/admissions-crm/pipeline-workspace-controller.tsx': 1645,
  'src/screens/student/enrollment/setting/admission-year-setup-controller.tsx': 795,
  'src/screens/student/enrollment/setting/admissions-crm-configuration-controller.tsx': 2652,
  'src/screens/student/enrollment/setting/admissions-playbook-configuration-controller.tsx': 620,
  'src/screens/student/enrollment/setting/admissions-registration-configuration-controller.tsx': 577,
};

const failures = [];
const toAbsolute = (relativePath) => path.join(repositoryRoot, relativePath);
const normalizePath = (value) => value.replaceAll('\\', '/');
const read = (relativePath) => fs.readFileSync(toAbsolute(relativePath), 'utf8');
const lineCount = (source) => source.replaceAll('\r\n', '\n').split('\n').length;

const walk = (relativeDirectory) =>
  fs.readdirSync(toAbsolute(relativeDirectory), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = normalizePath(path.join(relativeDirectory, entry.name));
    return entry.isDirectory() ? walk(relativePath) : [relativePath];
  });

const deletedMonolithPath = `${enrollmentApiDirectory}/${['admissions-crm', 'api.ts'].join('-')}`;
const deletedContractPath = `${enrollmentApiDirectory}/${[
  'admissions-crm',
  'api.contract.test.ts',
].join('-')}`;
for (const deletedPath of [deletedMonolithPath, deletedContractPath]) {
  if (fs.existsSync(toAbsolute(deletedPath))) {
    failures.push(`Deleted enrollment monolith returned: ${deletedPath}`);
  }
}

const apiDirectoryFiles = fs.readdirSync(toAbsolute(enrollmentApiDirectory)).sort();
const actualApiModules = apiDirectoryFiles.filter((file) => file.endsWith('-api.ts'));
if (JSON.stringify(actualApiModules) !== JSON.stringify(expectedApiModules)) {
  failures.push(
    `Enrollment API modules changed. Expected ${expectedApiModules.join(', ')}; received ${actualApiModules.join(', ')}.`
  );
}

if (apiDirectoryFiles.some((file) => /^index\.(?:ts|tsx)$/.test(file))) {
  failures.push('All-enrollment barrels are forbidden in the admissions CRM API directory.');
}

const endpointEntries = [];
const endpointOwners = new Map();
for (const apiModule of actualApiModules) {
  const relativePath = `${enrollmentApiDirectory}/${apiModule}`;
  const source = read(relativePath);
  const lines = lineCount(source);
  if (lines > 1400) {
    failures.push(
      `${relativePath} has ${lines} lines; focused endpoint modules are limited to 1,400.`
    );
  }

  for (const match of source.matchAll(/^\s{4}([A-Za-z0-9_]+): builder\.(?:query|mutation)/gm)) {
    const endpointName = match[1];
    const previousOwner = endpointOwners.get(endpointName);
    if (previousOwner) {
      failures.push(
        `Duplicate endpoint ${endpointName} is registered by ${previousOwner} and ${apiModule}.`
      );
    }
    endpointOwners.set(endpointName, apiModule);
    endpointEntries.push(`${apiModule}:${endpointName}`);
  }
}

endpointEntries.sort();
const endpointHash = crypto.createHash('sha256').update(endpointEntries.join('\n')).digest('hex');
if (endpointEntries.length !== expectedEndpointCount) {
  failures.push(
    `Expected ${expectedEndpointCount} enrollment endpoints, but found ${endpointEntries.length}.`
  );
}
if (endpointHash !== expectedEndpointInventoryHash) {
  failures.push(
    `Enrollment endpoint registration changed (inventory hash ${endpointHash}). Update the focused contract tests before accepting an intentional contract change.`
  );
}

const sourceFiles = walk('src').filter((file) => /\.(?:ts|tsx)$/.test(file));
const forbiddenImportPattern = new RegExp(
  `(?:from\\s+|import\\s*\\()['\"][^'\"]*${['admissions-crm', 'api'].join('-')}['\"]`
);
for (const sourceFile of sourceFiles) {
  if (forbiddenImportPattern.test(read(sourceFile))) {
    failures.push(`Legacy enrollment API import remains in ${sourceFile}.`);
  }
}

const enrollmentSources = walk(enrollmentScreenDirectory).filter((file) =>
  /\.(?:ts|tsx)$/.test(file)
);
for (const sourceFile of enrollmentSources) {
  const lines = lineCount(read(sourceFile));
  const componentLimit = oversizedComponentRatchet[sourceFile] ?? 600;
  if (
    sourceFile.endsWith('.tsx') &&
    !sourceFile.includes('-controller.') &&
    lines > componentLimit
  ) {
    failures.push(`${sourceFile} has ${lines} lines; its component limit is ${componentLimit}.`);
  }

  const fileName = path.basename(sourceFile);
  const isHookOrController = fileName.startsWith('use-') || fileName.includes('-controller.');
  if (isHookOrController) {
    const controllerLimit = oversizedControllerRatchet[sourceFile] ?? 300;
    if (lines > controllerLimit) {
      failures.push(
        `${sourceFile} has ${lines} lines; its hook/controller limit is ${controllerLimit}.`
      );
    }
  }
}

if (failures.length > 0) {
  console.error('Enrollment modularity guard failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Enrollment modularity guard passed: ${endpointEntries.length} endpoints across ${actualApiModules.length} focused API modules; component and controller ratchets are intact.`
);
