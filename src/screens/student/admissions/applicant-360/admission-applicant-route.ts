import { studentPaths } from 'src/constants/student-menu';

import {
  getApplicationReturnUrl,
  getApplicationWorkspaceUrl,
} from '../application-detail/application-return-url';

/** Recover old applicant bookmarks into the full-page workspace with a safe return context. */
export function getApplicantApplicationUrl(returnTo: string | null, applicationId: string) {
  return getApplicationWorkspaceUrl(applicationId, returnTo);
}

export function getApplicantReturnUrl(returnTo: string | null, inquiryId: string | null) {
  return inquiryId
    ? `${studentPaths.enrollment.inquiries}?${new URLSearchParams({ inquiryId })}`
    : getApplicationReturnUrl(returnTo);
}
