import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

import { it, expect } from 'vitest';

import {
  inquiryContactMatchText,
  buildInquiryFamilyReviews,
} from './admission-inquiry-parent-review-model';

const parent = {
  sourceApplicantId: 'child-1',
  name: 'Amit',
  firstName: 'Amit',
  relationship: 'father' as const,
  mobile: '9876543210',
  email: 'parent@example.com',
};
const match: DuplicateMatch = {
  familyId: 'family',
  applicantId: 'child-1',
  applicantName: 'Riya',
  parents: [parent],
};
it('groups children once by family, deduplicates equivalent saved parents and keeps real source provenance', () => {
  const result = buildInquiryFamilyReviews([
    match,
    {
      ...match,
      applicantId: 'child-2',
      parents: [
        {
          ...parent,
          sourceApplicantId: 'child-2',
          email: ' PARENT@example.com ',
          mobile: '+91 9876543210',
        },
      ],
    },
    match,
  ]);
  expect(result).toHaveLength(1);
  expect(result[0].children).toHaveLength(2);
  expect(result[0].parents).toHaveLength(1);
  expect(result[0].parents[0].parent.sourceApplicantId).toBe('child-1');
});
it('keeps identical contacts in different families separate and never includes an unsupported role', () => {
  const result = buildInquiryFamilyReviews([match, { ...match, familyId: 'other' }]);
  expect(result).toHaveLength(2);
  expect(result[0].parents[0].key).not.toBe(result[1].parents[0].key);
  expect(buildInquiryFamilyReviews([match], 'mother')[0].parents).toEqual([]);
  expect(buildInquiryFamilyReviews([match], 'guardian')[0].parents).toEqual([]);
});
it.each([
  [{ ...match, matchByEmail: true }, '', 'This email matches a saved parent.'],
  [{ ...match, matchByMobile: true }, '', 'This mobile number matches a saved parent.'],
  [
    { ...match, matchByMobile: true, matchByEmail: true },
    '',
    'This mobile number and email match a saved parent.',
  ],
] as const)('explains the actual contact match %j', (row, phone, copy) => {
  expect(inquiryContactMatchText([row], phone)).toBe(copy);
});

it('does not claim both contacts match one parent when they match different records', () => {
  expect(
    inquiryContactMatchText(
      [
        { ...match, matchByEmail: true },
        { ...match, familyId: 'other-family', matchByMobile: true },
      ],
      ''
    )
  ).toBe('These contact details match existing records. Select a parent to review.');
});
