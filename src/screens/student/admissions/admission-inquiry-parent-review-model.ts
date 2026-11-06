import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionFamilyParent } from 'src/redux/student/admissions/admission-parent-family-types';

export type InquiryParentOption = {
  key: string;
  match: DuplicateMatch;
  parent: AdmissionFamilyParent;
};
export type InquiryFamilyReview = {
  familyId: string;
  children: DuplicateMatch[];
  parents: InquiryParentOption[];
};

const text = (value?: string | null) => value?.trim().toLowerCase() ?? '';
const mobile = (value?: string | null) => {
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
};

/** Group only by saved family identity. Shared contacts never merge separate families. */
export function buildInquiryFamilyReviews(
  matches: DuplicateMatch[],
  relationship?: 'father' | 'mother' | 'guardian'
) {
  const families = new Map<string, InquiryFamilyReview>();
  const seenParents = new Map<string, Set<string>>();
  matches.forEach((match) => {
    if (!match.familyId || !match.applicantId) return;
    const group = families.get(match.familyId) ?? {
      familyId: match.familyId,
      children: [],
      parents: [],
    };
    if (!group.children.some((child) => child.applicantId === match.applicantId))
      group.children.push(match);
    const seen = seenParents.get(match.familyId) ?? new Set<string>();
    (match.parents ?? []).forEach((parent) => {
      if (
        !parent.sourceApplicantId ||
        !parent.name?.trim() ||
        (parent.relationship != null && !['father', 'mother'].includes(parent.relationship)) ||
        relationship === 'guardian' ||
        (relationship && parent.relationship && parent.relationship !== relationship)
      )
        return;
      // Equivalent snapshots in one family share a parent review, while preserving a real source.
      const identity = JSON.stringify([
        parent.relationship,
        text(parent.name),
        mobile(parent.mobile),
        text(parent.email),
      ]);
      if (seen.has(identity)) return;
      seen.add(identity);
      group.parents.push({
        key: JSON.stringify([match.familyId, parent.sourceApplicantId, parent.relationship]),
        match,
        parent,
      });
    });
    families.set(match.familyId, group);
    seenParents.set(match.familyId, seen);
  });
  return [...families.values()];
}

export function inquiryContactMatchText(matches: DuplicateMatch[], phone: string, email = '') {
  const matching = matches.map((match) => ({
    byPhone:
      match.matchByMobile === true ||
      Boolean(mobile(phone) && mobile(phone) === mobile(match.guardianPhone)),
    byEmail:
      match.matchByEmail === true ||
      Boolean(text(email) && text(email) === text(match.guardianEmail)),
  }));
  if (matching.some((match) => match.byPhone && match.byEmail))
    return 'This mobile number and email match a saved parent.';
  const byPhone = matching.some((match) => match.byPhone);
  const byEmail = matching.some((match) => match.byEmail);
  if (byPhone && byEmail)
    return 'These contact details match existing records. Select a parent to review.';
  if (byEmail) return 'This email matches a saved parent.';
  if (byPhone) return 'This mobile number matches a saved parent.';
  return 'Review the saved parent details before continuing.';
}
