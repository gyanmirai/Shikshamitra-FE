#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flagSet = new Set(args.filter((arg) => arg.startsWith('--') && !arg.includes('=')));

const getArgValue = (name, fallback) => {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
};

const dryRun = flagSet.has('--dry-run');
const preflightOnly = flagSet.has('--preflight-only');
const allowRemoteMutation = flagSet.has('--allow-stage-mutation');
const useDefaultCredentials = flagSet.has('--use-default-credentials');
const project = getArgValue('--project', 'chromium-guest');
const reporter = getArgValue('--reporter', 'list');
const specPath = [
  'e2e',
  'student',
  preflightOnly ? 'admissions-crm-preflight.guest.spec.ts' : 'admissions-crm-flow.guest.spec.ts',
].join('/');

const readDotEnv = () => {
  const values = {};

  for (const fileName of ['.env.local', '.env']) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const separator = line.indexOf('=');
      if (separator <= 0) continue;

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      values[key] ??= value;
    }
  }

  return values;
};

const dotEnv = readDotEnv();

const readEnv = (key) => process.env[key] || dotEnv[key] || '';
const resolvedApiUrl = getArgValue(
  '--api-url',
  readEnv('E2E_API_URL') || readEnv('NEXT_PUBLIC_API_URL')
);
const resolvedBaseUrl = getArgValue(
  '--base-url',
  readEnv('E2E_BASE_URL') || 'http://localhost:3000'
);

