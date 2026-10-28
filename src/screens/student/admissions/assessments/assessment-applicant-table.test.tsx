import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import { assessmentResponse } from 'src/redux/student/admissions/assessment-test-fixture';

import { AssessmentApplicantTable } from './assessment-applicant-table';

vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => ({
    view: true,
    book: true,
    attendance: true,
    results: true,
    waive: true,
  }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

const row = (id: string, overrides: Partial<AssessmentRosterItem> = {}): AssessmentRosterItem => ({
  applicationId: `application-${id}`,
  applicationNumber: `APP-${id}`,
  applicantId: `applicant-${id}`,
  applicantName: id,
  stageInstanceId: `stage-${id}`,
  stageName: 'Assessment',
  applicationStatus: 1,
  stageStatus: 1,
  isActive: true,
  status: 'pending',
  queue: 'toBook',
  assessment: assessmentResponse,
  ...overrides,
});

const renderTable = (
  items: AssessmentRosterItem[],
  onSelectionChange = vi.fn(),
  selectedIds: ReadonlySet<string> = new Set(),
  onDetails = vi.fn()
) =>
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AssessmentApplicantTable
        items={items}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        canAdvance
        onAction={vi.fn()}
        onDetails={onDetails}
      />
    </ThemeProvider>
  );

it('merges the outcome into Status and shows waived attendance as not required', () => {
  renderTable([
    row('Waived student', {
      status: 'complete',
      queue: 'completed',
      isActive: false,
      assessment: {
        ...assessmentResponse,
        attempts: [
          {
            id: 'waived',
            createdAt: '2026-10-28T09:00:00Z',
            attemptNumber: 1,
            attendance: 'pending',
            status: 'completed',
            outcome: 'waived',
            concurrencyStamp: 'stamp',
          },
        ],
      },
    }),
  ]);
  expect(screen.queryByRole('columnheader', { name: /^Result\b/ })).not.toBeInTheDocument();
  const student = within(
    screen.getByRole('row', { name: 'Assessment details for Waived student' })
  );
  expect(student.getByText('Not required')).toBeInTheDocument();
  expect(student.getByText('Waived')).toBeInTheDocument();
  expect(student.queryByText('Pending')).not.toBeInTheDocument();
  expect(student.queryByText('Complete')).not.toBeInTheDocument();
});

it('places Status before the final Action column and opens read-only details from its button', () => {
  const onDetails = vi.fn();
  renderTable(
    [row('History action', { isActive: false, queue: 'completed' })],
    vi.fn(),
    new Set(),
    onDetails
  );
  const headers = screen.getAllByRole('columnheader').map((header) => header.textContent?.trim());
  expect(headers.slice(-2)).toEqual(['Status', 'Action']);
  expect(screen.queryByRole('columnheader', { name: /^Next action\b/ })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'View details for History action' }));
  expect(onDetails).toHaveBeenCalledOnce();
});

it('exposes real scalar filters while leaving combined identity and next-action controls unfilterable', async () => {
  const onServerFilter = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AssessmentApplicantTable
        items={[row('Sam')]}
        canAdvance
        onAction={vi.fn()}
        onDetails={vi.fn()}
        onServerFilter={onServerFilter}
      />
    </ThemeProvider>
  );
  expect(screen.queryByRole('button', { name: 'Filter Student name' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Filter Next action' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Filter Attendance' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Attendance *' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Absent' }));
  fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
  await waitFor(() =>
    expect(onServerFilter).toHaveBeenCalledWith([
      expect.objectContaining({
        column: 'attendance',
        type: 'equals',
        value: 'absent',
        valueType: 'enum',
      }),
    ])
  );
});

it('selects an active row without opening details and supports select-all for eligible rows only', () => {
  const pending = row('Pending student');
  const ready = row('Ready student', {
    status: 'complete',
    queue: 'ready',
    assessment: { ...assessmentResponse, canComplete: true },
  });
  const history = row('History student', {
    isActive: false,
    status: 'complete',
    queue: 'completed',
  });
  const onSelection = vi.fn();
  const onDetails = vi.fn();
  renderTable([pending, ready, history], onSelection, new Set(), onDetails);

  fireEvent.click(screen.getByRole('checkbox', { name: 'Select Pending student' }));
  expect(onSelection).toHaveBeenLastCalledWith([expect.objectContaining(pending)], true);
  expect(onDetails).not.toHaveBeenCalled();
  expect(screen.getByRole('checkbox', { name: 'Select Ready student' })).toBeEnabled();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select applicants on this page' }));
  expect(onSelection).toHaveBeenLastCalledWith([pending, ready], true);
  expect(screen.getByRole('checkbox', { name: 'Select History student' })).toBeDisabled();
});

it('shows partial selection and lets select-all clear the eligible rows', () => {
  const first = row('First');
  const second = row('Second');
  const onSelection = vi.fn();
  const view = renderTable([first, second], onSelection, new Set([first.stageInstanceId]));
  expect(screen.getByRole('checkbox', { name: 'Select First' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Select applicants on this page' })).toHaveAttribute(
    'data-indeterminate',
    'true'
  );
  view.unmount();
  renderTable(
    [first, second],
    onSelection,
    new Set([first.stageInstanceId, second.stageInstanceId])
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select applicants on this page' }));
  expect(onSelection).toHaveBeenLastCalledWith([first, second], false);
});

it('keeps inactive and unmanaged assessment rows unavailable and explains why', async () => {
  const onDetails = vi.fn();
  renderTable(
    [
      row('History', { isActive: false }),
      row('Unmanaged', { assessment: { ...assessmentResponse, policy: null } }),
    ],
    vi.fn(),
    new Set(),
    onDetails
  );
  expect(screen.getByRole('checkbox', { name: 'Select applicants on this page' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'Select History' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'Select Unmanaged' })).toBeDisabled();
  expect(screen.getByRole('checkbox', { name: 'Select History' })).toHaveAttribute(
    'aria-description',
    'This assessment stage is no longer active. Open the student row to view its history.'
  );
  expect(screen.getByRole('checkbox', { name: 'Select Unmanaged' })).toHaveAttribute(
    'aria-description',
    'Managed assessment is not configured for this stage.'
  );
  expect(screen.getByRole('checkbox', { name: 'Select applicants on this page' })).toHaveAttribute(
    'aria-description',
    'No active managed assessments on this page. Open a student row to view assessment details.'
  );
  const help = screen.getByLabelText('Why selection is unavailable for History');
  expect(help).toHaveAttribute('tabindex', '0');
  expect(help.getAttribute('title')).toContain('no longer active');
  fireEvent.mouseOver(help);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'This assessment stage is no longer active.'
  );
  fireEvent.click(help);
  expect(onDetails).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('row', { name: 'Assessment details for History' }));
  expect(onDetails).toHaveBeenCalledOnce();
});
