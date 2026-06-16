import type { HrReportRequest } from 'src/redux/hr/hrReportsApi';

import { it, expect, describe } from 'vitest';

import {
  buildHrReportScheduleRequest,
  createDefaultHrReportScheduleForm,
} from './useHrReportSchedules';

const definition: HrReportRequest = {
  reportType: 'Employee List',
  dataSource: 'employee',
  format: 'excel',
  page: 1,
  pageSize: 50,
  columns: ['employeeCode', 'employeeName'],
  filters: {},
};

describe('useHrReportSchedules helpers', () => {
  it('creates schedule dialog defaults with the current user implicit', () => {
    expect(createDefaultHrReportScheduleForm('Employee List')).toEqual({
      name: 'Employee List Schedule',
      frequency: 'monthly',
      deliveryMode: 'inApp',
      firstRunAt: '',
      recipients: [],
    });
  });

  it('falls back to a generic schedule name when report name is blank', () => {
    expect(createDefaultHrReportScheduleForm('').name).toBe('HR Report Schedule');
  });

  it('builds a backend-compatible schedule request', () => {
    expect(
      buildHrReportScheduleRequest(
        {
          name: 'Monthly HR Snapshot',
          frequency: 'weekly',
          deliveryMode: 'inAppAndEmail',
          firstRunAt: '2026-07-01T09:30',
          recipients: [
            {
              id: 'user-1',
              displayName: 'Asha Patel',
              email: 'asha@example.com',
            },
          ],
        },
        definition,
        'template-1'
      )
    ).toEqual({
      name: 'Monthly HR Snapshot',
      templateId: 'template-1',
      frequency: 'weekly',
      deliveryMode: 'inAppAndEmail',
      firstRunAt: '2026-07-01T09:30',
      recipientUserIds: ['user-1'],
      definition,
    });
  });

  it('omits an empty first-run override', () => {
    expect(
      buildHrReportScheduleRequest(
        {
          name: 'Monthly HR Snapshot',
          frequency: 'monthly',
          deliveryMode: 'inApp',
          firstRunAt: '',
          recipients: [],
        },
        definition
      ).firstRunAt
    ).toBeUndefined();
  });
});
