import { act, waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { buildAdmissionPrintDocument } from './form-print-model';
import { AdmissionPrintLayoutError } from './form-print-advanced-layout';
import { useAdmissionPrintPreview } from './use-admission-print-preview';

const mocks = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock('./form-print-pdf', () => ({ createAdmissionFormPdfBlob: mocks.generate }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const model = (mode: 'blank' | 'filled' = 'blank') =>
  buildAdmissionPrintDocument({
    definition: { name: 'Registration', sections: [] },
    values: {},
    mode,
  });

describe('Registration print preview lifecycle', () => {
  const createUrl = vi.fn();
  const revokeUrl = vi.fn();
  beforeEach(() => {
    vi.stubGlobal('Worker', undefined);
    mocks.generate.mockReset();
    createUrl.mockReset().mockReturnValue('blob:print');
    revokeUrl.mockReset();
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = createUrl;

        static revokeObjectURL = revokeUrl;
      }
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('cancels the running PDF worker when a new edit supersedes it', async () => {
    const older = { postMessage: vi.fn(), terminate: vi.fn() };
    const latest = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      onmessage: undefined as ((message: { data: { blob: Blob } }) => void) | undefined,
    };
    const workers = [older, latest];
    function createWorker() {
      return workers.shift();
    }
    vi.stubGlobal('Worker', createWorker);
    const { result, rerender } = renderHook(
      ({ title }) => useAdmissionPrintPreview({ ...model(), title }, {}, true, 0, 'blank'),
      { initialProps: { title: 'Registration' } }
    );
    expect(older.postMessage).toHaveBeenCalledOnce();
    rerender({ title: 'New registration' });
    expect(older.terminate).toHaveBeenCalledOnce();
    expect(latest.postMessage).toHaveBeenCalledOnce();
    await act(async () => latest.onmessage?.({ data: { blob: new Blob(['final']) } }));
    expect(result.current.url).toBe('blob:print');
    expect(latest.terminate).toHaveBeenCalledOnce();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('times out a stalled PDF worker and lets staff retry', async () => {
    const stalled = { postMessage: vi.fn(), terminate: vi.fn() };
    function createStalledWorker() {
      return stalled;
    }
    vi.useFakeTimers();
    try {
      vi.stubGlobal('Worker', createStalledWorker);
      const { result } = renderHook(() => useAdmissionPrintPreview(model(), {}, true));
      await act(async () => vi.advanceTimersByTimeAsync(30_000));
      expect(stalled.terminate).toHaveBeenCalledOnce();
      expect(result.current.error).toBe(true);
      expect(result.current.errorMessage).toMatch(/took too long/i);
      expect(result.current.loading).toBe(false);
      act(() => result.current.retry());
      expect(stalled.postMessage).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the last preview visible during an edit but exposes only the current PDF for output', async () => {
    const next = deferred<Blob>();
    mocks.generate.mockResolvedValueOnce(new Blob(['blank'])).mockReturnValueOnce(next.promise);
    createUrl.mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:updated');
    const { result, rerender } = renderHook(
      ({ title }) => useAdmissionPrintPreview({ ...model(), title }, {}, true, 0, 'blank-en-all'),
      { initialProps: { title: 'Registration' } }
    );
    await waitFor(() => expect(result.current.url).toBe('blob:first'));
    rerender({ title: 'Updated registration' });
    expect(result.current.previewUrl).toBe('blob:first');
    expect(result.current.url).toBeUndefined();
    expect(revokeUrl).not.toHaveBeenCalled();
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(2));
    await act(async () => next.resolve(new Blob(['updated'])));
    expect(result.current.previewUrl).toBe('blob:updated');
    expect(result.current.url).toBe('blob:updated');
    expect(revokeUrl).toHaveBeenCalledWith('blob:first');
  });

  it('hides the previous PDF immediately when switching modes and releases its URL', async () => {
    const next = deferred<Blob>();
    mocks.generate.mockResolvedValueOnce(new Blob(['blank'])).mockReturnValueOnce(next.promise);
    createUrl.mockReturnValueOnce('blob:blank').mockReturnValueOnce('blob:filled');
    const { result, rerender, unmount } = renderHook(
      ({ mode }) => useAdmissionPrintPreview(model(mode), {}, true, 0, mode),
      { initialProps: { mode: 'blank' as 'blank' | 'filled' } }
    );
    await waitFor(() => expect(result.current.url).toBe('blob:blank'));
    rerender({ mode: 'filled' });
    expect(result.current.url).toBeUndefined();
    expect(result.current.previewUrl).toBeUndefined();
    expect(result.current.loading).toBe(true);
    expect(revokeUrl).toHaveBeenCalledWith('blob:blank');
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(2));
    await act(async () => next.resolve(new Blob(['filled'])));
    expect(result.current.url).toBe('blob:filled');
    unmount();
    expect(revokeUrl).toHaveBeenCalledWith('blob:filled');
  });

  it('ignores an older generation that finishes after the current PDF', async () => {
    const old = deferred<Blob>();
    const current = deferred<Blob>();
    mocks.generate.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise);
    const { result, rerender } = renderHook(
      ({ mode }) => useAdmissionPrintPreview(model(mode), {}, true),
      { initialProps: { mode: 'blank' as 'blank' | 'filled' } }
    );
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
    rerender({ mode: 'filled' });
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(2));
    const currentBlob = new Blob(['filled']);
    await act(async () => current.resolve(currentBlob));
    expect(result.current.url).toBe('blob:print');
    await act(async () => old.resolve(new Blob(['blank'])));
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(createUrl).toHaveBeenCalledWith(currentBlob);
    expect(result.current.url).toBe('blob:print');
  });

  it('does not return a revoked URL when the same request is enabled again', async () => {
    const next = deferred<Blob>();
    mocks.generate.mockResolvedValueOnce(new Blob(['first'])).mockReturnValueOnce(next.promise);
    createUrl.mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
    const { result, rerender } = renderHook(
      ({ enabled }) => useAdmissionPrintPreview(model(), {}, enabled),
      { initialProps: { enabled: true } }
    );
    await waitFor(() => expect(result.current.url).toBe('blob:first'));
    rerender({ enabled: false });
    expect(result.current.url).toBeUndefined();
    expect(revokeUrl).toHaveBeenCalledWith('blob:first');
    rerender({ enabled: true });
    expect(result.current.url).toBeUndefined();
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(2));
    await act(async () => next.resolve(new Blob(['second'])));
    expect(result.current.url).toBe('blob:second');
  });

  it('keeps failed generation unprintable and regenerates only after retry', async () => {
    mocks.generate
      .mockRejectedValueOnce(new Error('PDF unavailable'))
      .mockResolvedValueOnce(new Blob(['retry']));
    const { result } = renderHook(() => useAdmissionPrintPreview(model(), {}, true));
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.url).toBeUndefined();
    expect(result.current.loading).toBe(false);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.url).toBe('blob:print'));
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBe(false);
  });

  it('never creates a URL for generation completed after unmount', async () => {
    const pending = deferred<Blob>();
    mocks.generate.mockReturnValue(pending.promise);
    const { unmount } = renderHook(() => useAdmissionPrintPreview(model(), {}, true));
    await waitFor(() => expect(mocks.generate).toHaveBeenCalledTimes(1));
    unmount();
    await act(async () => pending.resolve(new Blob(['late'])));
    expect(createUrl).not.toHaveBeenCalled();
  });

  it('reports the paper layout problem and removes it after a valid edit', async () => {
    const error = new AdmissionPrintLayoutError('Choose a larger paper size.');
    mocks.generate.mockRejectedValueOnce(error).mockResolvedValueOnce(new Blob(['valid']));
    const { result, rerender } = renderHook(
      ({ mode }) => useAdmissionPrintPreview(model(mode), {}, true),
      { initialProps: { mode: 'blank' as 'blank' | 'filled' } }
    );
    await waitFor(() => expect(result.current.errorMessage).toBe(error.message));
    expect(result.current.url).toBeUndefined();
    rerender({ mode: 'filled' });
    expect(result.current.errorMessage).toBeUndefined();
    await waitFor(() => expect(result.current.url).toBe('blob:print'));
  });
});
