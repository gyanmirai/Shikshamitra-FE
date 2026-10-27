import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

export function inquirySchoolContact(
  inquiry: Pick<
    AdmissionInquiry,
    'applicantName' | 'normalizedPhone' | 'email' | 'mainSchoolContact'
  >
) {
  const saved = inquiry.mainSchoolContact;
  const relationship = saved
    ? saved.relationship === 'guardian'
      ? saved.relationshipLabel?.trim()
        ? `Guardian (${saved.relationshipLabel.trim()})`
        : 'Guardian'
      : saved.relationship === 'father'
        ? 'Father'
        : 'Mother'
    : null;
  const mobile = (saved ? saved.mobile : inquiry.normalizedPhone)?.trim() || null;
  const email = (saved ? saved.email : inquiry.email)?.trim() || null;
  return {
    fullName: saved
      ? saved.fullName.trim() || relationship || 'Main school contact'
      : inquiry.applicantName,
    relationship,
    mobile,
    email,
    defaultChannels: mobile ? [1] : email ? [2] : [],
  };
}
