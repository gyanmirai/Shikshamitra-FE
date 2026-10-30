import { it, expect, describe } from 'vitest';

import { isPossibleDuplicateInquiry } from './admission-inquiry-match-review';

const match = {
  applicantId: 'applicant-1',
  familyId: 'family-1',
  applicantName: 'Riya Shah',
  existingInquiryId: 'inquiry-1',
  existingInquiryAdmissionCycleId: 'cycle-1',
  dateOfBirth: '2019-06-23T00:00:00Z',
};
const entered = {
  applicantName: 'Riya Shah',
  applicantDateOfBirth: '2019-06-23',
  admissionCycleId: 'cycle-1',
};

describe('possible inquiry duplicate review', () => {
  it('suggests reviewing the same named child in the current cycle', () => {
    expect(isPossibleDuplicateInquiry(match, entered)).toBe(true);
  });

  it('normalizes case and whitespace without treating approximate names as identity', () => {
    expect(isPossibleDuplicateInquiry(match, { ...entered, applicantName: ' RIYA   shah ' })).toBe(
      true
    );
    expect(isPossibleDuplicateInquiry(match, { ...entered, applicantName: 'Riya' })).toBe(false);
  });

  it('keeps another child in the same family as a sibling candidate', () => {
    expect(isPossibleDuplicateInquiry(match, { ...entered, applicantName: 'Neel Shah' })).toBe(
      false
    );
  });

  it('does not call a previous-cycle inquiry a current duplicate', () => {
    expect(isPossibleDuplicateInquiry(match, { ...entered, admissionCycleId: 'cycle-2' })).toBe(
      false
    );
  });

  it('allows a possible-name review without requiring an unconfigured DOB', () => {
    expect(isPossibleDuplicateInquiry(match, { ...entered, applicantDateOfBirth: undefined })).toBe(
      true
    );
    expect(isPossibleDuplicateInquiry({ ...match, dateOfBirth: null }, entered)).toBe(true);
  });

  it('uses conflicting configured dates to retain a sibling review rather than a duplicate label', () => {
    expect(
      isPossibleDuplicateInquiry(match, { ...entered, applicantDateOfBirth: '2020-06-23' })
    ).toBe(false);
  });

  it('keeps legacy missing-cycle metadata as family review instead of claiming a duplicate', () => {
    expect(
      isPossibleDuplicateInquiry({ ...match, existingInquiryAdmissionCycleId: undefined }, entered)
    ).toBe(false);
  });

  it('requires a saved inquiry and entered student name for the duplicate suggestion', () => {
    expect(isPossibleDuplicateInquiry({ ...match, existingInquiryId: null }, entered)).toBe(false);
    expect(isPossibleDuplicateInquiry(match, { ...entered, applicantName: '' })).toBe(false);
  });
});
