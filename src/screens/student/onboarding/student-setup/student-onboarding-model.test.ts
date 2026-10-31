import type { StudentOnboardingCase } from 'src/redux/student/onboarding/student-onboarding-types';

import { it, expect, describe } from 'vitest';

import { getPendingStudentCount } from './student-setup-view';
import { getStudentPendingTasks } from './student-setup-summary';
import { getReadinessSummary, mapOnboardingCaseToItem } from './student-onboarding-model';

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
  const readySteps = Array.from({ length: 8 }, (_, index) => ({
    id: `ready-${index}`,
    key: `ready_${index}`,
    label: `Preparation ${index + 1}`,
    required: true,
    status: 2 as const,
    displayOrder: index,
  }));
  const handoff = (status: 0 | 1 | 2 | 3 | 4, required = true) => ({
    id: 'parent-handoff',
    onboardingCaseId: 'case-1',
    serviceKey: 'guardian-account',
    required,
    status,
    attemptCount: 1,
    lastError: status === 3 ? 'Parent account could not be linked.' : null,
  });

  it.each([0, 1, 3, 4] as const)(
    'includes an unfinished required handoff (%s) instead of reporting 8/8',
    (status) => {
      const item = mapOnboardingCaseToItem(
        Object.assign(
          buildCase({
            studentEnrollmentId: 'enrollment-1',
            status: 3,
            steps: readySteps,
          }),
          { requiredServiceHandoffs: [handoff(status)] }
        )
      );
      expect(getReadinessSummary(item)).toMatchObject({
        passedCount: 8,
        requiredCount: 9,
        blockingCount: 1,
        progress: 89,
      });
      expect(item.status).toBe('action-required');
      expect(getStudentPendingTasks(item)).toContainEqual(
        expect.objectContaining({
          key: 'guardian-account',
          view: 'credentials',
          actionLabel: 'Open App Login',
        })
      );
    }
  );

  it('counts acknowledged required handoffs consistently for completed cases', () => {
    const item = mapOnboardingCaseToItem(
      Object.assign(
        buildCase({
          studentEnrollmentId: 'enrollment-1',
          status: 4,
          steps: readySteps,
        }),
        { requiredServiceHandoffs: [handoff(2)] }
      )
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 9,
      requiredCount: 9,
      blockingCount: 0,
      progress: 100,
    });
  });

  it.each([false, true] as const)(
    'includes required credential delivery after account linking (confirmed=%s)',
    (confirmed) => {
      const item = mapOnboardingCaseToItem(
        Object.assign(
          buildCase({
            studentEnrollmentId: 'enrollment-1',
            steps: readySteps,
          }),
          { requiredServiceHandoffs: [handoff(2)], requiredCredentialDeliveryConfirmed: confirmed }
        )
      );
      expect(getReadinessSummary(item)).toMatchObject({
        passedCount: confirmed ? 10 : 9,
        requiredCount: 10,
        blockingCount: confirmed ? 0 : 1,
        progress: confirmed ? 100 : 90,
      });
      if (!confirmed)
        expect(getStudentPendingTasks(item)).toContainEqual(
          expect.objectContaining({
            key: 'credential_delivery',
            view: 'credentials',
            actionLabel: 'Open App Login',
          })
        );
    }
  );

  it('does not invent a delivery requirement for optional or completion-timed email', () => {
    const item = mapOnboardingCaseToItem(
      Object.assign(buildCase({ steps: readySteps }), {
        requiredCredentialDeliveryConfirmed: null,
      })
    );
    expect(getReadinessSummary(item)).toMatchObject({ requiredCount: 8, progress: 100 });
  });

  it('does not treat optional failed delivery work as a required readiness blocker', () => {
    const item = mapOnboardingCaseToItem(
      Object.assign(buildCase({ steps: readySteps }), {
        requiredServiceHandoffs: [handoff(3, false)],
      })
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 8,
      requiredCount: 8,
      progress: 100,
    });
  });

  it('keeps legacy server parent-account requirements visible without a new handoff projection', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        studentEnrollmentId: 'enrollment-1',
        guardianAccountRequired: true,
        guardianAccountStatus: 3,
        steps: readySteps,
      })
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 8,
      requiredCount: 9,
      progress: 89,
    });
  });

  it('trusts an explicitly empty effective handoff list over legacy account flags', () => {
    const item = mapOnboardingCaseToItem(
      Object.assign(
        buildCase({
          studentEnrollmentId: 'enrollment-1',
          guardianAccountRequired: true,
          guardianAccountStatus: 3,
          steps: readySteps,
        }),
        { requiredServiceHandoffs: [] }
      )
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 8,
      requiredCount: 8,
      progress: 100,
    });
    expect(item.readinessItems.some((check) => check.key === 'guardian-account')).toBe(false);
  });

  it('does not turn post-enrollment account setup into a pre-activation blocker on older servers', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        studentEnrollmentId: null,
        guardianAccountRequired: true,
        guardianAccountStatus: 0,
        steps: readySteps,
      })
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 8,
      requiredCount: 8,
      progress: 100,
    });
    expect(item.readinessItems.some((check) => check.key === 'guardian-account')).toBe(false);
  });

  it('keeps an unconfirmed fee-structure check below 100 percent without inventing a payment gate', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        feeStructureConfirmed: false,
        steps: [
          ...readySteps.slice(0, 7),
          {
            id: 'fee',
            key: 'fee_structure',
            label: 'Fee structure',
            required: true,
            status: 3,
            displayOrder: 8,
            detail: 'Confirm a published fee structure.',
          },
        ],
      })
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 7,
      requiredCount: 8,
      progress: 88,
      blockingCount: 1,
    });
    expect(getStudentPendingTasks(item)).toContainEqual(
      expect.objectContaining({ key: 'fee_structure', view: 'fees' })
    );
    expect(item.readinessItems.some((check) => check.key === 'finance-first-payment')).toBe(false);
  });

  it('keeps optional fees pending separately from completed setup checks', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        status: 4,
        studentEnrollmentId: 'active-enrollment',
        feeStructureConfirmed: false,
        steps: [
          ...readySteps,
          {
            id: 'optional-fee',
            key: 'finance_accounts_services',
            label: 'Fees',
            required: false,
            status: 5,
            displayOrder: 80,
            detail: 'Fees pending. Fee assignment and payment do not block activation.',
          },
        ],
      })
    );
    expect(getReadinessSummary(item)).toMatchObject({ progress: 100, blockingCount: 0 });
    expect(getStudentPendingTasks(item)).not.toContainEqual(
      expect.objectContaining({ view: 'fees' })
    );
    expect(item.feeStructureConfirmed).toBe(false);
    expect(getPendingStudentCount([item], 'fees')).toBe(1);
  });

  it('counts multiple required services once, with handoff evidence overriding any stale same-key step', () => {
    const item = mapOnboardingCaseToItem(
      Object.assign(
        buildCase({
          steps: [
            ...readySteps,
            {
              id: 'legacy-account',
              key: 'guardian-account',
              label: 'Parent app login',
              required: true,
              status: 2 as const,
              displayOrder: 9,
            },
          ],
        }),
        {
          requiredServiceHandoffs: [
            handoff(3),
            { ...handoff(0), id: 'consent', serviceKey: 'service-consent' },
          ],
        }
      )
    );
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 8,
      requiredCount: 10,
      progress: 80,
      blockingCount: 2,
    });
    expect(item.readinessItems.filter((check) => check.key === 'guardian-account')).toHaveLength(1);
  });

  it('shows the server-confirmed finalized admission independently from profile identity', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        hasDocumentRequirementsSnapshot: true,
        admissionConfirmed: true,
        steps: [],
      })
    );
    expect(item.readinessItems).toEqual([
      expect.objectContaining({
        key: 'admission_confirmed',
        label: 'Admission confirmed',
        status: 'passed',
        blocking: false,
      }),
    ]);
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 1,
      requiredCount: 1,
      progress: 100,
    });
  });

  it('retains the server admission-finalization blocker for an unconfirmed frozen case', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        hasDocumentRequirementsSnapshot: true,
        admissionConfirmed: false,
        steps: [],
      })
    );
    expect(item.readinessItems).toEqual([
      expect.objectContaining({
        key: 'admission_confirmed',
        status: 'failed',
        blocking: true,
      }),
    ]);
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 0,
      requiredCount: 1,
      blockingCount: 1,
    });
  });

  it('keeps imported legacy readiness separate from the Offering admission check', () => {
    const item = mapOnboardingCaseToItem(buildCase({ admissionConfirmed: false }));
    expect(item.readinessItems.some((check) => check.key === 'admission_confirmed')).toBe(false);
    expect(item.readinessItems.find((check) => check.key === 'identity')?.label).toBe(
      'Core identity'
    );
  });
  it('splits identifier readiness into GR and Roll using their actual assignments', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        grNumber: '1001',
        rollNumber: null,
        steps: [
          {
            id: 'identifiers',
            key: 'identifiers_roll',
            label: 'Identifiers',
            required: true,
            status: 0,
            displayOrder: 3,
          },
        ],
      })
    );
    expect(
      item.readinessItems.map(({ key, status, blocking }) => ({ key, status, blocking }))
    ).toEqual([
      { key: 'gr_number', status: 'passed', blocking: false },
      { key: 'roll_number', status: 'pending', blocking: true },
    ]);
    expect(getReadinessSummary(item).blockingCount).toBe(1);
  });
  it('keeps an unplaced live case in the pending-division worklist despite its display placeholder', () => {
    const unplaced = mapOnboardingCaseToItem(buildCase({ divisionId: null, divisionName: null }));
    const placed = mapOnboardingCaseToItem(buildCase({ id: 'case-2' }));
    expect(unplaced.divisionName).toBe('Pending');
    expect(getPendingStudentCount([unplaced, placed], 'division')).toBe(1);
  });
  it('uses separate portal handoffs even when the pre-activation combined check is optional', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        intendedBoardName: 'CBSE',
        intendedMediumName: 'English',
        studentAccountRequired: true,
        guardianAccountRequired: true,
        studentAccountStatus: 2,
        guardianAccountStatus: 0,
        steps: [
          {
            id: 'accounts',
            key: 'finance_accounts_services',
            label: 'Services',
            displayOrder: 8,
            required: false,
            status: 5,
          },
        ],
      })
    );
    expect(item).toMatchObject({
      boardName: 'CBSE',
      mediumName: 'English',
      studentAccountStatus: 'ready',
      guardianAccountStatus: 'pending',
    });
    expect(
      mapOnboardingCaseToItem(buildCase({ studentAccountRequired: false })).studentAccountStatus
    ).toBe('not-required');
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
    ]);
    expect(item.activity[0]).toMatchObject({
      title: 'ReadinessRefreshed',
      detail: 'Readiness was recalculated.',
    });
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 1,
      requiredCount: 2,
      blockingCount: 1,
      progress: 50,
    });
  });

  it('excludes the final-readiness aggregate from the task checklist and readiness counts', () => {
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

    expect(item.readinessItems).toEqual([]);
    expect(getReadinessSummary(item)).toMatchObject({ requiredCount: 0, blockingCount: 0 });
  });

  it('shows completed actual requirements without waiting for the activation aggregate', () => {
    const item = mapOnboardingCaseToItem(
      buildCase({
        steps: [
          {
            id: 'fee',
            key: 'fee_structure',
            label: 'Fee structure',
            displayOrder: 6,
            required: true,
            status: 2,
          },
          {
            id: 'approval',
            key: 'approval_review',
            label: 'Approval',
            displayOrder: 7,
            required: true,
            status: 2,
          },
          {
            id: 'final',
            key: 'final_readiness',
            label: 'Final readiness',
            displayOrder: 99,
            required: true,
            status: 0,
          },
        ],
      })
    );
    expect(item.readinessItems.map((check) => check.key)).toEqual([
      'fee_structure',
      'approval_review',
    ]);
    expect(getReadinessSummary(item)).toMatchObject({
      passedCount: 2,
      requiredCount: 2,
      progress: 100,
      blockingCount: 0,
    });
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

it('preserves the actual step handler and activity actor without using the former case owner', () => {
  const original = buildCase();
  const result = mapOnboardingCaseToItem(
    buildCase({
      assignedToUserName: 'Old case owner',
      steps: [{ ...original.steps[0], completedByName: 'Asha Sharma' }],
      events: [
        {
          id: 'event-1',
          eventType: 'ReadinessRefreshed',
          description: 'Readiness checked',
          occurredAt: '2026-10-22T09:00:00Z',
          actorName: 'Ravi Patel',
        },
      ],
    })
  );
  expect(result.readinessItems[0].handledByName).toBe('Asha Sharma');
  expect(result.activity[0].actorName).toBe('Ravi Patel');
});
