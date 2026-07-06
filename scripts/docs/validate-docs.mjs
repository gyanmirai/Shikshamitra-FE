import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, 'docs');
const requiredFiles = ['README.md', 'routes.md', 'clients.md', 'workflows.md', 'testing.md'];
const requiredFrontmatter = [
  'module',
  'domain',
  'content_type',
  'status',
  'updated_on',
  'owner',
  'audience',
];
const validContentTypes = new Set([
  'Landing',
  'Reference',
  'Tutorial',
  'How-to',
  'Troubleshooting',
  'Conceptual',
]);
const allowedModuleDirs = new Set(['references']);
const requiredReadmeSections = [
  '## Read order',
  '## Source of truth',
  '## For agents',
  '## Validation',
];
const errors = [];

function parseArgs(argv) {
  const parsed = { allModules: false, moduleName: null, maxAgeDays: 180 };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--all-modules') {
      parsed.allModules = true;
      continue;
    }
    if (arg === '--module' || arg === '-m') {
      parsed.moduleName = argv[index + 1] ?? null;
      index += 1;
      continue;
    }
    if (arg === '--max-age-days') {
      parsed.maxAgeDays = Number.parseInt(argv[index + 1] ?? '', 10);
      index += 1;
      continue;
    }
    errors.push(`unknown argument '${arg}'`);
  }
  if (!Number.isInteger(parsed.maxAgeDays) || parsed.maxAgeDays < 1) {
    errors.push('max-age-days must be greater than zero');
  }
  return parsed;
}

function listMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listMarkdownFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function listDirectories(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (!entry.isDirectory()) {
      return [];
    }
    return [fullPath, ...listDirectories(fullPath)];
  });
}

function listRepoFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      return [];
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listRepoFiles(fullPath);
    }
    return entry.isFile() ? [relative(fullPath)] : [];
  });
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) {
    return null;
  }

  const block = match[1];
  const values = new Map();
  for (const line of block.split(/\r?\n/)) {
    const match = /^([a-z_]+):\s*(.+?)\s*$/.exec(line);
    if (match) {
      values.set(match[1], match[2]);
    }
  }
  return values;
}

function relative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, '/');
}

function stripLinkTarget(rawTarget) {
  const unwrapped = rawTarget.trim().replace(/^<(.+)>$/, '$1');
  return unwrapped.replace(/\s+["'][^"']+["']$/, '');
}

function validateUpdatedOn(file, value, maxAgeDays) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) {
    errors.push(`${relative(file)} :: updated_on must use yyyy-MM-dd`);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const updated = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(updated.getTime())) {
    errors.push(`${relative(file)} :: updated_on is not a valid date`);
    return;
  }

  const ageDays = Math.floor((today.getTime() - updated.getTime()) / 86400000);
  if (ageDays > maxAgeDays) {
    errors.push(`${relative(file)} :: updated_on older than ${maxAgeDays} days`);
  }
  if (ageDays < -1) {
    errors.push(`${relative(file)} :: updated_on is more than one day ahead`);
  }
}

function checkFrontmatter(moduleName, file, text, maxAgeDays) {
  const metadata = parseFrontmatter(text);
  if (!metadata) {
    errors.push(`${relative(file)} :: missing required frontmatter`);
    return;
  }

  for (const key of requiredFrontmatter) {
    if (!metadata.has(key)) {
      errors.push(`${relative(file)} :: missing frontmatter key '${key}'`);
    }
  }

  if (metadata.get('module') !== moduleName) {
    errors.push(`${relative(file)} :: frontmatter module must be '${moduleName}'`);
  }

  if (metadata.has('content_type') && !validContentTypes.has(metadata.get('content_type'))) {
    errors.push(`${relative(file)} :: invalid content_type '${metadata.get('content_type')}'`);
  }

  validateUpdatedOn(file, metadata.get('updated_on'), maxAgeDays);
}

