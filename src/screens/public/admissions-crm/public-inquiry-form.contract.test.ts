import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(
  path.join(process.cwd(), 'src', 'screens', 'public', 'admissions-crm', 'public-inquiry-form.tsx'),
  'utf8'
);
const statusSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'screens', 'public', 'admissions-crm', 'public-status.tsx'),
  'utf8'
);

describe('public admission inquiry submission contract', () => {
  it('exposes every supported applicant language', () => {
    [source, statusSource].forEach((pageSource) => {
      expect(pageSource).toContain('<MenuItem value="en">English</MenuItem>');
      expect(pageSource).toContain('<MenuItem value="gu">ગુજરાતી</MenuItem>');
      expect(pageSource).toContain('<MenuItem value="hi">हिन्दी</MenuItem>');
    });
  });

  it('reuses an unguessable idempotency key across ambiguous retries', () => {
    expect(source).toContain('submissionInFlightRef.current');
    expect(source).toContain('window.crypto.randomUUID()');
    expect(source).toContain('window.sessionStorage.getItem(submissionStorageKey)');
    expect(source).toContain('submissionKey: getSubmissionKey()');
  });

  it('clears the retry key only after the server confirms success', () => {
    const successIndex = source.indexOf('const payload = (await response.json()) as SubmitResult;');
    const cleanupIndex = source.indexOf('window.sessionStorage.removeItem(submissionStorageKey)');

    expect(successIndex).toBeGreaterThan(-1);
    expect(cleanupIndex).toBeGreaterThan(successIndex);
  });
});
