import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { HrReportScheduleDialog } from './HrReportScheduleDialog';

const mocks = vi.hoisted(() => ({
  useGetHrReportRecipientsQuery: vi.fn(),
}));

vi.mock('src/redux/hr/hrReportsApi', () => ({
  useGetHrReportRecipientsQuery: mocks.useGetHrReportRecipientsQuery,
}));

describe('HrReportScheduleDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useGetHrReportRecipientsQuery.mockReturnValue({
      data: [],
      isFetching: false,
    });
  });

  it('submits the configured schedule values', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <HrReportScheduleDialog
        open
        defaultValue={{
          name: 'Employee Report Schedule',
          frequency: 'monthly',
          deliveryMode: 'inApp',
          firstRunAt: '',
          recipients: [],
        }}
        isSubmitting={false}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    await user.clear(screen.getByLabelText('Schedule Name'));
    await user.type(screen.getByLabelText('Schedule Name'), 'Leadership Snapshot');
    await user.type(screen.getByLabelText('First Run'), '2026-07-01T09:30');
    expect(screen.getByText('Next 3 runs')).toBeVisible();
    expect(screen.getByText('01 Jul 2026, 09:30 AM')).toBeVisible();
    await user.click(screen.getByTestId('hr-report-schedule-submit-button'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Leadership Snapshot',
        frequency: 'monthly',
        deliveryMode: 'inApp',
        firstRunAt: '2026-07-01T09:30',
        recipients: [],
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.useGetHrReportRecipientsQuery).toHaveBeenCalledWith(
      { filter: '', maxResultCount: 20 },
      { skip: false }
    );
  });

  it('does not load recipients while closed', () => {
    render(
      <HrReportScheduleDialog
        open={false}
        defaultValue={{
          name: 'Employee Report Schedule',
          frequency: 'monthly',
          deliveryMode: 'inApp',
          firstRunAt: '',
          recipients: [],
        }}
        isSubmitting={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(mocks.useGetHrReportRecipientsQuery).toHaveBeenCalledWith(
      { filter: '', maxResultCount: 20 },
      { skip: true }
    );
  });
});
