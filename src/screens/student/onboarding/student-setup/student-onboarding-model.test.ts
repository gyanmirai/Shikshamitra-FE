import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, expect, describe } from 'vitest';

import { getReadinessSummary, mapOnboardingCaseToItem } from './student-onboarding-model';
import { getPendingStudentCount, filterStudentsForSetupView } from './student-setup-view';

const buildCase = (overrides: Partial<StudentOnboardingCase> = {}): StudentOnboardingCase => ({
  id: 'case-1',
  documentUploadsEnabled: true,
  concurrencyStamp: 'case-stamp-1',
  applicationId: 'application-1',
  applicationNumber: 'APP-0001',
  applicantId: 'applicant-1',
  studentId: 'student-1',
  studentName: 'Aarav Shah',
  offeringId: 'offering-1',
  offeringCode: 'AY26-G5',
  academicYearId: 'year-1',
  academicYearName: '2026-27',
  intendedBoardId: 'board-1',
  intendedMediumId: 'medium-1',
  intendedStageId: 'stage-1',
  intendedStandardId: 'standard-5',
  intendedStandardName: 'Grade 5',
  status: 3,
  assignedToUserName: 'Admission Office',
  dueAt: '2026-09-20T00:00:00Z',
  isHistoricalBackfill: false,
  divisionId: 'division-a',
  divisionName: 'A',
  grNumber: 'GR-0001',
  rollNumber: 12,
  progressPercent: 67,
  isOverdue: true,
  steps: [
    {
      id: 'step-1',
      key: 'identity',
      label: 'Core identity',
      displayOrder: 1,
      required: true,
      status: 2,
      detail: 'Identity is complete.',
    },
    {
      id: 'step-2',
      key: 'documents',
      label: 'Documents',
      displayOrder: 2,
      required: true,
      status: 3,
      detail: 'One required document is missing.',
    },
    {
      id: 'step-3',
      key: 'medical_previous_school',
      label: 'Medical and previous school',
      displayOrder: 3,
      required: false,
      status: 5,
    },
    {
      id: 'step-4',
      key: 'final_readiness',
      label: 'Final readiness',
      displayOrder: 99,
      required: true,
      status: 0,
      detail: 'Completed automatically during activation.',
    },
  ],
  events: [
    {
      id: 'event-1',
      eventType: 'ReadinessRefreshed',
      description: 'Readiness was recalculated.',
      occurredAt: '2026-09-21T08:00:00Z',
    },
  ],
  ...overrides,
});

describe('mapOnboardingCaseToItem', () => {
  it('keeps an unplaced live case in the pending-division worklist despite its display placeholder', () => {
    const unplaced = mapOnboardingCaseToItem(buildCase({ divisionId: null, divisionName: null }));
    const placed = mapOnboardingCaseToItem(buildCase({ id: 'case-2' }));
    expect(unplaced.divisionName).toBe('Pending');
    expect(getPendingStudentCount([unplaced, placed], 'division')).toBe(1);
    expect(filterStudentsForSetupView([unplaced, placed], 'division', 'pending')).toEqual([unplaced]);
  });
  it('uses separate portal handoffs even when the pre-activation combined check is optional', () => {
    const item = mapOnboardingCaseToItem(buildCase({
      intendedBoardName: 'CBSE', intendedMediumName: 'English',
      studentAccountRequired: true, guardianAccountRequired: true,
      studentAccountStatus: 2, guardianAccountStatus: 0,
      steps: [{ id: 'accounts', key: 'finance_accounts_services', label: 'Services',
        displayOrder: 8, required: false, status: 5 }],
    }));
    expect(item).toMatchObject({ boardName: 'CBSE', mediumName: 'English',
      studentAccountStatus: 'ready', guardianAccountStatus: 'pending' });
    expect(mapOnboardingCaseToItem(buildCase({ studentAccountRequired: false })).studentAccountStatus)
      .toBe('not-required');
    expect(mapOnboardingCaseToItem(buildCase()).studentAccountStatus).toBe('not-connected');
  });

  it('preserves durable status, concurrency, blockers, and audit events', () => {
    const item = mapOnboardingCaseToItem(buildCase());

    expect(item).toMatchObject({
      id: 'case-1',
      studentId: 'student-1',
      applicationNumber: 'APP-0001',
      status: 'action-required',
      source: 'onboarding-case',
      concurrencyStamp: 'case-stamp-1',
      backendStatus: 3,
      isOverdue: true,
      documentsPassed: 0,
      documentsRequired: 1,
    });
    expect(
      item.readinessItems.map(({ key, status, blocking }) => ({
        key,
        status,
        blocking,
      }))
    ).toEqual([
      { key: 'identity', status: 'passed', blocking: false },
      { key: 'documents', status: 'failed', blocking: true },
      { key: 'medical_previous_school', status: 'not-required', blocking: false },
      { key: 'final_readiness', status: 'pending', blocking: false },
    ]);
    expect(item.activity[0]).toMatchObject({
      title: 'ReadinessRefreshed',
      detail: 'Readiness was recalculated.',
    });
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 1,
      requiredCount: 3,
      blockingCount: 1,
      progress: 33,
    });
  });

  it('does not treat the system-owned final-readiness step as a manual blocker', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        status: 1,
        steps: [
          {
            id: 'step-final',
            key: 'final_readiness',
            label: 'Final readiness',
            displayOrder: 99,
            required: true,
            status: 0,
          },
        ],
      })
    );

    expect(item.readinessItems[0]).toMatchObject({
      status: 'pending',
      blocking: false,
      detail: 'This is completed automatically when activation validates every required check.',
    });
    expect(getReadinessSummary(item).blockingCount).toBe(0);
  });

  it('explains a pending approval requirement before a staff member records it', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        steps: [
          {
            id: 'step-approval',
            key: 'approval_review',
            label: 'Onboarding approval',
            displayOrder: 85,
            required: true,
            status: 0,
          },
        ],
      })
    );

    expect(item.readinessItems[0].detail).toBe(
      'Review the current requirements and record an approval note.'
    );
  });

  it.each([
    [0, 'to-prepare'],
    [1, 'awaiting-approval'],
    [2, 'ready-to-activate'],
    [3, 'action-required'],
    [4, 'completed'],
    [5, 'cancelled'],
  ] as const)('maps backend status %s without hiding lifecycle state', (status, expected) => {
    expect(mapOnboardingCaseToItem(buildCase({ status })).status).toBe(expected);
  });
});
