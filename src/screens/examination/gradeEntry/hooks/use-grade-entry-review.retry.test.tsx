import { http, HttpResponse } from 'msw';
import { act } from '@testing-library/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';

import { markRow, setupReview, validReview } from './grade-review-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('recoverable grade review errors', () => {
  it.each(['bulk-save', 'draft', 'validate'])(
    'shows a %s failure, keeps review open, and allows a successful retry',
    async (operation) => {
      const { result, rerender, saveStates } = setupReview(operation !== 'validate');
      let shouldFail = true;
      let calls = 0;
      mswServer.use(
        http.post(`*/api/academics/exams/:examId/marks/${operation}`, () => {
          calls += 1;
          return shouldFail
            ? HttpResponse.json(
                { error: { message: 'Service temporarily unavailable.' } },
                { status: 503 }
              )
            : HttpResponse.json({ data: operation === 'validate' ? validReview : {} });
        })
      );
      await act(() => result.current.prepareReview());
      expect(result.current.open).toBe(true);
      expect(result.current.isPreparing).toBe(false);
      expect(result.current.canSubmit).toBe(false);
      expect(result.current.preparationError).toContain('Service temporarily unavailable.');
      if (operation !== 'validate') expect(saveStates).toContain('failed');
      if (operation === 'draft') {
        // Bulk-save invalidates the marks query and the refreshed rows may already be clean.
        rerender({ examId: 'exam-1', rows: [markRow], isDirty: false });
      }
      shouldFail = false;
      await act(() => result.current.prepareReview());
      expect(result.current.preparationError).toBe('');
      expect(result.current.canSubmit).toBe(true);
      expect(calls).toBe(2);
    }
  );
});
