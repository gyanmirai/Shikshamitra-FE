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

it('preserves correction identities and student-specific verified periods while sharing optional fees', () => {
  const candidate = {
    id: 'structure',
    heads: [{ feeHeadId: 'bus', isOptional: true }],
  } as AssignmentCandidate;
  const current: AssignmentRequest = {
    studentId: 'second',
    academicYearId: 'year',
    standardFeeStructureId: 'structure',
    editAssignmentId: 'second-assignment',
    assignmentConcurrencyStamp: 'second-stamp',
    selectedOptionalFeeHeadIds: [],
    feeHeadDetails: [],
    servicePeriods: [
      { feeHeadId: 'bus', source: 'TransportService', sourceReferenceId: 'second-route' },
    ],
  };
  const common: AssignmentRequest = {
    ...current,
    studentId: 'first',
    editAssignmentId: 'first-assignment',
    assignmentConcurrencyStamp: 'first-stamp',
    selectedOptionalFeeHeadIds: ['bus'],
    editReason: 'Correct fees',
    servicePeriods: [
      { feeHeadId: 'bus', source: 'TransportService', sourceReferenceId: 'first-route' },
    ],
  };
  const context = {
    status: 'Assigned',
    studentId: 'second',
    structureId: 'structure',
    selectedOptionalFeeHeadIds: [],
  } as unknown as AssignmentContext;
  expect(mergeAssignmentInputs(common, current, candidate, context)).toMatchObject({
    studentId: 'second',
    editAssignmentId: 'second-assignment',
    assignmentConcurrencyStamp: 'second-stamp',
    selectedOptionalFeeHeadIds: ['bus'],
    editReason: 'Correct fees',
    servicePeriods: [{ feeHeadId: 'bus', sourceReferenceId: 'second-route' }],
  });
});

it('retains each saved verified period when another student has an academic-year period', () => {
  const candidate = {
    id: 'structure',
    heads: [{ feeHeadId: 'bus', isOptional: true }],
  } as AssignmentCandidate;
  const current: AssignmentRequest = {
    studentId: 'second',
    academicYearId: 'year',
    standardFeeStructureId: 'structure',
    editAssignmentId: 'second-assignment',
    assignmentConcurrencyStamp: 'second-stamp',
    selectedOptionalFeeHeadIds: ['bus'],
    feeHeadDetails: [],
    servicePeriods: [
      { feeHeadId: 'bus', source: 'TransportService', sourceReferenceId: 'second-route' },
    ],
  };
  const previous: AssignmentRequest = {
    ...current,
    studentId: 'first',
    servicePeriods: [{ feeHeadId: 'bus', source: 'AcademicYear' }],
  };
  const changed: AssignmentRequest = {
    ...previous,
    policies: [{ family: 'collection', versionId: 'shared' }],
  };
  const context = { status: 'Assigned', structureId: 'structure' } as AssignmentContext;
  expect(
    mergeAssignmentInputs(changed, current, candidate, context, previous).servicePeriods
  ).toEqual(current.servicePeriods);
  const manual: AssignmentRequest = {
    ...changed,
    servicePeriods: [
      {
        feeHeadId: 'bus',
        source: 'ManualOverride',
        startDate: '2026-08-01',
        endDate: '2027-03-31',
        reason: 'Update service dates',
      },
    ],
  };
  expect(
    mergeAssignmentInputs(manual, current, candidate, context, previous).servicePeriods
  ).toEqual(manual.servicePeriods);
  expect(
    mergeAssignmentInputs(manual, previous, candidate, context, previous).servicePeriods
  ).toEqual(manual.servicePeriods);
});
