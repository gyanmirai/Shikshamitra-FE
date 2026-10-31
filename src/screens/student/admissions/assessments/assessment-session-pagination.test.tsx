import type { ReactElement } from 'react';
import type { AssessmentBookingPreview } from 'src/redux/student/admissions/admission-assessment-types';

import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AssessmentSessionsPanel } from './assessment-sessions-panel';
import { AssessmentSessionBookingPreview } from './assessment-session-booking-preview';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const preview: AssessmentBookingPreview = {
  items: [
    {
      applicationId: 'application',
      stageInstanceId: 'stage-instance',
      applicationNumber: 'APP-QA-001',
      applicantName: 'QA Applicant',
      admissionOfferingId: 'offering',
      workflowStageDefinitionId: 'stage',
      concurrencyStamp: 'application-version',
    },
  ],
  proposedBookings: [],
  totalCount: 75,
  eligibleCount: 75,
  availableCount: 75,
  remainingCount: 0,
  requiresRoomApproval: false,
  roomName: 'Exam room',
  buildingName: 'Main',
  floorName: 'Ground',
  previewFingerprint: 'preview',
  slots: [],
  warnings: [],
};

function PaginationHarness({
  surface,
  initialPage = 0,
  onPage,
}: {
  surface: 'preview' | 'manage';
  initialPage?: number;
  onPage: (page: number, size: number) => void;
}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(25);
  const changePage = (nextPage: number, size: number) => {
    onPage(nextPage, size);
    setPage(nextPage);
    setPageSize(size);
  };
  return surface === 'preview' ? (
    <AssessmentSessionBookingPreview
      preview={preview}
      scopes={[]}
      selected={[]}
      onChange={vi.fn()}
      disabled={false}
      page={page}
      pageSize={pageSize}
      onPage={changePage}
      onSearch={vi.fn()}
      isLoading={false}
      onRetry={vi.fn()}
    />
  ) : (
    <AssessmentSessionsPanel
      search=""
      sessions={[
        {
          id: 'session',
          admissionOfferingId: 'offering',
          workflowStageDefinitionId: 'stage',
          name: 'QA Exam',
          startsAt: '2027-01-01T04:30:00Z',
          endsAt: '2027-01-01T05:30:00Z',
          location: 'Exam room',
          capacity: 75,
          bookedCount: 0,
          isCancelled: false,
          concurrencyStamp: 'session-version',
          scopeDetails: [
            {
              className: 'Class 1',
              admissionOfferingId: 'offering',
              offeringName: 'Primary',
              workflowStageDefinitionId: 'stage',
              stageName: 'Exam',
              workflowDefinitionId: 'workflow',
              workflowVersion: 1,
              schedulingEnabled: true,
            },
          ],
        },
      ]}
      totalCount={75}
      page={page}
      pageSize={pageSize}
      isLoading={false}
      canManage={false}
      onSelect={vi.fn()}
      onEdit={vi.fn()}
      onCancel={vi.fn()}
      onPage={changePage}
      onSearch={vi.fn()}
      onRetry={vi.fn()}
    />
  );
}

const renderSurface = (element: ReactElement) =>
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>{element}</ThemeProvider>
  );

it('shows session classes and room as scan-friendly columns', () => {
  renderSurface(<PaginationHarness surface="manage" onPage={vi.fn()} />);
  expect(screen.getByRole('columnheader', { name: 'Classes' })).toBeVisible();
  expect(screen.getByRole('columnheader', { name: 'Room' })).toBeVisible();
  expect(screen.getByRole('table', { name: 'Assessment sessions table' })).toBeVisible();
  expect(screen.getByText('Class 1')).toBeVisible();
  expect(screen.getByText('Exam room')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Export' })).toBeVisible();
});

it.each(['preview', 'manage'] as const)(
  '%s uses the real shared table to move through consecutive pages without skipping records',
  async (surface) => {
    const onPage = vi.fn();
    renderSurface(<PaginationHarness surface={surface} onPage={onPage} />);
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onPage).toHaveBeenLastCalledWith(1, 25);
    expect(screen.getByText('26–50 of 75')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(onPage).toHaveBeenLastCalledWith(2, 25);
    expect(screen.getByText('51–75 of 75')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Go to previous page' }));
    expect(onPage).toHaveBeenLastCalledWith(1, 25);
    expect(screen.getByText('26–50 of 75')).toBeVisible();
  }
);

it.each(['preview', 'manage'] as const)(
  '%s returns to the first page when the real shared table changes page size',
  async (surface) => {
    const onPage = vi.fn();
    renderSurface(<PaginationHarness surface={surface} initialPage={2} onPage={onPage} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Rows per page:' }));
    await userEvent.click(screen.getByRole('option', { name: '50' }));
    expect(onPage).toHaveBeenLastCalledWith(0, 50);
    expect(screen.getByText('1–50 of 75')).toBeVisible();
  }
);
