import { it, expect, describe } from 'vitest';
import { readEnrollmentSource } from '../enrollment-source-contract';

const read = (relativePath: string) => readEnrollmentSource(...relativePath.split('/'));

describe('structured admissions review contract', () => {
  it('keeps configuration optional and exposes rubric and conflict controls', () => {
    const settings = read(
      'src/screens/student/enrollment/setting/structured-review-configuration.tsx'
    );

    expect(settings).toContain('This workflow is optional and starts disabled.');
    expect(settings).toContain('Require each reviewer to declare conflicts of interest');
    expect(settings).toContain('Add rubric criterion');
  });

  it('uses the canonical review API routes and confidentiality language', () => {
    const api = read('src/redux/student/admissions-crm/communication-exams-events-api.ts');
    const applicant = read(
      'src/screens/student/enrollment/admissions-crm/applicant-structured-review.tsx'
    );

    expect(api).toContain('/structured-review/configuration`');
    expect(api).toContain('/structured-review-assignments/');
    expect(api).toContain('/submit`');
    expect(api).toContain('/structured-review/my-assignments`');
    expect(applicant).toContain('Submit confidential review');
    expect(applicant).toContain('Declare conflict and recuse');
  });

  it('blocks ordinary final decisions until a required review is ready', () => {
    const operations = read(
      'src/screens/student/enrollment/admissions-crm/applicant-final-admission-operations.tsx'
    );

    expect(operations).toContain('structuredReviewBlocksDecision');
    expect(operations).toContain(
      'Complete the required structured review before approving, rejecting, or waitlisting this applicant.'
    );
  });

  it('makes reviewer assignments discoverable from My Work', () => {
    const overview = read('src/screens/student/enrollment/admissions-crm/overview-workspace.tsx');

    expect(overview).toContain('Confidential reviews assigned to you');
    expect(overview).toContain('useGetMyAdmissionCrmReviewAssignmentsQuery');
  });
});
