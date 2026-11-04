import { shikshaMitraToast } from 'src/components/toast';
import { vi, expect, afterEach, beforeEach } from 'vitest';
import { act, cleanup, waitFor } from '@testing-library/react';

// Observe the real StudentFeedback handoff without mounting the application toaster.
// Request errors no longer render an inline banner or a separate Retry row.
beforeEach(() => {
  vi.spyOn(shikshaMitraToast, 'error').mockImplementation(() => 'test-error');
});

afterEach(async () => {
  cleanup();
  // StudentFeedback releases its StrictMode-safe notice ownership after unmount.
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  vi.restoreAllMocks();
});

export async function expectStudentErrorToast(message: string | RegExp) {
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: typeof message === 'string' ? message : expect.stringMatching(message),
      })
    )
  );
}
