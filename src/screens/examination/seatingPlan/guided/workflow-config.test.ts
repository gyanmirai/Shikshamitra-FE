import type {
  SeatingPlanGroupDto,
  SeatingPlanWorkspaceDto,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { it, expect, describe } from 'vitest';

import { getNextLabel, getNextDisabled, getStepFromQuery } from './workflow-config';

describe('guided seating workflow configuration', () => {
  it('keeps route-backed steps inside the supported workflow', () => {
    expect(getStepFromQuery(null)).toBe(0);
    expect(getStepFromQuery('-4')).toBe(0);
    expect(getStepFromQuery('3')).toBe(3);
    expect(getStepFromQuery('99')).toBe(3);
    expect(getStepFromQuery('rooms')).toBe(0);
  });

  it('explains the preview, apply and validation phases', () => {
    expect(getNextLabel(0, false, false, false, false)).toBe('Create seating plan');
    expect(getNextLabel(0, false, false, true, false)).toBe('Edit selected plan');
    expect(getNextLabel(1, false, false, true, false)).toBe('Generate seating preview');
    expect(getNextLabel(1, true, false, true, false, 'manual')).toBe(
      'Review manual seating'
    );
    expect(getNextLabel(2, false, false, true, false)).toBe('Generate preview');
    expect(getNextLabel(2, true, false, true, false)).toBe('Apply seating & validate');
    expect(getNextLabel(2, true, true, true, false)).toBe('Save plan & return to subjects');
    expect(getNextLabel(0, false, false, false, false, 'automatic', true)).toBe(
      'Review examination & publish'
    );
    expect(getNextLabel(0, false, false, true, false, 'automatic', true)).toBe(
      'Review examination & publish'
    );
  });

  it('does not offer to republish an approved plan', () => {
    expect(getNextLabel(3, false, true, true, true)).toBe('Back to seating plans');
  });

  it('keeps manual seating on Configure until every student has a seat', () => {
    const common = {
      activeStep: 1,
      isBusy: false,
      workspace: {
        readiness: {
          isReadyToPublish: false,
        },
      } as SeatingPlanWorkspaceDto,
      plan: {
        totalStudents: 2,
        availableRooms: [{ roomId: 'room-1', usableCapacity: 4 }],
      } as SeatingPlanGroupDto,
      selectedExamSubjectIds: [],
      seatingPlanId: 'plan-1',
      selectedRoomIds: ['room-1'],
      previewAssignmentCount: 2,
      permissions: {
        canAdd: true,
        canAutoAllocate: false,
        canFinalize: false,
        canPublish: false,
        canDelete: false,
      },
      isLocked: false,
      isPublished: false,
      validationIsValid: undefined,
      warningCount: 0,
      warningsAcknowledged: false,
      allocationMode: 'manual' as const,
    };

    expect(
      getNextDisabled({ ...common, hasPreview: true, hasUnallocatedPreview: true })
    ).toBe(true);
    expect(
      getNextDisabled({ ...common, hasPreview: true, hasUnallocatedPreview: false })
    ).toBe(false);
  });

  it('offers one global publish review only after examination readiness passes', () => {
    const permissions = {
      canAdd: true,
      canAutoAllocate: true,
      canFinalize: true,
      canPublish: true,
      canDelete: true,
    };
    const base = {
      isBusy: false,
      selectedExamSubjectIds: [],
      selectedRoomIds: [],
      hasUnallocatedPreview: false,
      previewAssignmentCount: 0,
      permissions,
      isLocked: false,
      isPublished: false,
      hasPreview: false,
      validationIsValid: true,
      warningCount: 0,
      warningsAcknowledged: false,
    };

    expect(
      getNextDisabled({
        ...base,
        activeStep: 0,
        workspace: { readiness: { isReadyToPublish: true } } as SeatingPlanWorkspaceDto,
      })
    ).toBe(false);
    expect(
      getNextDisabled({
        ...base,
        activeStep: 3,
        workspace: { readiness: { isReadyToPublish: false } } as SeatingPlanWorkspaceDto,
      })
    ).toBe(true);
    expect(
      getNextDisabled({
        ...base,
        activeStep: 3,
        workspace: { readiness: { isReadyToPublish: true } } as SeatingPlanWorkspaceDto,
      })
    ).toBe(false);
  });

  it('blocks applying an empty generated preview', () => {
    expect(
      getNextDisabled({
        activeStep: 2,
        isBusy: false,
        workspace: { readiness: { isReadyToPublish: false } } as SeatingPlanWorkspaceDto,
        plan: { totalStudents: 3, availableRooms: [] } as unknown as SeatingPlanGroupDto,
        selectedExamSubjectIds: [],
        seatingPlanId: 'plan-1',
        selectedRoomIds: [],
        hasUnallocatedPreview: false,
        previewAssignmentCount: 0,
        permissions: {
          canAdd: true,
          canAutoAllocate: true,
          canFinalize: true,
          canPublish: true,
          canDelete: true,
        },
        isLocked: false,
        isPublished: false,
        hasPreview: true,
        validationIsValid: undefined,
        warningCount: 0,
        warningsAcknowledged: false,
      })
    ).toBe(true);
  });
});
