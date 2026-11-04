import type {
  DuplicateMatch,
  AdmissionInquiry,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { it, expect } from 'vitest';

import {
  inquiryFamilyCandidates,
  inquiryFamilyConfirmationReason,
} from './inquiry-family-confirmation-model';

const inquiry = {
  id: 'target',
  applicantId: 'target-child',
  status: 0,
  concurrencyStamp: 'stamp',
} as AdmissionInquiry;
const parent = {
  sourceApplicantId: 'source-child',
  relationship: 'father',
  name: 'Amit',
  firstName: 'Amit',
};
const match = {
  applicantId: 'source-child',
  familyId: 'family',
  existingInquiryId: 'source',
  applicantName: 'Riya',
  canLinkFamily: true,
  parents: [parent],
} as DuplicateMatch;

it.each([0, 1, 3] as const)(
  'allows only a clean editable pending inquiry at legacy status %i',
  (status) => {
    expect(inquiryFamilyConfirmationReason({ ...inquiry, status }, false, false, false)).toBeNull();
  }
);
it.each([
  { patch: { status: 2 }, readOnly: false, dirty: false, busy: false },
  { patch: { applicationId: 'application' }, readOnly: false, dirty: false, busy: false },
  { patch: { isTransferred: true }, readOnly: false, dirty: false, busy: false },
  { patch: { isDuplicate: true }, readOnly: false, dirty: false, busy: false },
  { patch: {}, readOnly: true, dirty: false, busy: false },
  { patch: {}, readOnly: false, dirty: true, busy: false },
  { patch: {}, readOnly: false, dirty: false, busy: true },
  { patch: { concurrencyStamp: '' }, readOnly: false, dirty: false, busy: false },
])('blocks ineligible or unsafe entry $patch', ({ patch, readOnly, dirty, busy }) => {
  expect(
    inquiryFamilyConfirmationReason(
      { ...inquiry, ...patch } as AdmissionInquiry,
      readOnly,
      dirty,
      busy
    )
  ).toBeTruthy();
});
it('removes self, invalid families and parents belonging to a different source child', () => {
  const candidates = inquiryFamilyCandidates(inquiry, [
    { ...match, applicantId: inquiry.applicantId! },
    { ...match, existingInquiryId: inquiry.id },
    { ...match, familyId: '' },
    { ...match, canLinkFamily: false },
    { ...match, parents: [{ ...parent, relationship: 'guardian' } as never] },
    { ...match, parents: [{ ...parent, sourceApplicantId: inquiry.applicantId! }] as never },
    match,
  ]);
  expect(candidates).toHaveLength(1);
  expect(candidates[0]).toMatchObject({ applicantId: 'source-child', parents: [parent] });
});
it('keeps an accessible legacy parent for explicit Father/Mother selection without inferring a role', () => {
  const candidates = inquiryFamilyCandidates(inquiry, [
    { ...match, parents: [{ ...parent, relationship: null }] as never },
  ]);
  expect(candidates[0].parents[0].relationship).toBeNull();
});
