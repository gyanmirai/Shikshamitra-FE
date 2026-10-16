import { it, expect, describe } from 'vitest';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import {
  pendingTaskView,
  getStudentPendingTasks,
  getStudentSetupSummary,
  studentSetupStatusMeta,
} from './student-setup-summary';

import type { StudentOnboardingItem, OnboardingChecklistItem } from './student-onboarding-model';

const buildStudent = (overrides: Partial<StudentOnboardingItem> = {}): StudentOnboardingItem => ({
  ...studentOnboardingTestData[0],
  source: 'onboarding-case',
  status: 'awaiting-approval',
  readinessItems: [],
  ...overrides,
});

const check = (
  key: string,
  overrides: Partial<OnboardingChecklistItem> = {}
): OnboardingChecklistItem => ({
  key,
  label: `${key} backend label`,
  detail: '',
  status: 'pending',
  blocking: true,
  owner: 'Onboarding',
  ...overrides,
});

describe('Student Setup summary', () => {
  it.each([
    ['documents', 'readiness'],
    ['fee_structure', 'fees'],
    ['finance_accounts_services', 'fees'],
    ['guardian-account', 'credentials'],
    ['credentials', 'credentials'],
    ['roll_number', 'roll-number'],
    ['gr-number', 'gr-number'],
    ['placement_seat', 'division'],
    ['division', 'division'],
    ['school_custom_check', 'readiness'],
  ])('preserves the existing destination for %s', (key, view) => {
    expect(pendingTaskView(key)).toBe(view);
  });

  it('shows failed and disconnected checks but excludes passed, optional and activation aggregate checks', () => {
    const student = buildStudent({
      readinessItems: [
        check('documents', { status: 'failed' }),
        check('family', { status: 'not-connected' }),
        check('identity', { status: 'passed' }),
        check('communication', { status: 'not-required' }),
        check('final_readiness'),
      ],
    });
    expect(getStudentPendingTasks(student).map((task) => task.key)).toEqual([
      'documents',
      'family',
    ]);
    expect(getStudentSetupSummary(student).pendingText).toBe(
      'Documents need checking; Parent or guardian details need checking'
    );
  });

  it('splits missing GR and roll numbers without treating a GR preview as assigned', () => {
    const student = buildStudent({
      grNo: null,
      grPreview: 'GR-2026-0001',
      rollNo: null,
      readinessItems: [check('identifiers_roll')],
    });
    expect(getStudentPendingTasks(student)).toEqual([
      {
        key: 'gr_number',
        label: 'GR no. not assigned',
        view: 'gr-number',
        actionLabel: 'Assign GR no.',
      },
      {
        key: 'roll_number',
        label: 'Roll no. not assigned',
        view: 'roll-number',
        actionLabel: 'Assign roll no.',
      },
    ]);
  });

  it('splits only the identifier that is missing and does not mutate source checks', () => {
    const sourceCheck = check('identifier');
    const student = buildStudent({
      grNo: 'GR-01',
      rollNo: null,
      readinessItems: [sourceCheck],
    });
    expect(getStudentPendingTasks(student).map((task) => task.key)).toEqual(['roll_number']);
    expect(student.readinessItems).toEqual([sourceCheck]);
    expect(sourceCheck.key).toBe('identifier');
  });

  it('keeps assigned identifier failures visible without claiming that a number is missing', () => {
    const student = buildStudent({
      grNo: 'GR-01',
      rollNo: 1,
      readinessItems: [
        check('identifiers_roll', { status: 'failed', label: 'Check GR and roll numbers' }),
        check('gr_number', { status: 'failed' }),
        check('roll_number', { status: 'failed' }),
      ],
    });
    const tasks = getStudentPendingTasks(student);
    expect(tasks[0].label).toBe('Check GR and roll numbers');
    expect(tasks[1]).toMatchObject({
      label: 'GR no. needs checking',
      actionLabel: 'Review GR no.',
    });
    expect(tasks[2]).toMatchObject({
      label: 'Roll no. needs checking',
      actionLabel: 'Review roll no.',
    });
  });

  it('distinguishes missing division from a placed student with a failed placement check', () => {
    const student = buildStudent({ divisionId: null, readinessItems: [check('placement_seat')] });
    expect(getStudentPendingTasks(student)[0]).toMatchObject({
      label: 'Division not assigned',
      actionLabel: 'Assign division',
      view: 'division',
    });
    expect(getStudentPendingTasks({ ...student, divisionId: 'division-a' })[0]).toMatchObject({
      label: 'Class and division need checking',
      actionLabel: 'Review division',
    });
  });

  it('preserves the meaning and destination of the combined services check and unknown checks', () => {
    const tasks = getStudentPendingTasks(
      buildStudent({
        readinessItems: [
          check('finance_accounts_services'),
          check('school_custom_check', { label: 'Collect library consent' }),
        ],
      })
    );
    expect(tasks[0]).toMatchObject({
      label: 'Fees, app access and services need checking',
      view: 'fees',
      actionLabel: 'Open Fees',
    });
    expect(tasks[1]).toMatchObject({ label: 'Collect library consent', view: 'readiness' });
  });

  it('shows App Login pending only after enrollment and avoids duplicate account tasks', () => {
    const student = buildStudent({ credentialsPending: true });
    expect(getStudentPendingTasks(student)).toEqual([]);
    const enrolled = { ...student, studentEnrollmentId: 'enrollment-1' };
    expect(getStudentPendingTasks(enrolled)).toEqual([
      {
        key: 'credentials',
        label: 'App login needs setup',
        view: 'credentials',
        actionLabel: 'Open App Login',
      },
    ]);
    expect(
      getStudentPendingTasks({ ...enrolled, readinessItems: [check('accounts')] })
    ).toHaveLength(1);
  });

  it('does not infer unsent email from pending account status', () => {
    const tasks = getStudentPendingTasks(
      buildStudent({
        studentAccountStatus: 'pending',
        guardianAccountStatus: 'pending',
        readinessItems: [check('accounts')],
      })
    );
    expect(tasks[0].label).toBe('App login needs setup');
    expect(tasks[0].label).not.toMatch(/email|sent/i);
  });

  it.each(Object.entries(studentSetupStatusMeta))(
    'preserves the %s lifecycle even with no pending tasks',
    (status, meta) => {
      const summary = getStudentSetupSummary(
        buildStudent({ status: status as StudentOnboardingItem['status'] })
      );
      expect(summary.status).toEqual(meta);
    }
  );

  it('offers activation review only for a ready onboarding case without enrollment', () => {
    const student = buildStudent({ status: 'ready-to-activate' });
    expect(getStudentSetupSummary(student).action).toEqual({
      label: 'Review & activate',
      primary: true,
    });
    expect(
      getStudentSetupSummary({ ...student, studentEnrollmentId: 'enrollment-1' }).action
    ).toEqual({ label: 'Check completion', primary: false });
    expect(getStudentSetupSummary({ ...student, source: 'student-records' }).action).toEqual({
      label: 'Review setup',
      primary: false,
    });
  });

  it.each([null, 'enrollment-1'])(
    'keeps finishing setup separate from activation and completion for enrollment %s',
    (studentEnrollmentId) => {
      const summary = getStudentSetupSummary(
        buildStudent({ status: 'provisioning', studentEnrollmentId })
      );
      expect(summary.status.label).toBe('Finishing setup');
      expect(summary.action).toEqual({ label: 'Check completion', primary: false });
      expect(summary.pendingText).toBe('Completion check pending');
    }
  );

  it('keeps completed students complete while opening pending App Login setup', () => {
    const student = buildStudent({
      status: 'completed',
      studentEnrollmentId: 'enrollment-1',
      credentialsPending: true,
    });
    expect(getStudentSetupSummary(student)).toMatchObject({
      status: { label: 'Setup complete', color: 'success' },
      pendingText: 'App login needs setup',
      action: { label: 'Open App Login', view: 'credentials', primary: false },
    });
    expect(getStudentSetupSummary({ ...student, credentialsPending: false })).toMatchObject({
      pendingText: 'No pending work',
      action: { label: 'View details', primary: false },
    });
  });

  it('allows cancelled cases to be reviewed without suggesting a task action', () => {
    const summary = getStudentSetupSummary(
      buildStudent({
        status: 'cancelled',
        readinessItems: [check('documents')],
      })
    );
    expect(summary.status.label).toBe('Cancelled');
    expect(summary.action).toEqual({ label: 'View details', primary: false });
  });

  it('uses the first pending task destination and keeps cases without checks under review', () => {
    expect(
      getStudentSetupSummary(
        buildStudent({ readinessItems: [check('roll_number'), check('documents')] })
      ).action
    ).toEqual({
      label: 'Assign roll no.',
      view: 'roll-number',
      primary: false,
    });
    expect(getStudentSetupSummary(buildStudent())).toMatchObject({
      status: { label: 'In progress' },
      pendingText: 'Review student setup',
      action: { label: 'Review setup', primary: false },
    });
  });
});
