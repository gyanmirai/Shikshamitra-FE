import { act, render, screen, fireEvent } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';

import StudentRecordsReportPreviewDrawer from './StudentRecordsReportPreviewDrawer';

const mocks = vi.hoisted(() => ({
  auth: { permissions: [] as { name: string; isGranted: boolean }[] },
  preview: vi.fn(),
  create: vi.fn(),
  status: vi.fn(),
  download: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) => select({ auth: mocks.auth }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/student/student-report/student-report-api', () => ({
  usePreviewStudentReportMutation: () => [mocks.preview, {}],
  useCreateStudentReportExportMutation: () => [mocks.create, {}],
  useLazyGetStudentReportExportJobQuery: () => [mocks.status],
  useLazyDownloadStudentReportQuery: () => [mocks.download],
}));

const reportRequest = { reportType: 'StudentRegister', filters: { classId: 'class-8' } };
const preview = {
  reportType: 'StudentRegister',
  page: 1,
  pageSize: 10,
  totalCount: 12,
  columns: [{ id: 'name', label: 'Student' }],
  rows: [{ name: 'Sample Student' }],
};

function request<T>(promise: Promise<T>) {
  return Object.assign(
    promise.then(
      (data) => ({ data }),
      (error) => ({ error })
    ),
    { unwrap: () => promise, abort: vi.fn() }
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { resolve, request: request(promise) };
}

function renderDrawer() {
  const props = { open: true, reportRequest, reportTitle: 'Student Register', onClose: vi.fn() };
  return { props, view: render(<StudentRecordsReportPreviewDrawer {...props} />) };
}

const flush = () => act(async () => {});
const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

describe('Student Records report preview drawer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
    mocks.auth.permissions = [{ name: 'Students.Records.Reports.Add', isGranted: true }];
    mocks.preview.mockImplementation(() => request(Promise.resolve(preview)));
    mocks.create.mockImplementation(() =>
      request(Promise.resolve({ jobId: 'job-1', status: 'Queued' }))
    );
    mocks.status.mockImplementation(() => request(Promise.resolve({ status: 'Generating' })));
    mocks.download.mockImplementation(() => request(Promise.resolve({ bytes: 'UERG' })));
  });

  afterEach(() => vi.useRealTimers());

  it('labels the dialog and retries a failed preview with the original scope and page', async () => {
    mocks.preview.mockReturnValueOnce(request(Promise.reject(new Error('unavailable'))));
    renderDrawer();
    await flush();

    expect(screen.getByRole('dialog', { name: 'Student Register' })).toHaveAttribute(
      'aria-modal',
      'true'
    );
    expect(screen.getByRole('alert')).toHaveTextContent('The report preview could not be loaded.');
    expect(screen.queryByText('No data found for the selected filters')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await flush();
    expect(mocks.preview.mock.calls).toEqual([
      [{ ...reportRequest, page: 1, pageSize: 10 }],
      [{ ...reportRequest, page: 1, pageSize: 10 }],
    ]);
    expect(screen.getByText('Sample Student')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps a successful empty preview and the View-only export gate distinct', async () => {
    mocks.auth.permissions = [{ name: 'Students.Records.Reports.View', isGranted: true }];
    mocks.preview.mockReturnValueOnce(
      request(Promise.resolve({ ...preview, totalCount: 0, rows: [] }))
    );
    renderDrawer();
    await flush();

    expect(screen.getByText('No data found for the selected filters')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('blocks all dismissal paths during export and recovers on create failure', async () => {
    const create = deferred<{ jobId: string | null }>();
    mocks.create.mockReturnValueOnce(create.request);
    const { props } = renderDrawer();
    await flush();

    const download = screen.getByRole('button', { name: 'Download PDF' });
    fireEvent.click(download);
    fireEvent.click(download);
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.create).toHaveBeenCalledWith({ ...reportRequest, format: 'pdf' });

    const close = screen.getByRole('button', { name: 'Close report preview' });
    expect(close).toBeDisabled();
    fireEvent.click(close);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
    expect(props.onClose).not.toHaveBeenCalled();

    create.resolve({ jobId: null });
    await flush();
    expect(screen.getByRole('alert')).toHaveTextContent('The PDF export could not be started.');
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('makes one status request at a time and times out a stalled request', async () => {
    const pendingStatus = deferred<{ status: string }>();
    mocks.status.mockReturnValueOnce(pendingStatus.request);
    renderDrawer();
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    await flush();
    await advance(10_000);
    expect(mocks.status).toHaveBeenCalledOnce();

    await advance(110_000);
    expect(pendingStatus.request.abort).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The PDF export is taking longer than expected.'
    );
    expect(screen.getByRole('button', { name: 'Check export status' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Close report preview' })).toBeEnabled();

    pendingStatus.resolve({ status: 'Completed' });
    await flush();
    expect(mocks.download).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Check export status' }));
    await advance(2_000);
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(mocks.status).toHaveBeenLastCalledWith({ jobId: 'job-1' }, false);
  });

  it('bounds recurring status failures and unlocks dismissal', async () => {
    mocks.status.mockImplementation(() => request(Promise.reject(new Error('offline'))));
    const { props } = renderDrawer();
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    await flush();
    await advance(60_000);

    expect(mocks.status).toHaveBeenCalledTimes(5);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'The PDF export status could not be checked.'
    );
    expect(screen.getByRole('button', { name: 'Check export status' })).toBeEnabled();
    fireEvent.click(document.querySelector('.MuiBackdrop-root')!);
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('retries a failed file download with the same job and preserves the full export scope', async () => {
    const startFile = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createUrl = vi.fn(() => 'blob:report');
    const revokeUrl = vi.fn();
    const originalCreate = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    const originalRevoke = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createUrl });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeUrl });
    mocks.status.mockReturnValueOnce(request(Promise.resolve({ status: 'Completed' })));
    mocks.download.mockReturnValueOnce(request(Promise.resolve({ bytes: '' })));

    try {
      renderDrawer();
      await flush();
      fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
      await flush();
      expect(mocks.preview).toHaveBeenLastCalledWith({ ...reportRequest, page: 2, pageSize: 10 });
      fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
      await flush();
      await advance(2_000);
      expect(screen.getByRole('alert')).toHaveTextContent('The PDF could not be downloaded.');
      expect(startFile).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Retry download' }));
      await flush();

      expect(mocks.create).toHaveBeenCalledExactlyOnceWith({ ...reportRequest, format: 'pdf' });
      expect(mocks.download.mock.calls).toEqual([
        [{ jobId: 'job-1' }, false],
        [{ jobId: 'job-1' }, false],
      ]);
      expect(startFile).toHaveBeenCalledOnce();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      await advance(1_000);
      expect(revokeUrl).toHaveBeenCalledWith('blob:report');
    } finally {
      startFile.mockRestore();
      if (originalCreate) Object.defineProperty(URL, 'createObjectURL', originalCreate);
      else Reflect.deleteProperty(URL, 'createObjectURL');
      if (originalRevoke) Object.defineProperty(URL, 'revokeObjectURL', originalRevoke);
      else Reflect.deleteProperty(URL, 'revokeObjectURL');
    }
  });

  it('aborts stale requests when the report scope changes', async () => {
    const create = deferred<{ jobId: string; status: string }>();
    mocks.create.mockReturnValueOnce(create.request);
    const { props, view } = renderDrawer();
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    const nextRequest = { ...reportRequest, filters: { classId: 'class-9' } };
    view.rerender(<StudentRecordsReportPreviewDrawer {...props} reportRequest={nextRequest} />);
    expect(create.request.abort).toHaveBeenCalledOnce();
    create.resolve({ jobId: 'stale-job', status: 'Queued' });
    await advance(2_000);

    expect(mocks.status).not.toHaveBeenCalled();
    expect(mocks.preview).toHaveBeenLastCalledWith({ ...nextRequest, page: 1, pageSize: 10 });
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeEnabled();
  });

  it('keeps the new scope when a replaced preview completes late', async () => {
    const priorPreview = deferred<typeof preview>();
    mocks.preview.mockReturnValueOnce(priorPreview.request);
    const { props, view } = renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: 'Close report preview' }));
    expect(props.onClose).toHaveBeenCalledOnce();

    const nextRequest = { ...reportRequest, filters: { classId: 'class-9' } };
    view.rerender(<StudentRecordsReportPreviewDrawer {...props} reportRequest={nextRequest} />);
    expect(priorPreview.request.abort).toHaveBeenCalledOnce();
    await flush();
    priorPreview.resolve({ ...preview, rows: [{ name: 'Previous Scope Student' }] });
    await flush();

    expect(screen.getByText('Sample Student')).toBeInTheDocument();
    expect(screen.queryByText('Previous Scope Student')).not.toBeInTheDocument();
  });
});
