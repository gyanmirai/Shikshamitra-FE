import fs from 'node:fs';
import path from 'node:path';

const decomposedModules = new Set([
  'admission-year-setup',
  'admissions-crm-configuration',
  'admissions-playbook-configuration',
  'admissions-registration-configuration',
  'applicant-final-admission-operations',
  'applicant-registration-operations',
  'exams-workspace',
  'operations-queue-workspace',
  'pipeline-workspace',
]);

export const readEnrollmentSource = (...segments: string[]) => {
  const filePath = path.join(process.cwd(), ...segments);
  const fileName = path.basename(filePath);
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  const source = fs.readFileSync(filePath, 'utf8');

  if (!decomposedModules.has(baseName)) return source;

  const folder = path.dirname(filePath);
  const related = fs
    .readdirSync(folder)
    .filter(
      (candidate) =>
        candidate !== fileName &&
        candidate.startsWith(`${baseName}-`) &&
        candidate.endsWith(extension)
    )
    .sort();

  return [
    source,
    ...related.map((candidate) => fs.readFileSync(path.join(folder, candidate), 'utf8')),
  ].join('\n');
};
