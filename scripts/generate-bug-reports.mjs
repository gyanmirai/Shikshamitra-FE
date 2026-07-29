import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const reportPath = path.join(root, 'test-results/playwright-results.json');
const outDir = path.join(root, 'test-results/bug-reports');

function classify(errorText) {
  if (/tenant|__tenant|cross-tenant/i.test(errorText)) return 'TENANT_ISOLATION_FAILURE';
  if (/401|authentication|accessToken|login/i.test(errorText)) return 'AUTHENTICATION_FAILURE';
  if (/403|permission|unauthori[sz]ed/i.test(errorText)) return 'PERMISSION_FAILURE';
  if (/ECONNREFUSED|ENOTFOUND|API is not ready|net::ERR/i.test(errorText))
    return 'ENVIRONMENT_FAILURE';
  if (/locator|strict mode violation|Timeout.*locator/i.test(errorText)) return 'LOCATOR_DRIFT';
  if (/500|Internal Server Error/i.test(errorText)) return 'PRODUCT_BUG';
  return 'UNKNOWN';
}

function severity(category) {
  if (category === 'TENANT_ISOLATION_FAILURE') return 'Critical';
  if (category === 'PERMISSION_FAILURE' || category === 'PRODUCT_BUG') return 'High';
  if (category === 'AUTHENTICATION_FAILURE' || category === 'ENVIRONMENT_FAILURE') return 'Medium';
  return 'Low';
}

function walkSuites(suite, failures = []) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      for (const result of test.results || []) {
        if (result.status === 'passed' || result.status === 'skipped') continue;
        const errors = (result.errors || [])
          .map((error) => error.message || error.stack || '')
          .join('\n');
        failures.push({
          title: [...(suite.titlePath || []), spec.title, test.title].filter(Boolean).join(' > '),
          file: spec.file,
          line: spec.line,
          status: result.status,
          retry: result.retry,
          projectName: test.projectName,
          errors,
        });
      }
    }
  }

  for (const child of suite.suites || []) {
    walkSuites({ ...child, titlePath: [...(suite.titlePath || []), child.title] }, failures);
  }

  return failures;
}

if (!existsSync(reportPath)) {
  console.log(`No Playwright JSON report found at ${reportPath}. Run Playwright first.`);
  process.exit(0);
}

const report = JSON.parse(readFileSync(reportPath, 'utf8'));
const failures = walkSuites({ ...report, titlePath: [] });
mkdirSync(outDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const created = new Set();

for (const failure of failures) {
  const category = classify(failure.errors);
  const fingerprint = crypto
    .createHash('sha1')
    .update(`${failure.title}|${category}|${failure.errors.slice(0, 500)}`)
    .digest('hex')
    .slice(0, 10);

  if (created.has(fingerprint)) continue;
  created.add(fingerprint);

  const bugId = `BUG-academic-${today}-${fingerprint}`;
  const payload = {
    bugId,
    status: 'New',
    severity: severity(category),
    priority: category === 'TENANT_ISOLATION_FAILURE' ? 'P0' : 'P1',
    module: 'Academic',
    submodule: 'Unclassified',
    failureClassification: category,
    testTitle: failure.title,
    file: failure.file,
    line: failure.line,
    browser: failure.projectName,
    retry: failure.retry,
    error: failure.errors,
  };

  const markdown = `# ${failure.title}

## Bug ID
${bugId}

## Status
New

## Severity
${payload.severity}

## Priority
${payload.priority}

## Module
Academic

## Submodule
Unclassified

## Requirement ID
Unknown

## Environment
${process.env.E2E_BASE_URL || 'local'}

## Browser and Viewport
${failure.projectName || 'unknown'}

## Failure Classification
${category}

## Actual Result
\`\`\`
${failure.errors || 'No error text captured.'}
\`\`\`

## Evidence
Review Playwright trace, screenshot, video, and HTML report artifacts for this failed test.
`;

  writeFileSync(path.join(outDir, `${bugId}.json`), JSON.stringify(payload, null, 2));
  writeFileSync(path.join(outDir, `${bugId}.md`), markdown);
}

console.log(`Generated ${created.size} Academic bug report(s) in ${outDir}`);
