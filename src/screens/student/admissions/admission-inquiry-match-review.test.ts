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
  it('warns on matching DOB in the same cycle even when the mobiles differ', () => {
    expect(
      isPossibleDuplicateInquiry(
        { ...match, existingInquiryMatchesMobile: false, guardianPhone: '9876543211' },
        { ...entered, guardianPhone: '9876543210' }
      )
    ).toBe(true);
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

  it('requires positive evidence when either date of birth is missing', () => {
    expect(isPossibleDuplicateInquiry(match, { ...entered, applicantDateOfBirth: undefined })).toBe(
      false
    );
    expect(isPossibleDuplicateInquiry({ ...match, dateOfBirth: null }, entered)).toBe(false);
  });

  it('warns on matching mobile even when the DOB differs', () => {
    const identity = {
      ...entered,
      guardianPhone: '98765 43210',
      applicantDateOfBirth: '2020-06-23',
    };
    expect(isPossibleDuplicateInquiry({ ...match, guardianPhone: '9876543210' }, identity)).toBe(
      true
    );
    expect(isPossibleDuplicateInquiry({ ...match, guardianPhone: '9876543211' }, identity)).toBe(
      false
    );
  });

  it('uses the mobile recorded on the matched inquiry when supplied by the server', () => {
    const identity = { ...entered, guardianPhone: '9876543210', applicantDateOfBirth: undefined };
    const familyMatch = { ...match, guardianPhone: '9876543210', matchByMobile: true };
    expect(
      isPossibleDuplicateInquiry({ ...familyMatch, existingInquiryMatchesMobile: false }, identity)
    ).toBe(false);
    expect(
      isPossibleDuplicateInquiry({ ...match, existingInquiryMatchesMobile: true }, identity)
    ).toBe(true);
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
