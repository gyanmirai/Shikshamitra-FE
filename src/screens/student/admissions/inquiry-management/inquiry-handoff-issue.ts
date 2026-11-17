import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import { readOfferingConfigurationErrors } from '../admission-offering-recovery';

export type InquiryHandoffIssue = {
  inquiry: Pick<AdmissionInquiry, 'applicantName' | 'inquiryNumber'>;
  formName?: string | null;
  formDefinitionId?: string | null;
};

export function readInquiryHandoffIssue(
  error: unknown,
  inquiry: AdmissionInquiry
): InquiryHandoffIssue | null {
  const archived = readOfferingConfigurationErrors(error).find(
    (item) => item.code === 'InquiryFormNotPublished' && /\bis archived\b/i.test(item.message)
  );
  if (archived) {
    return { inquiry, formName: archived.formName, formDefinitionId: archived.formDefinitionId };
  }
  // Older APIs omit configuration metadata. Keep recovery visible, but never invent a form ID.
  const problem = parseApiProblemDetail(error);
  if (problem.errorCode !== 'Admissions.OfferingFormNotPublished') return null;
  const match = /Inquiry Form ['"](.+?)['"] is archived\b/i.exec(problem.detail);
  return match ? { inquiry, formName: match[1] } : null;
}
