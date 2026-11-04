import type {
  DuplicateMatch,
  AdmissionInquiry,
} from 'src/redux/student/admissions/admission-inquiries-api';

export function inquiryFamilyConfirmationVisible(inquiry: AdmissionInquiry, readOnly: boolean) {
  return (
    !readOnly &&
    [0, 1, 3].includes(inquiry.status) &&
    !inquiry.applicationId &&
    !inquiry.isTransferred &&
    !inquiry.isDuplicate
  );
}

export function inquiryFamilyConfirmationReason(
  inquiry: AdmissionInquiry,
  readOnly: boolean,
  dirty: boolean,
  busy: boolean
): string | null {
  if (!inquiryFamilyConfirmationVisible(inquiry, readOnly))
    return 'Only an editable pending inquiry can be confirmed as a sibling.';
  if (!inquiry.applicantId || !inquiry.concurrencyStamp?.trim())
    return 'Reload this inquiry before confirming siblings.';
  if (busy) return 'Wait for the current inquiry operation to finish.';
  if (dirty) return 'Save or discard your inquiry changes before confirming siblings.';
  return null;
}

const validId = (id: string | null | undefined) =>
  Boolean(id?.trim() && id !== '00000000-0000-0000-0000-000000000000');
export const inquiryFamilyCandidateKey = (match: DuplicateMatch) =>
  `${match.familyId}:${match.applicantId}`;
export const inquiryFamilyParentKey = (parent: NonNullable<DuplicateMatch['parents']>[number]) =>
  `${parent.sourceApplicantId}:${parent.relationship ?? 'parent'}`;

export function inquiryFamilyCandidates(inquiry: AdmissionInquiry, matches: DuplicateMatch[]) {
  const seen = new Set<string>();
  return matches.flatMap((match) => {
    if (
      !validId(match.familyId) ||
      !validId(match.applicantId) ||
      match.applicantId === inquiry.applicantId ||
      match.existingInquiryId === inquiry.id ||
      match.canLinkFamily === false ||
      seen.has(inquiryFamilyCandidateKey(match))
    )
      return [];
    const parents = (match.parents ?? []).filter(
      (parent) =>
        validId(parent.sourceApplicantId) &&
        parent.sourceApplicantId !== inquiry.applicantId &&
        parent.sourceApplicantId === match.applicantId &&
        Boolean(parent.name?.trim()) &&
        (parent.relationship == null || ['father', 'mother'].includes(parent.relationship))
    );
    if (!parents.length) return [];
    seen.add(inquiryFamilyCandidateKey(match));
    return [{ ...match, parents }];
  });
}
