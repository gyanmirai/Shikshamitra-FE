import { act, waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { buildAdmissionPrintDocument } from './form-print-model';
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

  it('hides the previous PDF immediately when switching modes and releases its URL', async () => {
    const next = deferred<Blob>();
    mocks.generate.mockResolvedValueOnce(new Blob(['blank'])).mockReturnValueOnce(next.promise);
    createUrl.mockReturnValueOnce('blob:blank').mockReturnValueOnce('blob:filled');
    const { result, rerender, unmount } = renderHook(
      ({ mode }) => useAdmissionPrintPreview(model(mode), {}, true),
      { initialProps: { mode: 'blank' as 'blank' | 'filled' } }
    );
    await waitFor(() => expect(result.current.url).toBe('blob:blank'));
    rerender({ mode: 'filled' });
    expect(result.current.url).toBeUndefined();
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
});
