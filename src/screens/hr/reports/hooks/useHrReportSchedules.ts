import type { HrReportRequest, HrReportScheduleRequest } from 'src/redux/hr/hrReportsApi';

import { useCallback } from 'react';
import { useCreateHrReportScheduleMutation } from 'src/redux/hr/hrReportsApi';

import { hrReportToast } from '../hr-report-notifications';
import { DEFAULT_HR_REPORT_PAGE_SIZE } from '../hr-report-utils';

import type { HrReportScheduleFormState } from '../hr-report-types';

type UseHrReportSchedulesInput = {
  templateId?: string;
  requestFor: (page?: number, pageSize?: number, format?: 'excel') => HrReportRequest;
};

export function buildHrReportScheduleRequest(
  form: HrReportScheduleFormState,
  definition: HrReportRequest,
  templateId?: string
): HrReportScheduleRequest {
  return {
    name: form.name,
    templateId,
    frequency: form.frequency,
    deliveryMode: form.deliveryMode,
    recipientUserIds: form.recipients.map((recipient) => recipient.id),
    definition,
    firstRunAt: form.firstRunAt || undefined,
  };
}

export function createDefaultHrReportScheduleForm(reportName: string): HrReportScheduleFormState {
  return {
    name: `${reportName || 'HR Report'} Schedule`,
    frequency: 'monthly',
    deliveryMode: 'inApp',
    firstRunAt: '',
    recipients: [],
  };
}

export function useHrReportSchedules({ templateId, requestFor }: UseHrReportSchedulesInput) {
  const [createSchedule, { isLoading: isScheduling }] = useCreateHrReportScheduleMutation();

  const createReportSchedule = useCallback(
    async (form: HrReportScheduleFormState) => {
      const body = buildHrReportScheduleRequest(
        form,
        requestFor(1, DEFAULT_HR_REPORT_PAGE_SIZE, 'excel'),
        templateId
      );
      await createSchedule(body).unwrap();
      hrReportToast.success('Report schedule created');
    },
    [createSchedule, requestFor, templateId]
  );

  return {
    createReportSchedule,
    isScheduling,
  };
}
