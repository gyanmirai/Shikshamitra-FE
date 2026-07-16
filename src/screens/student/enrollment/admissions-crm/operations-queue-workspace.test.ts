import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const read = (...segments: string[]) =>
  fs.readFileSync(path.join(process.cwd(), ...segments), 'utf8');

describe('Enrollment operations queue workspace', () => {
  it('uses the shared filter panel and a queue selector instead of horizontal queue buttons', () => {
    const source = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'operations-queue-workspace.tsx'
    );

    expect(source).toContain('<EnrollmentWorkspaceFilterPanel');
    expect(source).toContain('label="Queue"');
    expect(source).toContain('label="Owner"');
    expect(source).toContain('label="Assignee"');
    expect(source).toContain('ownerOnly: true');
    expect(source).toContain('Saved views');
    expect(source).not.toContain("minWidth: 'max-content'");
    expect(source).not.toContain('variant={selectedQueue === queue.queueType');
  });

  it('keeps the queue table full-height and employee-backed', () => {
    const source = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'operations-queue-workspace.tsx'
    );

    expect(source).toContain('enrollmentWorkspaceRootSx');
    expect(source).toContain('enrollmentTableWrapperSx');
    expect(source).toContain('enrollmentTableContainerSx');
    expect(source).toContain('option.employeeCode');
    expect(source).toContain("sx={{ minWidth: 0, width: '100%' }}");
    expect(source).not.toContain('minWidth: { lg: 240 }');
    expect(source).not.toContain('width: { lg: 170 }');
  });

  it('puts eligible applicants awaiting manual registration first', () => {
    const config = read(
      'src',
      'screens',
      'student',
      'enrollment',
      'admissions-crm',
      'operations-queue-config.ts'
    );
    const registrationQueue = config.slice(config.indexOf('export const registrationQueues'));

    expect(registrationQueue.indexOf('RegistrationInvitationPending')).toBeLessThan(
      registrationQueue.indexOf('ExpiringRegistrationLink')
    );
  });
});
