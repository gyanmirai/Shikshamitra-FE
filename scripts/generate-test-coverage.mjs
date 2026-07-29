import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'tests/catalog/academic.yaml');
const outDir = path.join(root, 'test-results/coverage');

function parseScenarioBlocks(source) {
  return source
    .split(/\n\s+- id: /)
    .slice(1)
    .map((block) => `id: ${block}`);
}

function scalar(block, key) {
  const match = block.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function inlineList(block, key) {
  const value = scalar(block, key);
  if (!value.startsWith('[') || !value.endsWith(']')) return [];
  return value
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCatalog() {
  const source = readFileSync(catalogPath, 'utf8');
  return parseScenarioBlocks(source).map((block) => ({
    id: scalar(block, 'id'),
    module: scalar(block, 'module'),
    submodule: scalar(block, 'submodule'),
    risk: scalar(block, 'risk'),
    status: scalar(block, 'status'),
    automated: scalar(block, 'automated') === 'true',
    types: inlineList(block, 'type'),
    roles: inlineList(block, 'roles'),
  }));
}

function percent(numerator, denominator) {
  return denominator === 0 ? 0 : Number(((numerator / denominator) * 100).toFixed(1));
}

function summarize(scenarios) {
  const bySubmodule = new Map();

  for (const scenario of scenarios) {
    const key = `${scenario.module}::${scenario.submodule}`;
    const current = bySubmodule.get(key) || {
      module: scenario.module,
      submodule: scenario.submodule,
      planned: 0,
      automated: 0,
      blocked: 0,
      critical: 0,
      automatedCritical: 0,
    };

    current.planned += 1;
    if (scenario.automated) current.automated += 1;
    if (scenario.status.startsWith('blocked')) current.blocked += 1;
    if (scenario.risk === 'critical') {
      current.critical += 1;
      if (scenario.automated) current.automatedCritical += 1;
    }

    bySubmodule.set(key, current);
  }

  const rows = [...bySubmodule.values()].map((row) => ({
    ...row,
    notAutomated: row.planned - row.automated,
    automationCoverage: percent(row.automated, row.planned),
    criticalCoverage: percent(row.automatedCritical, row.critical),
  }));

  const totals = rows.reduce(
    (acc, row) => ({
      planned: acc.planned + row.planned,
      automated: acc.automated + row.automated,
      blocked: acc.blocked + row.blocked,
      critical: acc.critical + row.critical,
      automatedCritical: acc.automatedCritical + row.automatedCritical,
    }),
    { planned: 0, automated: 0, blocked: 0, critical: 0, automatedCritical: 0 }
  );

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      ...totals,
      notAutomated: totals.planned - totals.automated,
      automationCoverage: percent(totals.automated, totals.planned),
      criticalCoverage: percent(totals.automatedCritical, totals.critical),
    },
    rows,
  };
}

function csv(summary) {
  const header =
    'Module,Submodule,Planned,Automated,Blocked,Not Automated,Automation Coverage,Critical Coverage';
  const rows = summary.rows.map((row) =>
    [
      row.module,
      row.submodule,
      row.planned,
      row.automated,
      row.blocked,
      row.notAutomated,
      `${row.automationCoverage}%`,
      `${row.criticalCoverage}%`,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',')
  );
  return [header, ...rows].join('\n');
}

function markdown(summary) {
  const lines = [
    '# Academic Coverage Summary',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    `Planned: ${summary.totals.planned}`,
    `Automated: ${summary.totals.automated}`,
    `Blocked: ${summary.totals.blocked}`,
    `Automation Coverage: ${summary.totals.automationCoverage}%`,
    `Critical Coverage: ${summary.totals.criticalCoverage}%`,
    '',
    '| Module | Submodule | Planned | Automated | Blocked | Not Automated | Coverage | Critical |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const row of summary.rows) {
    lines.push(
      `| ${row.module} | ${row.submodule} | ${row.planned} | ${row.automated} | ${row.blocked} | ${row.notAutomated} | ${row.automationCoverage}% | ${row.criticalCoverage}% |`
    );
  }

  return `${lines.join('\n')}\n`;
}

function html(summary) {
  const rows = summary.rows
    .map(
      (row) =>
        `<tr><td>${row.module}</td><td>${row.submodule}</td><td>${row.planned}</td><td>${row.automated}</td><td>${row.blocked}</td><td>${row.notAutomated}</td><td>${row.automationCoverage}%</td><td>${row.criticalCoverage}%</td></tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Academic Coverage</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #17202a; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d5d8dc; padding: 8px; text-align: left; }
    th { background: #f4f6f7; }
    .summary { display: flex; gap: 12px; flex-wrap: wrap; margin: 16px 0; }
    .metric { border: 1px solid #d5d8dc; padding: 10px 12px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Academic Coverage</h1>
  <p>Generated: ${summary.generatedAt}</p>
  <div class="summary">
    <div class="metric">Planned: ${summary.totals.planned}</div>
    <div class="metric">Automated: ${summary.totals.automated}</div>
    <div class="metric">Blocked: ${summary.totals.blocked}</div>
    <div class="metric">Automation Coverage: ${summary.totals.automationCoverage}%</div>
    <div class="metric">Critical Coverage: ${summary.totals.criticalCoverage}%</div>
  </div>
  <table>
    <thead><tr><th>Module</th><th>Submodule</th><th>Planned</th><th>Automated</th><th>Blocked</th><th>Not Automated</th><th>Coverage</th><th>Critical</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

const summary = summarize(parseCatalog());
mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, 'coverage-summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(path.join(outDir, 'coverage-summary.md'), markdown(summary));
writeFileSync(path.join(outDir, 'coverage-details.csv'), csv(summary));
writeFileSync(path.join(outDir, 'index.html'), html(summary));
console.log(`Academic coverage generated at ${outDir}`);
