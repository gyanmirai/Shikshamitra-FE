import type { DuplicateMatch } from 'src/redux/student/admissions/admission-inquiries-api';

type EnteredInquiryIdentity = {
  applicantName?: string;
  applicantDateOfBirth?: string | null;
  admissionCycleId?: string;
  guardianPhone?: string;
};

const normalizeName = (value?: string) => value?.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
const calendarDate = (value?: string | null) => value?.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
const mobileDigits = (value?: string | null) => (value ?? '').replace(/\D/g, '');

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
  const enteredMobile = mobileDigits(entered.guardianPhone);
  const sameMobile =
    match.existingInquiryMatchesMobile ??
    (enteredMobile.length === 10 && enteredMobile === mobileDigits(match.guardianPhone));
  return sameMobile || Boolean(enteredBirthDate && enteredBirthDate === savedBirthDate);
}
