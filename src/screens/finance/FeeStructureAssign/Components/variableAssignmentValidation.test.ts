import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { it, expect, describe } from 'vitest';

import {
  assignmentInputError,
  assignmentPolicyError,
  variableAssignmentError,
} from './variableAssignmentValidation';

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

const policyCandidate = (families: ('collection' | 'refund')[] = []): AssignmentCandidate => ({
  id: 'structure',
  name: 'School fees',
  revisionNumber: 1,
  academicYearId: 'year',
  standardId: 'class',
  total: 0,
  heads: [],
  policies: families.map((family) => ({
    family,
    policyId: `${family}-id`,
    versionId: family === 'collection' ? 'col-v1' : 'ref-v1',
    name: `${family} policy`,
    version: 1,
    headTreatment: {},
  })),
});

describe('student variable fee conditions', () => {
  it('allows an explicitly selected zero fee with its reason', () => {
    expect(
      assignmentInputError(candidate(true, true), {
        ...request,
        selectedOptionalFeeHeadIds: ['head'],
        variableFeeHeads: [
          { feeHeadId: 'head', amount: 0, zeroAmountReason: 'Approved scholarship' },
        ],
      })
    ).toBeUndefined();
  });
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

describe('assignment policy mandatory validation', () => {
  it('requires both collection and refund policy when none is provided', () => {
    const emptyCandidate = policyCandidate();
    expect(assignmentPolicyError(emptyCandidate, request)).toBe(
      'Select a Collection Policy and a Refund Policy before continuing.'
    );
  });

  it('requires refund policy when only collection policy is provided', () => {
    const candidateWithCollection = policyCandidate(['collection']);
    expect(assignmentPolicyError(candidateWithCollection, request)).toBe(
      'Select a Refund Policy before continuing.'
    );
  });

  it('requires collection policy when only refund policy is provided', () => {
    const candidateWithRefund = policyCandidate(['refund']);
    expect(assignmentPolicyError(candidateWithRefund, request)).toBe(
      'Select a Collection Policy before continuing.'
    );
  });

  it('passes when both policies are inherited from structure', () => {
    const validCandidate = policyCandidate(['collection', 'refund']);
    expect(assignmentPolicyError(validCandidate, request)).toBeUndefined();
  });

  it('passes when student overrides provide valid versions', () => {
    const emptyCandidate = policyCandidate();
    const overriddenRequest: AssignmentRequest = {
      ...request,
      policies: [
        { family: 'collection', versionId: 'custom-col' },
        { family: 'refund', versionId: 'custom-ref' },
      ],
    };
    expect(assignmentPolicyError(emptyCandidate, overriddenRequest)).toBeUndefined();
  });
});
