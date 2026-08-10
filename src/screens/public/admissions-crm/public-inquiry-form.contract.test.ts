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
const familyAccessSource = fs.readFileSync(
  path.join(
    process.cwd(),
    'src',
    'screens',
    'public',
    'admissions-crm',
    'public-family-access.tsx'
  ),
  'utf8'
);
const eventsSource = fs.readFileSync(
  path.join(process.cwd(), 'src', 'screens', 'public', 'admissions-crm', 'public-events.tsx'),
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

  it('lets a verified guardian switch between related family applications', () => {
    expect(statusSource).toContain('status.familyApplications?.map');
    expect(statusSource).toContain('X-Admission-Access-Session');
    expect(statusSource).toContain('switchApplication(event.target.value)');
    expect(statusSource).toContain('token={currentToken}');
  });

  it('supports passwordless family return access without putting the session token in the URL', () => {
    expect(familyAccessSource).toContain('/family/otp');
    expect(familyAccessSource).toContain('/family/verify');
    expect(familyAccessSource).toContain('window.sessionStorage.setItem');
    expect(familyAccessSource).not.toContain('accessSessionToken}`');
    expect(statusSource).toContain('getFamilyStatusStorageKey(tenantId, token)');
  });

  it('offers verified, localized family event booking with explicit cancellation confirmation', () => {
    expect(statusSource).toContain('<PublicEvents');
    expect(eventsSource).toContain("'X-Admission-Access-Session': accessSessionToken");
    expect(eventsSource).toContain("const action = cancel ? 'cancel' : 'reserve'");
    expect(eventsSource).toContain('confirmingEventId === admissionEvent.id');
    expect(eventsSource).toContain('મુલાકાત અને કાર્યક્રમો');
    expect(eventsSource).toContain('भ्रमण और कार्यक्रम');
  });
});
