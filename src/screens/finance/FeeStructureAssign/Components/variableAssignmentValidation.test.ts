import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { it, expect, describe } from 'vitest';

import { variableAssignmentError } from './variableAssignmentValidation';

const request: AssignmentRequest = {
  studentId: 'student',
  academicYearId: 'year',
  standardFeeStructureId: 'structure',
  selectedOptionalFeeHeadIds: [],
  feeHeadDetails: [],
  servicePeriods: [],
};
const candidate = (isVariable: boolean, isOptional: boolean) =>
  ({
    heads: [{ feeHeadId: 'head', feeHeadName: 'Transport', isVariable, isOptional }],
  }) as AssignmentCandidate;

describe('student variable fee conditions', () => {
  it.each([false, true])('fixed fees need no variable amount (optional=%s)', (optional) => {
    expect(variableAssignmentError(candidate(false, optional), request)).toBeUndefined();
  });
  it('requires an amount for mandatory variable fees', () => {
    expect(variableAssignmentError(candidate(true, false), request)).toContain('Transport');
  });
  it('allows optional variable fees to be skipped but requires an amount when selected', () => {
    expect(variableAssignmentError(candidate(true, true), request)).toBeUndefined();
    expect(
      variableAssignmentError(candidate(true, true), {
        ...request,
        selectedOptionalFeeHeadIds: ['head'],
      })
    ).toContain('Transport');
  });
  it.each([null, -1, 1.123, 10000000000, NaN])('rejects an invalid entered amount %s', (amount) => {
    expect(
      variableAssignmentError(candidate(true, false), {
        ...request,
        variableFeeHeads: [{ feeHeadId: 'head', amount }],
      })
    ).toBeTruthy();
  });
  it('accepts student amounts without a fixed override reason and requires a reason for explicit zero', () => {
    const withAmount = (amount: number, zeroAmountReason?: string) => ({
      ...request,
      variableFeeHeads: [{ feeHeadId: 'head', amount, zeroAmountReason }],
    });
    expect(variableAssignmentError(candidate(true, false), withAmount(1200.01))).toBeUndefined();
    expect(variableAssignmentError(candidate(true, false), withAmount(0))).toContain('reason');
    expect(
      variableAssignmentError(candidate(true, false), withAmount(0, 'Scholarship'))
    ).toBeUndefined();
  });
});
