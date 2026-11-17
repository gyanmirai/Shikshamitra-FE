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
it('removes self, invalid families and unavailable family links', () => {
  const candidates = inquiryFamilyCandidates(inquiry, [
    { ...match, applicantId: inquiry.applicantId! },
    { ...match, existingInquiryId: inquiry.id },
    { ...match, familyId: '' },
    { ...match, canLinkFamily: false },
    match,
  ]);
  expect(candidates).toHaveLength(1);
  expect(candidates[0]).toMatchObject({ applicantId: 'source-child', parents: [parent] });
});
it('keeps an accessible family without requiring a saved parent selection', () => {
  const family = { ...match, parents: [] };
  expect(inquiryFamilyCandidates(inquiry, [family])).toEqual([family]);
});
it('keeps an accessible legacy parent for explicit Father/Mother selection without inferring a role', () => {
  const candidates = inquiryFamilyCandidates(inquiry, [
    { ...match, parents: [{ ...parent, relationship: null }] as never },
  ]);
  expect(candidates[0]?.parents?.[0]?.relationship).toBeNull();
});

it('does not offer a child already in the current family for confirmation again', () => {
  expect(inquiryFamilyCandidates({ ...inquiry, familyId: 'family' }, [match])).toEqual([]);
});

it.each([{ hasLinkedSiblings: true }, { siblingFamilyConfirmed: true }])(
  'blocks repeat confirmation for saved family membership %j',
  (patch) => {
    expect(
      inquiryFamilyConfirmationReason({ ...inquiry, ...patch }, false, false, false)
    ).toBeTruthy();
  }
);
