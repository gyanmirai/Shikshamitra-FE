import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useReferenceFileUpload } from './useReferenceFileUpload';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });

function setup() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  const setAttachment = vi.fn().mockResolvedValue(undefined);
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  return { ...renderHook(() => useReferenceFileUpload(setAttachment), { wrapper }), setAttachment };
}

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

it('blocks immediately, deduplicates pending uploads, and binds returned metadata before unblocking', async () => {
  let release = () => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  let requests = 0;
  mswServer.use(http.post('*/api/files', async ({ request }) => {
    requests += 1;
    expect(request.headers.get('content-type')).toContain('multipart/form-data');
    const body = await request.formData();
    expect((body.get('File') as File).name).toBe('Reference.pdf');
    await held;
    return HttpResponse.json({ data: 'uploaded.pdf' });
  }));
  const { result, setAttachment } = setup();
  const file = new File(['%PDF reference'], 'Reference.pdf', { type: 'application/pdf' });
  act(() => {
    result.current.change(file);
    expect(result.current.isBlocked()).toBe(true);
    result.current.change(file);
  });
  await waitFor(() => expect(requests).toBe(1));
  expect(result.current.isUploading).toBe(true);
  expect(setAttachment).not.toHaveBeenCalled();
  await act(async () => { release(); });
  await waitFor(() => expect(result.current.isUploading).toBe(false));
  expect(setAttachment).toHaveBeenCalledWith({
    name: 'Reference.pdf', size: file.size, type: file.type, url: 'uploaded.pdf', filePath: 'uploaded.pdf',
  });
  expect(result.current.isBlocked()).toBe(false);
});

it('retains the failed DOCX for retry and never overwrites the existing attachment on failure', async () => {
  let requests = 0;
  mswServer.use(http.post('*/api/files', () => {
    requests += 1;
    return requests === 1
      ? HttpResponse.json({ detail: 'Storage temporarily unavailable.' }, { status: 503 })
      : HttpResponse.json({ data: 'uploaded.docx' });
  }));
  const { result, setAttachment } = setup();
  const file = new File(['DOCX'], 'Reference.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  await act(async () => { await result.current.change(file); });
  expect(result.current.error).toContain('Storage temporarily unavailable');
  expect(result.current.failedFile).toBe(file);
  expect(result.current.isBlocked()).toBe(true);
  expect(setAttachment).not.toHaveBeenCalled();
  await act(async () => { await result.current.retry(); });
  expect(requests).toBe(2);
  expect(setAttachment).toHaveBeenCalledTimes(1);
  expect(result.current.error).toBeNull();
  expect(result.current.isBlocked()).toBe(false);
});

it('rejects oversize and mismatched types locally with an explicit recovery action', async () => {
  const { result, setAttachment } = setup();
  await act(async () => {
    await result.current.change(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' }));
  });
  expect(result.current.error).toContain('5 MB');
  await act(async () => { await result.current.change(new File(['bad'], 'bad.exe', { type: 'application/pdf' })); });
  expect(result.current.error).toContain('Unsupported file type');
  expect(setAttachment).not.toHaveBeenCalled();
  act(() => result.current.clearError());
  expect(result.current.isBlocked()).toBe(false);
});

it('treats a successful HTTP response without a file identifier as a retryable failure', async () => {
  mswServer.use(http.post('*/api/files', () => HttpResponse.json({ data: null })));
  const { result, setAttachment } = setup();
  await act(async () => { await result.current.change(new File(['pdf'], 'Reference.pdf', { type: 'application/pdf' })); });
  expect(result.current.error).toContain('did not return an attachment');
  expect(result.current.isBlocked()).toBe(true);
  expect(setAttachment).not.toHaveBeenCalled();
});

it('aborts on unmount and ignores an upload response after the form closes', async () => {
  let release = () => {};
  const held = new Promise<void>((resolve) => { release = resolve; });
  let requests = 0;
  mswServer.use(http.post('*/api/files', async () => {
    requests += 1;
    await held;
    return HttpResponse.json({ data: 'late.pdf' });
  }));
  const { result, setAttachment, unmount } = setup();
  act(() => { result.current.change(new File(['pdf'], 'Reference.pdf', { type: 'application/pdf' })); });
  await waitFor(() => expect(requests).toBe(1));
  unmount();
  await act(async () => { release(); });
  expect(setAttachment).not.toHaveBeenCalled();
});