function checkRootFrontmatter(file, text, maxAgeDays) {
  const metadata = parseFrontmatter(text);
  if (!metadata) {
    errors.push(`${relative(file)} :: missing required frontmatter`);
    return;
  }

  for (const key of requiredFrontmatter) {
    if (!metadata.has(key)) {
      errors.push(`${relative(file)} :: missing frontmatter key '${key}'`);
    }
  }

  if (metadata.has('content_type') && !validContentTypes.has(metadata.get('content_type'))) {
    errors.push(`${relative(file)} :: invalid content_type '${metadata.get('content_type')}'`);
  }

  validateUpdatedOn(file, metadata.get('updated_on'), maxAgeDays);
}

function checkReadmeHandoff(file, text) {
  if (path.basename(file) !== 'README.md') {
    return;
  }
  if (!/^TL;DR:/m.test(text)) {
    errors.push(`${relative(file)} :: missing README handoff section 'TL;DR'`);
  }
  for (const section of requiredReadmeSections) {
    if (!new RegExp(`^${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(text)) {
      errors.push(`${relative(file)} :: missing README handoff section '${section}'`);
    }
  }
}

function checkForbiddenText(file, text) {
  const checks = [
    [/docs[\\/]prd[\\/]hr/i, 'old docs/prd/hr reference'],
    [/docs[\\/]implementation[\\/]hr/i, 'old docs/implementation/hr reference'],
    [/README \(2\)/, 'duplicate README artifact reference'],
    [/_archive/, 'archive docs reference'],
    [/_generated/, 'generated docs reference'],
    [/docs[\\/]meta/, 'meta docs reference'],
    [/api-and-permissions-map\.md/, 'old HR API map file reference'],
    [/testing-and-acceptance\.md/, 'old testing file reference'],
    [/workflows-and-scenarios\.md/, 'old HR workflows file reference'],
    [/technical-spec\.md/, 'old HR technical spec file reference'],
    [/finance-charges-api-integration-plan\.md/, 'old Finance plan file reference'],
    [/[\u00e2\ufffd]/, 'mojibake character'],
    [/\?\?/, 'double-question placeholder or code operator'],
  ];

  for (const [pattern, label] of checks) {
    if (pattern.test(text)) {
      errors.push(`${relative(file)} :: ${label}`);
    }
  }
}

function checkLinks(file, text) {
  const linkPattern = /!?\[[^\]\n]*\]\(([^)\n]+)\)/g;
  for (const match of text.matchAll(linkPattern)) {
    const target = stripLinkTarget(match[1]);
    if (target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
      continue;
    }

    const withoutAnchor = target.split('#')[0];
    if (!withoutAnchor) {
      continue;
    }

    let decoded = withoutAnchor;
    try {
      decoded = decodeURIComponent(withoutAnchor);
    } catch {
      errors.push(`${relative(file)} :: invalid link encoding '${target}'`);
      continue;
    }

    const resolved = decoded.startsWith('/')
      ? path.join(repoRoot, decoded.slice(1))
      : path.resolve(path.dirname(file), decoded);

    if (!fs.existsSync(resolved)) {
      errors.push(`${relative(file)} :: broken link '${target}'`);
    }
  }
}

function globToRegex(pattern) {
  const escaped = pattern
    .replaceAll('\\', '/')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replaceAll('**', '\u0000')
    .replaceAll('*', '[^/]*')
    .replaceAll('\u0000', '.*');
  return new RegExp(`^${escaped}$`);
}

function checkSourcePath(file, lineNumber, rawPath, repoFiles) {
  const candidate = rawPath.trim().replace(/[.,;:]$/u, '');
  if (!/^(src|test|e2e|scripts|docs)\//.test(candidate)) {
    return;
  }
  if (/^docs\/modules\/<module>/.test(candidate)) {
    return;
  }
  if (/[{}]/.test(candidate)) {
    return;
  }
  if (/[\s<>|]/.test(candidate)) {
    return;
  }

  if (candidate.includes('*')) {
    const matcher = globToRegex(candidate);
    if (!repoFiles.some((repoFile) => matcher.test(repoFile))) {
      errors.push(`${relative(file)}:${lineNumber} -> ${candidate}`);
    }
    return;
  }

  if (!fs.existsSync(path.join(repoRoot, candidate))) {
    errors.push(`${relative(file)}:${lineNumber} -> ${candidate}`);
  }
}

function checkSourcePaths(file, text, repoFiles) {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      checkSourcePath(file, index + 1, match[1], repoFiles);
    }
  });
}

function validateLegacyDirectories() {
  if (!fs.existsSync(docsRoot)) {
    return;
  }
  for (const dir of listDirectories(docsRoot)) {
    const name = path.basename(dir);
    if (name === '_archive' || name === '_generated') {
      errors.push(`${relative(dir)} :: legacy docs directory is not allowed`);
    }
  }
}

function validateModule(moduleName, maxAgeDays, repoFiles) {
  if (!/^[a-z0-9-]+$/.test(moduleName)) {
    errors.push(`docs/${moduleName} :: invalid module name`);
    return;
  }

  const moduleRoot = path.join(docsRoot, moduleName);
  if (!fs.existsSync(moduleRoot)) {
    errors.push(`docs/${moduleName} :: directory is missing`);
    return;
  }

  for (const fileName of requiredFiles) {
    const filePath = path.join(moduleRoot, fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`docs/${moduleName}/${fileName} :: required file is missing`);
    }
  }

  for (const entry of fs.readdirSync(moduleRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !allowedModuleDirs.has(entry.name)) {
      errors.push(`docs/${moduleName}/${entry.name} :: unexpected active directory`);
    }
    if (entry.isFile() && entry.name.endsWith('.md') && !requiredFiles.includes(entry.name)) {
      errors.push(`docs/${moduleName}/${entry.name} :: unexpected active markdown file`);
    }
  }

  for (const file of listMarkdownFiles(moduleRoot)) {
    const text = fs.readFileSync(file, 'utf8');
    checkFrontmatter(moduleName, file, text, maxAgeDays);
    checkReadmeHandoff(file, text);
    checkForbiddenText(file, text);
    checkLinks(file, text);
    checkSourcePaths(file, text, repoFiles);
  }

  if (errors.length === 0) {
    console.log(`Documentation validation passed for module '${moduleName}'.`);
  }
}

function validateRootDocs(maxAgeDays, repoFiles) {
  const allowedRootFiles = new Set(['README.md', 'module-docs-standard.md']);
  const rootMarkdownFiles = fs.readdirSync(docsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(docsRoot, entry.name));

  for (const file of rootMarkdownFiles) {
    if (!allowedRootFiles.has(path.basename(file))) {
      errors.push(`${relative(file)} :: unexpected root docs markdown file`);
    }

    const text = fs.readFileSync(file, 'utf8');
    checkRootFrontmatter(file, text, maxAgeDays);
    checkForbiddenText(file, text);
    checkLinks(file, text);
    checkSourcePaths(file, text, repoFiles);
  }
}

if (!fs.existsSync(docsRoot)) {
  errors.push('docs :: directory is missing');
} else {
  const { allModules, moduleName, maxAgeDays } = parseArgs(process.argv.slice(2));
  const repoFiles = listRepoFiles(repoRoot);
  validateLegacyDirectories();
  validateRootDocs(maxAgeDays, repoFiles);

  if (allModules && moduleName) {
    errors.push('use either --module <module> or --all-modules, not both');
  } else if (moduleName) {
    validateModule(moduleName, maxAgeDays, repoFiles);
  } else {
    const moduleDirs = fs.readdirSync(docsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const moduleDir of moduleDirs) {
      validateModule(moduleDir, maxAgeDays, repoFiles);
    }

    if (errors.length === 0) {
      console.log('Documentation validation passed for all frontend modules.');
    }
  }
}

if (errors.length > 0) {
  console.error(`Frontend docs validation failed with ${errors.length} issue(s).`);
  for (const error of [...new Set(errors)].sort()) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
