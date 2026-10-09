import { studentPaths } from 'src/constants/student-menu';

import { getApplicationReturnUrl } from '../application-detail/application-return-url';

/** Recover old applicant bookmarks into the originating admission list and its drawer. */
export function getApplicantApplicationUrl(returnTo: string | null, applicationId: string) {
  const safe = getApplicationReturnUrl(returnTo);
  const [pathname, query] = safe.split('?');
  const params = new URLSearchParams(query);
  params.set('application', applicationId);
  return `${pathname}?${params}`;
}

export function getApplicantReturnUrl(returnTo: string | null, inquiryId: string | null) {
  return inquiryId
    ? `${studentPaths.enrollment.inquiries}?${new URLSearchParams({ inquiryId })}`
    : getApplicationReturnUrl(returnTo);
}
