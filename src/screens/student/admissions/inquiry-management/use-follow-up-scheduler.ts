import type { Dayjs } from 'dayjs';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';

import type { InquiryFollowUpActions } from './inquiry-follow-ups';

/** Shared scheduling draft and command guard for inquiry, application and activity surfaces. */
export function useFollowUpScheduler({
  actions,
  blocked,
  onScheduled,
}: {
  actions: InquiryFollowUpActions;
  blocked: boolean;
  onScheduled?: () => void;
}) {
  const [purpose, setPurpose] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Dayjs | null>(null);
  const [dateError, setDateError] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const submitting = useRef(false);
  const schedule = async () => {
    if (blocked || submitting.current || dateError || !purpose.trim() || !scheduledAt?.isValid())
      return;
    submitting.current = true;
    setScheduling(true);
    setScheduleError('');
    try {
      await actions.schedule({ scheduledAt: scheduledAt.toISOString(), purpose: purpose.trim() });
      setPurpose('');
      setScheduledAt(null);
      onScheduled?.();
      shikshaMitraToast.success({ message: 'Follow-up scheduled' });
    } catch (error) {
      const problem = parseApiProblemDetail(error);
      const message =
        problem.detail === 'Something went wrong'
          ? 'Follow-up could not be scheduled. Reload and try again.'
          : problem.detail;
      setScheduleError(message);
      shikshaMitraToast.error({ message });
    } finally {
      submitting.current = false;
      setScheduling(false);
    }
  };
  return {
    purpose,
    setPurpose,
    scheduledAt,
    setScheduledAt,
    dateError,
    setDateError,
    scheduleError,
    scheduling,
    schedule,
    dirty: Boolean(purpose || scheduledAt),
  };
}
