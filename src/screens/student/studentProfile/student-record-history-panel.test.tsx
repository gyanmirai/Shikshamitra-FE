import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';

import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { StudentRecordHistoryPanel } from './student-record-history-panel';
import { customSource, customStudentId } from './student-custom-details-test-fixture';

const query = vi.hoisted(() => ({
  currentData: undefined as RecordChange | undefined,
  isFetching: false,
  isError: false,
  read: vi.fn(),
  refetch: vi.fn(),
}));
const diff = vi.hoisted(() => ({
  diffs: [{ label: 'Blood group', before: 'B+', after: 'O+' }],
  isLoading: false,
  isError: false,
  read: vi.fn(),
  retry: vi.fn(),
}));
vi.mock('src/redux/student/records/student-record-changes-api', () => ({
  useGetStudentRecordChangeQuery: (id: string, options: { skip: boolean }) => {
    query.read(id, options);
    return {
      currentData: options.skip ? undefined : query.currentData,
      isFetching: options.skip ? false : query.isFetching,
      isError: options.skip ? false : query.isError,
      refetch: query.refetch,
    };
  },
}));
vi.mock('src/screens/student/records/student-record-change-diff', () => ({
  useProfileChangeDiff: (selected: RecordChange | undefined, sources: unknown[]) => {
    diff.read(selected, sources);
    return {
      diffs: selected?.payloadMasked || !selected ? [] : diff.diffs,
      isLoading: diff.isLoading,
      isError: diff.isError,
      retry: diff.retry,
    };
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const student = { id: customStudentId, studentId: customStudentId };
const source = customSource([], {});
const change: RecordChange = {
  id: 'change-1',
  studentId: customStudentId,
  studentName: 'Riya Shah',
  academicYearId: 'year-1',
  requestedBy: 'staff-1',
  requestedByName: 'Anita Shah',
  section: 'registration-form',
  action: 'Update',
  reason: 'Verified with guardian',
  status: 'Applied',
  concurrencyStamp: 'stamp-1',
  effectiveAt: '2026-10-13T08:00:00Z',
  creationTime: '2026-10-13T08:00:00Z',
  appliedAt: '2026-10-13T08:00:00Z',
  approvalCount: 0,
  requiredApprovals: 0,
  canApprove: false,
  canCancel: false,
  payloadMasked: false,
  decisions: [],
};
type Props = Parameters<typeof StudentRecordHistoryPanel>[0];

function renderAudit(overrides: Partial<Props> = {}) {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordHistoryPanel
        student={student}
        changes={[change]}
        sources={[source]}
        canReadChanges
        {...overrides}
      />
    </ThemeProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  query.currentData = change;
  query.isFetching = false;
  query.isError = false;
  diff.isError = false;
  diff.isLoading = false;
});

it('shows a newest-first read-only audit timeline without an enrollment table or page redirects', () => {
  const older = {
    ...change,
    id: 'older',
    section: 'family' as const,
    creationTime: '2026-10-12T08:00:00Z',
    appliedAt: undefined,
    status: 'Pending',
    reason: 'Older family correction',
  };
  renderAudit({ changes: [older, change] });
  const timeline = screen.getByRole('list', { name: 'Student record audit history' });
  const events = within(timeline).getAllByRole('listitem');
  expect(within(events[0]).getByText('Registration form updated')).toBeVisible();
  expect(within(events[1]).getByText('Pending')).toBeVisible();
  expect(within(events[1]).getByText('Not applied')).toBeVisible();
  expect(screen.getAllByText(/Submitted by Anita Shah/)).toHaveLength(2);
  expect(screen.getByText('All academic years · Newest first')).toBeVisible();
  expect(screen.queryByText('Enrollment history')).not.toBeInTheDocument();
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
  expect(screen.queryAllByRole('link')).toHaveLength(0);
  expect(query.read).toHaveBeenCalledWith('', { skip: true });
});

it('lazily shows source-bound before and after values with actor and reason inside the profile', async () => {
  renderAudit();
  expect(diff.read).toHaveBeenLastCalledWith(undefined, [source]);
  await userEvent.click(
    screen.getByRole('button', { name: 'View Registration form change history' })
  );
  const dialog = screen.getByRole('dialog', { name: 'Record Change History' });
  expect(within(dialog).getByText('Anita Shah')).toBeVisible();
  expect(within(dialog).getByText('Verified with guardian')).toBeVisible();
  expect(within(dialog).getByText('Blood group')).toBeVisible();
  expect(within(dialog).getByText('B+')).toBeVisible();
  expect(within(dialog).getByText('O+')).toBeVisible();
  expect(diff.read).toHaveBeenLastCalledWith(change, [source]);
  expect(query.read).toHaveBeenLastCalledWith('change-1', { skip: false });
  expect(within(dialog).queryAllByRole('link')).toHaveLength(0);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  expect(query.read).toHaveBeenLastCalledWith('', { skip: true });
});

it('masks payloads and reasons while preserving permitted audit attribution', async () => {
  const masked = { ...change, payloadMasked: true };
  query.currentData = masked;
  renderAudit({ changes: [masked] });
  expect(screen.queryByText('Verified with guardian')).not.toBeInTheDocument();
  await userEvent.click(
    screen.getByRole('button', { name: 'View Registration form change history' })
  );
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('These details are restricted by school policy.')).toBeVisible();
  expect(within(dialog).getByText('Anita Shah')).toBeVisible();
  expect(within(dialog).queryByText('Blood group')).not.toBeInTheDocument();
});

it('does not display cached audit detail from another student', async () => {
  query.currentData = { ...change, studentId: 'another-student' };
  renderAudit();
  await userEvent.click(
    screen.getByRole('button', { name: 'View Registration form change history' })
  );
  expect(within(screen.getByRole('dialog')).queryByText('Anita Shah')).not.toBeInTheDocument();
  expect(
    within(screen.getByRole('dialog')).getByText(
      'This audit entry is not available for this student.'
    )
  ).toBeVisible();
  expect(diff.read).toHaveBeenLastCalledWith(undefined, [source]);
});

it('does not fetch or render audit entries when access is unavailable', () => {
  renderAudit({ canReadChanges: false });
  expect(screen.getByText(/not available with your current access/)).toBeVisible();
  expect(screen.queryByRole('button', { name: /View .* change history/ })).not.toBeInTheDocument();
  expect(query.read).toHaveBeenCalledWith('', { skip: true });
  expect(screen.queryByText('Verified with guardian')).not.toBeInTheDocument();
});

it('distinguishes a list error from empty history and retries without leaving the profile', async () => {
  const retry = vi.fn();
  renderAudit({ changes: [], isError: true, onRetry: retry });
  expect(
    screen.getByText('Record change history could not be loaded.', { exact: false })
  ).toBeVisible();
  expect(screen.queryByText('No record changes yet')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Retry History' }));
  expect(retry).toHaveBeenCalledOnce();
});

it('locks dismissal during the detail read and provides a local retry for read failures', async () => {
  query.currentData = undefined;
  query.isFetching = true;
  const view = renderAudit();
  await userEvent.click(
    screen.getByRole('button', { name: 'View Registration form change history' })
  );
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByRole('button', { name: 'Close' })).toBeDisabled();
  query.isFetching = false;
  query.isError = true;
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentRecordHistoryPanel
        student={student}
        changes={[change]}
        sources={[source]}
        canReadChanges
      />
    </ThemeProvider>
  );
  await userEvent.click(within(dialog).getByRole('button', { name: 'Retry' }));
  expect(query.refetch).toHaveBeenCalledOnce();
  expect(within(dialog).getByRole('button', { name: 'Close' })).toBeEnabled();
});

it('retries source labels without displaying a partial diff when label resolution fails', async () => {
  diff.isError = true;
  renderAudit();
  await userEvent.click(
    screen.getByRole('button', { name: 'View Registration form change history' })
  );
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).queryByText('B+')).not.toBeInTheDocument();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Retry Labels' }));
  expect(diff.retry).toHaveBeenCalledOnce();
});

it('requests zero-based server pages so older history remains reachable', async () => {
  const onPageChange = vi.fn();
  renderAudit({ totalCount: 60, pageSize: 25, page: 0, onPageChange });
  expect(screen.getByText('1–25 of 60 entries')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
  expect(onPageChange).toHaveBeenCalledWith(1);
});
