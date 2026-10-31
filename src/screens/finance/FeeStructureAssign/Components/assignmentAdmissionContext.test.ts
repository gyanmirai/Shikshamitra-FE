import type {
  AssignmentContext,
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { it, expect } from 'vitest';

import { mergeAssignmentInputs } from './assignmentAdmissionContext';

it('keeps confirmed optional selections and head amounts owned by each admission in a bulk edit', () => {
  const candidate = {
    id: 'structure',
    heads: [
      { feeHeadId: 'tuition', isOptional: false },
      { feeHeadId: 'bus', isOptional: true },
      { feeHeadId: 'meal', isOptional: true, isVariable: true },
    ],
  } as AssignmentCandidate;
  const current: AssignmentRequest = {
    studentId: 'second',
    academicYearId: 'year',
    standardFeeStructureId: 'structure',
    selectedOptionalFeeHeadIds: ['meal'],
    feeHeadDetails: [],
    variableFeeHeads: [{ feeHeadId: 'meal', amount: 450 }],
    servicePeriods: [],
  };
  const common: AssignmentRequest = {
    ...current,
    studentId: 'first',
    selectedOptionalFeeHeadIds: ['bus'],
    variableFeeHeads: [],
    feeHeadDetails: [{ feeHeadId: 'bus', amount: 100 }],
    servicePeriods: [
      {
        feeHeadId: 'bus',
        source: 'ManualOverride',
        startDate: '2026-08-01',
        endDate: '2027-03-31',
        reason: 'Approved',
      },
    ],
  };
  const context = {
    studentId: 'second',
    structureId: 'structure',
    selectedOptionalFeeHeadIds: ['meal'],
    joiningDate: '2026-09-10',
    chargeStartDate: '2026-09-10',
    chargeEndDate: '2027-03-31',
    applicationId: 'second-application',
    admissionFeeHeadIds: ['tuition'],
  } as AssignmentContext;
  const merged = mergeAssignmentInputs(common, current, candidate, context);
  expect(merged.studentId).toBe('second');
  expect(merged.selectedOptionalFeeHeadIds).toEqual(['meal']);
  expect(merged.variableFeeHeads).toEqual([{ feeHeadId: 'meal', amount: 450 }]);
  expect(merged.feeHeadDetails).toEqual([]);
  expect(merged.servicePeriods).toEqual([
    {
      feeHeadId: 'tuition',
      source: 'Registration',
      sourceReferenceId: 'second-application',
      startDate: '2026-09-10',
      endDate: '2027-03-31',
    },
  ]);
});
