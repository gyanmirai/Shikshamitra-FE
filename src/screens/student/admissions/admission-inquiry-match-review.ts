import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

type EnteredInquiryIdentity = {
  applicantName?: string;
  applicantDateOfBirth?: string | null;
  admissionCycleId?: string;
};

const normalizeName = (value?: string) => value?.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
const calendarDate = (value?: string | null) => value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

export function isPossibleDuplicateInquiry(match: DuplicateMatch, entered: EnteredInquiryIdentity) {
  if (
    !match.existingInquiryId ||
    !entered.admissionCycleId ||
    match.existingInquiryAdmissionCycleId !== entered.admissionCycleId ||
    !normalizeName(entered.applicantName) ||
    normalizeName(match.applicantName) !== normalizeName(entered.applicantName)
  )
    return false;
  const enteredBirthDate = calendarDate(entered.applicantDateOfBirth);
  const savedBirthDate = calendarDate(match.dateOfBirth);
  // A name match is a review signal, never authorization to merge or reject a child.
  return !enteredBirthDate || !savedBirthDate || enteredBirthDate === savedBirthDate;
}
