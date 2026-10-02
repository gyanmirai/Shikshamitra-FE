import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentRecordReports from './student-record-reports';

const mocks = vi.hoisted(() => ({ params: new URLSearchParams(), permissions: [] as { name: string; isGranted: boolean }[],
  preview: {} as any, jobs: {} as any, create: vi.fn(), cancel: vi.fn(), download: vi.fn(), push: vi.fn(), previewInput: {} as any, skipPreview: false }));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year-1', name: '2026–27' } }, auth: { permissions: mocks.permissions } }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }), usePathname: () => '/student/records/reports', useSearchParams: () => mocks.params }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: ({ heading, action }: any) => <header><h1>{heading}</h1>{action}</header> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: ({ open, title, content, action }: any) => open ? <div role="dialog" aria-label={title}>{content}{action}</div> : null }));
vi.mock('./records-student-picker', () => ({ default: () => <div>Student picker</div> }));
vi.mock('src/components/custom-select', () => ({ default: ({ label, value, options, onChange }: any) => <label htmlFor={label}>{label}<select id={label} aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{options.map((option: any) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label> }));
vi.mock('src/components/customizabaleTable', () => ({ default: (props: any) => <section aria-label={props.tableTitle}>{props.data.map((row: any, index: number) => <div key={row.id ?? index}>{props.columns.map((column: any) => <span key={column.id}>{column.render ? column.render(row[column.id], row) : row[column.id]}</span>)}</div>)}</section> }));
vi.mock('src/redux/student/records/student-record-reports-api', () => ({
  useGetRecordsReportPreviewQuery: (input: any, options: any) => { mocks.previewInput = input; mocks.skipPreview = options.skip; return mocks.preview; },
  useGetRecordsReportJobsQuery: () => mocks.jobs,
  useCreateRecordsReportMutation: () => [mocks.create, { isLoading: false }],
  useCancelRecordsReportMutation: () => [mocks.cancel, { isLoading: false }],
  useDownloadRecordsReportMutation: () => [mocks.download, { isLoading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks(); mocks.params = new URLSearchParams();
  mocks.permissions = ['Students.Records.Reports.Add', 'Students.Records.StudentList.View'].map(name => ({ name, isGranted: true }));
  mocks.preview = { currentData: { columns: ['Student'], rows: [{ Student: 'Riya Shah' }], totalCount: 1, asOf: '2026-09-30T10:00:00Z' }, isFetching: false, isError: false, refetch: vi.fn() };
  mocks.jobs = { currentData: { items: [], totalCount: 0 }, isError: false, refetch: vi.fn() };
  mocks.create.mockImplementation(() => ({ unwrap: () => Promise.resolve({ id: 'job-1' }) }));
});
describe('Student Records reports', () => {
  it('requires source permission before fetching or generating a report', () => {
    mocks.permissions = [{ name: 'Students.Records.Reports.Add', isGranted: true }];
    render(<StudentRecordReports />);
    expect(mocks.skipPreview).toBe(true);
    expect(screen.getByRole('button', { name: 'Generate report' })).toBeDisabled();
    expect(screen.getByText(/need permission to view the source module/)).toBeVisible();
  });
  it('uses the saved URL scope and generates all matching rows with an idempotency key', async () => {
    mocks.params = new URLSearchParams('type=Directory&year=year-2&student=student-9&page=3');
    render(<StudentRecordReports />);
    expect(mocks.previewInput).toMatchObject({ academicYearId: 'year-2', studentId: 'student-9', skipCount: 75 });
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    const dialog = await screen.findByRole('dialog', { name: 'Generate student report?' });
    fireEvent.click(dialog.querySelector('button')!);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ academicYearId: 'year-2', studentId: 'student-9', skipCount: 0, maxResultCount: 100, clientKey: expect.any(String) })));
    expect(mocks.push).toHaveBeenCalledWith(expect.stringContaining('tab=history'), { scroll: false });
  });
  it('keeps the same request key when a queued-report request fails and is retried', async () => {
    mocks.create.mockImplementation(() => ({ unwrap: () => Promise.reject(new Error('offline')) }));
    render(<StudentRecordReports />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate report' }));
    const dialog = await screen.findByRole('dialog', { name: 'Generate student report?' });
    fireEvent.click(dialog.querySelector('button')!);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(dialog.textContent).toContain('scope has been kept'));
    fireEvent.click(dialog.querySelector('button')!);
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(2));
    expect(mocks.create.mock.calls[0][0].clientKey).toBe(mocks.create.mock.calls[1][0].clientKey);
  });
  it('does not expose a download for a completed report whose access changed', () => {
    mocks.params = new URLSearchParams('tab=history');
    mocks.jobs.currentData = { items: [{ id: 'job-1', reportType: 'Directory', status: 'Completed', canDownload: false, creationTime: '2026-09-30T10:00:00Z', expiresAt: '2026-10-07T10:00:00Z', request: { reportType: 'Directory' } }], totalCount: 1 };
    render(<StudentRecordReports />);
    expect(screen.queryByRole('button', { name: 'Download report' })).not.toBeInTheDocument();
    expect(screen.getByText('Access changed. Generate again.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Generate report again' })).toBeVisible();
  });
});
