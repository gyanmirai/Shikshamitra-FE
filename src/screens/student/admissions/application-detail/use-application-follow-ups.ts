import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetAdmissionApplicationFollowUpsQuery,
  useCancelAdmissionApplicationFollowUpMutation,
  useScheduleAdmissionApplicationFollowUpMutation,
  useCompleteAdmissionApplicationFollowUpMutation,
} from 'src/redux/student/admissions/admission-application-follow-ups-api';

import type { InquiryFollowUpActions } from '../inquiry-management/inquiry-follow-ups';

export function useApplicationFollowUps(applicationId: string, skip = false) {
  const query = useGetAdmissionApplicationFollowUpsQuery(applicationId, {
    skip: skip || !applicationId,
    refetchOnMountOrArgChange: true,
  });
  const [schedule, scheduling] = useScheduleAdmissionApplicationFollowUpMutation();
  const [complete, completing] = useCompleteAdmissionApplicationFollowUpMutation();
  const [cancel, cancelling] = useCancelAdmissionApplicationFollowUpMutation();
  const value = query.currentData;
  const problem = query.isError ? parseApiProblemDetail(query.error) : undefined;
  const sourceUnavailable = Boolean(
    (query.error && 'status' in query.error && query.error.status === 404) ||
    problem?.detail.startsWith('The source inquiry is unavailable.')
  );
  const requireValue = () => {
    if (!value) throw new Error('Follow-ups have not loaded yet.');
    return value;
  };
  const actions: InquiryFollowUpActions = {
    schedule: (body) =>
      schedule({
        applicationId,
        concurrencyStamp: requireValue().concurrencyStamp,
        ...body,
      }).unwrap(),
    complete: (item, note) =>
      complete({
        applicationId,
        followUpId: item.id,
        concurrencyStamp: requireValue().concurrencyStamp,
        followUpConcurrencyStamp: item.concurrencyStamp,
        note,
      }).unwrap(),
    cancel: (item, note) =>
      cancel({
        applicationId,
        followUpId: item.id,
        concurrencyStamp: requireValue().concurrencyStamp,
        followUpConcurrencyStamp: item.concurrencyStamp,
        note,
      }).unwrap(),
  };
  return {
    query,
    value,
    actions,
    problem,
    sourceUnavailable,
    saving: scheduling.isLoading || completing.isLoading || cancelling.isLoading,
  };
}
