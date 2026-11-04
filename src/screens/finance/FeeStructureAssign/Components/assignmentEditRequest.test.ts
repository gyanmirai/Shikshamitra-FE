import type {
  AssignmentContext,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { it, expect } from 'vitest';

import { assignmentEditRequest, assignmentEditReasonError } from './assignmentEditRequest';

it('prefills the saved selection, zero variable amount, dates and current policy pins', () => {
  const context = {
    studentId: 'one',
    assignmentId: 'saved',
    assignmentConcurrencyStamp: 'stamp',
    assignedAssignment: {
      structureId: 'structure',
      heads: [
        {
          feeHeadId: 'bus',
          isVariable: true,
          isOptional: true,
          included: true,
          effectiveAmount: 0,
          zeroAmountReason: 'Free transport',
          servicePeriod: {
            feeHeadId: 'bus',
            source: 'ManualOverride',
            startDate: '2026-08-01',
            endDate: '2027-03-31',
            reason: 'Approved dates',
          },
        },
        { feeHeadId: 'meal', isOptional: true, included: false },
      ],
      policies: [{ family: 'collection', versionId: 'saved-policy' }],
    },
  } as unknown as AssignmentContext;
  const request = assignmentEditRequest(
    context,
    { id: 'structure' } as AssignmentCandidate,
    'year'
  );
  expect(request).toMatchObject({
    editAssignmentId: 'saved',
    assignmentConcurrencyStamp: 'stamp',
    selectedOptionalFeeHeadIds: ['bus'],
    variableFeeHeads: [{ feeHeadId: 'bus', amount: 0, zeroAmountReason: 'Free transport' }],
    servicePeriods: [{ feeHeadId: 'bus', startDate: '2026-08-01', reason: 'Approved dates' }],
    policies: expect.arrayContaining([{ family: 'collection', versionId: 'saved-policy' }]),
  });
  expect(assignmentEditReasonError(request)).toContain('change reason');
  expect(
    assignmentEditReasonError({ ...request, editReason: 'Correct unpaid fees' })
  ).toBeUndefined();
  expect(assignmentEditReasonError({ ...request, editReason: 'x'.repeat(501) })).toBeUndefined();
  expect(assignmentEditReasonError({ ...request, editReason: ' \n\t ' })).toBe(
    'Enter a fee structure change reason.'
  );
  const switched = assignmentEditRequest(
    context,
    { id: 'replacement' } as AssignmentCandidate,
    'year'
  );
  expect(switched.selectedOptionalFeeHeadIds).toEqual([]);
  expect(switched.servicePeriods).toEqual([]);
  expect(switched.policies).toEqual(request.policies);
});