const normalizeUrl = (url, label) => {
  if (!url) {
    throw new Error(`Set ${label} or provide the matching command argument.`);
  }

  try {
    return new URL(url).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${label} must be a valid URL. Received: ${url}`);
  }
};

const apiUrl = normalizeUrl(resolvedApiUrl, 'E2E_API_URL or NEXT_PUBLIC_API_URL');
const baseUrl = normalizeUrl(resolvedBaseUrl, 'E2E_BASE_URL');
const apiHost = new URL(apiUrl).host.toLowerCase();
const remoteGyanmiraiHost = apiHost === 'gyanmirai.in' || apiHost.endsWith('.gyanmirai.in');
const isLocalHttpsApi = (() => {
  const parsed = new URL(apiUrl);
  const hostName = parsed.hostname.toLowerCase();

  return (
    parsed.protocol === 'https:' &&
    (hostName === 'localhost' || hostName === '127.0.0.1' || hostName === '::1')
  );
})();

if (isLocalHttpsApi && !process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const defaults = {
  E2E_TENANT: 'DDVS',
  E2E_PRINCIPAL_EMAIL: 'principal-gseb@ddvs.com',
  E2E_PASSWORD: 'Temp@123',
  E2E_STUDENT_CRM_DENIED_EMAIL: 'student-crm-denied@ddvs.com',
  E2E_STUDENT_CRM_RECEPTIONIST_EMAIL: 'admissions-reception@ddvs.com',
  E2E_STUDENT_CRM_COUNSELOR_EMAIL: 'admissions-counselor@ddvs.com',
  E2E_STUDENT_CRM_APPROVER_EMAIL: 'admissions-approver@ddvs.com',
};

const resolvedCredentials = {
  E2E_TENANT: useDefaultCredentials ? '' : readEnv('E2E_TENANT'),
  E2E_PRINCIPAL_EMAIL: useDefaultCredentials ? '' : readEnv('E2E_PRINCIPAL_EMAIL'),
  E2E_PASSWORD: useDefaultCredentials ? '' : readEnv('E2E_PASSWORD'),
};

const missingCredentials = Object.entries(resolvedCredentials)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const describeCredentialState = () =>
  Object.entries(resolvedCredentials)
    .map(([key, value]) => {
      if (value) return `${key}=configured`;
      if (useDefaultCredentials) return `${key}=${defaults[key]}`;
      return `${key}=missing`;
    })
    .join(', ');

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

if (!preflightOnly && !dryRun && remoteGyanmiraiHost && !allowRemoteMutation) {
  fail(
    `Refusing to run against ${apiHost} because this CRM spec creates inquiry leads, registration forms, exam schedules, results, and eligibility records. Pass --allow-stage-mutation only for an approved disposable seeded tenant.`
  );
}

if (!dryRun && missingCredentials.length && !useDefaultCredentials) {
  fail(
    `Missing ${missingCredentials.join(', ')}. Set explicit E2E credentials, or pass --use-default-credentials only for a seeded local/DDVS environment.`
  );
}

const childEnv = {
  ...process.env,
  E2E_STUDENT_CRM: preflightOnly ? process.env.E2E_STUDENT_CRM || '0' : '1',
  E2E_STUDENT_CRM_PREFLIGHT: preflightOnly ? '1' : process.env.E2E_STUDENT_CRM_PREFLIGHT,
  E2E_API_URL: apiUrl,
  NEXT_PUBLIC_API_URL: apiUrl,
  E2E_BASE_URL: baseUrl,
  E2E_TENANT: resolvedCredentials.E2E_TENANT || defaults.E2E_TENANT,
  E2E_PRINCIPAL_EMAIL: resolvedCredentials.E2E_PRINCIPAL_EMAIL || defaults.E2E_PRINCIPAL_EMAIL,
  E2E_PASSWORD: resolvedCredentials.E2E_PASSWORD || defaults.E2E_PASSWORD,
  E2E_STUDENT_CRM_DENIED_EMAIL:
    readEnv('E2E_STUDENT_CRM_DENIED_EMAIL') ||
    (useDefaultCredentials ? defaults.E2E_STUDENT_CRM_DENIED_EMAIL : ''),
  E2E_STUDENT_CRM_RECEPTIONIST_EMAIL:
    readEnv('E2E_STUDENT_CRM_RECEPTIONIST_EMAIL') ||
    (useDefaultCredentials ? defaults.E2E_STUDENT_CRM_RECEPTIONIST_EMAIL : ''),
  E2E_STUDENT_CRM_COUNSELOR_EMAIL:
    readEnv('E2E_STUDENT_CRM_COUNSELOR_EMAIL') ||
    (useDefaultCredentials ? defaults.E2E_STUDENT_CRM_COUNSELOR_EMAIL : ''),
  E2E_STUDENT_CRM_APPROVER_EMAIL:
    readEnv('E2E_STUDENT_CRM_APPROVER_EMAIL') ||
    (useDefaultCredentials ? defaults.E2E_STUDENT_CRM_APPROVER_EMAIL : ''),
};

const playwrightArgs = [
  'playwright',
  'test',
  specPath,
  `--project=${project}`,
  `--reporter=${reporter}`,
];

const printSummary = () => {
  console.log('Student CRM Playwright preflight');
  console.log(`Mode: ${preflightOnly ? 'read-only preflight' : 'full mutating CRM smoke'}`);
  console.log(`API URL: ${apiUrl}`);
  console.log(`Frontend URL: ${baseUrl}`);
  console.log(`Project: ${project}`);
  console.log(`Reporter: ${reporter}`);
  console.log(`Credentials: ${describeCredentialState()}`);
  console.log(`Local HTTPS self-signed TLS allowed: ${isLocalHttpsApi ? 'yes' : 'no'}`);
  console.log(
    `Remote Gyanmirai mutation allowed: ${
      preflightOnly
        ? 'not required for read-only preflight'
        : remoteGyanmiraiHost && allowRemoteMutation
          ? 'yes'
          : 'no'
    }`
  );
  console.log(`Command: npx ${playwrightArgs.join(' ')}`);
};

const checkHttp = async (url, label, options = {}) => {
  const started = Date.now();
  let lastError = '';

  while (Date.now() - started < 60_000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (response.ok) {
        return;
      }

      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timeout);
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(`${label} is not ready at ${url}. Last error: ${lastError}`);
};

const main = async () => {
  printSummary();

  if (dryRun) {
    if (!preflightOnly && remoteGyanmiraiHost && !allowRemoteMutation) {
      console.log(
        'Dry run note: a real run would require --allow-stage-mutation for this API host.'
      );
    }
    if (missingCredentials.length && !useDefaultCredentials) {
      console.log(`Dry run note: a real run would require ${missingCredentials.join(', ')}.`);
    }
    return;
  }

  await checkHttp(`${apiUrl}/api/abp/application-configuration`, 'Backend API', {
    headers: { __tenant: childEnv.E2E_TENANT },
  });
  await checkHttp(baseUrl, 'Frontend');

  const command = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npx';
  const commandArgs =
    process.platform === 'win32' ? ['/d', '/s', '/c', 'npx', ...playwrightArgs] : playwrightArgs;
  const child = spawn(command, commandArgs, {
    env: childEnv,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => process.exit(code ?? 1));
  child.on('error', (error) => {
    console.error(error.message);
    process.exit(1);
  });
};

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
