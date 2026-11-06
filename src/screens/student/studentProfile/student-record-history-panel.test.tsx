import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';

import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor } from '@testing-library/react';

import { StudentRecordHistoryPanel } from './student-record-history-panel';
import { customSource, customStudentId } from './student-custom-details-test-fixture';

const query = vi.hoisted(() => ({
  currentData: undefined as RecordChange | undefined,
  isFetching: false,
  isError: false,
  read: vi.fn(),
  refetch: vi.fn(),
}));
const toast = vi.hoisted(() => ({
  error: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string | number) => AlertProps }) =>
      'history-error'
  ),
  dismiss: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
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

function renderToastAction() {
  return render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      {toast.error.mock.calls.at(-1)?.[0].alertProps('history-error').action}
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

it('offers keyboard-accessible audit scope help while retaining the saved timeline', async () => {
  renderAudit();
  expect(screen.getByRole('heading', { name: 'Audit History' })).toBeVisible();
  const timeline = screen.getByRole('list', { name: 'Student record audit history' });
  const help = screen.getByRole('button', { name: 'Audit History information' });
  await userEvent.keyboard('{Tab}');
  act(() => help.focus());
  expect(help).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    'Student record changes across academic years, with their recorded status, actor and dates.'
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  expect(screen.getByRole('list', { name: 'Student record audit history' })).toBe(timeline);
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

it('keeps list recovery in the error toast without empty history or an orphan retry', async () => {
  const retry = vi.fn();
  renderAudit({ changes: [], isError: true, onRetry: retry });
  expect(toast.error).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'Record change history could not be loaded.' })
  );
  expect(screen.queryByRole('button', { name: /Retry history/i })).not.toBeInTheDocument();
  expect(screen.queryByText('No record changes yet')).not.toBeInTheDocument();
  const recovery = renderToastAction();
  await userEvent.click(within(recovery.container).getByRole('button', { name: /Retry history/i }));
  expect(retry).toHaveBeenCalledOnce();
});

it('locks dismissal during the detail read and reports read failures as a toast', async () => {
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
  expect(toast.error).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'This audit entry could not be loaded.' })
  );
  expect(within(dialog).queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  expect(
    within(dialog).queryByText('This audit entry is not available for this student.')
  ).not.toBeInTheDocument();
  const recovery = renderToastAction();
  await userEvent.click(within(recovery.container).getByRole('button', { name: 'Retry' }));
  expect(query.refetch).toHaveBeenCalledOnce();
  recovery.unmount();
  expect(within(dialog).getByRole('button', { name: 'Close' })).toBeEnabled();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  expect(query.read).toHaveBeenLastCalledWith('', { skip: true });
});

it('reports a label lookup error as a toast without displaying a partial diff', async () => {
  diff.isError = true;
  renderAudit();
  await userEvent.click(
    screen.getByRole('button', { name: 'View Registration form change history' })
  );
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).queryByText('B+')).not.toBeInTheDocument();
  expect(within(dialog).queryByText('O+')).not.toBeInTheDocument();
  expect(toast.error).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'Changed field labels could not be loaded.' })
  );
  expect(within(dialog).queryByRole('button', { name: /Retry labels/i })).not.toBeInTheDocument();
  const recovery = renderToastAction();
  await userEvent.click(within(recovery.container).getByRole('button', { name: /Retry labels/i }));
  expect(diff.retry).toHaveBeenCalledOnce();
});

it('requests zero-based server pages so older history remains reachable', async () => {
  const onPageChange = vi.fn();
  renderAudit({ totalCount: 60, pageSize: 25, page: 0, onPageChange });
  expect(screen.getByText('1–25 of 60 entries')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
  expect(onPageChange).toHaveBeenCalledWith(1);
});
