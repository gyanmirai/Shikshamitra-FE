export const applicantReturnStoragePrefix = 'student-enrollment:applicant-return:v2:';
export const applicantRestoreStoragePrefix = 'student-enrollment:applicant-restore:v2:';

export type ApplicantReturnContext = {
  version: 2;
  expiresAt: number;
  returnTo: string;
  scrollTop: number;
  scrollLeft: number;
  focusLeadId: string;
};

const enrollmentOrigin = 'https://enrollment.shikshamitra.local';

export const isSafeApplicantReturnPath = (returnTo: string) => {
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return false;
  try {
    const url = new URL(returnTo, enrollmentOrigin);
    return (
      url.origin === enrollmentOrigin &&
      url.pathname.startsWith('/student/enrollment/') &&
      !url.pathname.startsWith('/student/enrollment/applicants/')
    );
  } catch {
    return false;
  }
};

export const createApplicantReturnContext = ({
  returnTo,
  focusLeadId,
  scrollTop,
  scrollLeft,
  expiresAt,
}: Omit<ApplicantReturnContext, 'version'>): ApplicantReturnContext => ({
  version: 2,
  expiresAt,
  returnTo,
  scrollTop: Math.max(0, scrollTop),
  scrollLeft: Math.max(0, scrollLeft),
  focusLeadId,
});

export const parseApplicantReturnContext = (
  serialized: string | null
): ApplicantReturnContext | undefined => {
  if (!serialized) return undefined;
  try {
    const stored = JSON.parse(serialized) as Partial<ApplicantReturnContext>;
    if (
      stored.version !== 2 ||
      typeof stored.expiresAt !== 'number' ||
      stored.expiresAt <= Date.now() ||
      typeof stored.returnTo !== 'string' ||
      !isSafeApplicantReturnPath(stored.returnTo) ||
      typeof stored.focusLeadId !== 'string' ||
      stored.focusLeadId.length === 0 ||
      stored.focusLeadId.length > 160
    ) {
      return undefined;
    }
    return createApplicantReturnContext({
      expiresAt: stored.expiresAt,
      returnTo: stored.returnTo,
      focusLeadId: stored.focusLeadId,
      scrollTop:
        typeof stored.scrollTop === 'number' && Number.isFinite(stored.scrollTop)
          ? stored.scrollTop
          : 0,
      scrollLeft:
        typeof stored.scrollLeft === 'number' && Number.isFinite(stored.scrollLeft)
          ? stored.scrollLeft
          : 0,
    });
  } catch {
    return undefined;
  }
};
