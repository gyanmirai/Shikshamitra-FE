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
    expect(source).toContain('label="Work queue"');
    expect(source).not.toContain("minWidth: 'max-content'");
    expect(source).not.toContain('variant={selectedQueue === queue.queueType');
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
