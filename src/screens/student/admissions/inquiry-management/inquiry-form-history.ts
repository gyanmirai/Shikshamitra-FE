import type { AdmissionInquiryTimelineItem } from 'src/redux/student/admissions/admission-inquiries-api';

/** Status-only saves used the detail endpoint historically; keep them out of form history. */
export function isInquiryFormActivity(activity: AdmissionInquiryTimelineItem): boolean {
  if (activity.activityType === 'InquiryCreated') return true;
  if (activity.activityType !== 'InquiryDetailsUpdated') return false;
  if (!activity.metadataJson) return true;
  try {
    const metadata: unknown = JSON.parse(activity.metadataJson);
    if (!metadata || typeof metadata !== 'object') return true;
    const record = metadata as Record<string, unknown>;
    const after = record.After ?? record.after;
    if (!after || typeof after !== 'object') return true;
    const update = after as Record<string, unknown>;
    const formValues = update.FormValues ?? update.formValues;
    const status = update.Status ?? update.status;
    return formValues != null || status == null;
  } catch {
    return true;
  }
}
