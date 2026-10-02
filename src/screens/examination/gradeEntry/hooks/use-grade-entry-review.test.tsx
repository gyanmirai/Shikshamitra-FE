import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import { act, waitFor } from '@testing-library/react';

import { markRow, validReview, setupReview, deferredResponse } from './grade-review-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('grade review preparation through the real RTK API', () => {
  it('opens immediately, blocks duplicate requests and closing, and remains unsafe while validation is pending', async () => {
    const gate = deferredResponse();
    let calls = 0;
    const { result } = setupReview();
    mswServer.use(
      http.post('*/api/academics/exams/:examId/marks/validate', async () => {
        calls += 1;
        await gate.promise;
        return HttpResponse.json({ data: validReview });
      })
    );
    act(() => {
      result.current.prepareReview();
      result.current.prepareReview();
    });
    expect(result.current.open).toBe(true);
    expect(result.current.isPreparing).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    act(() => result.current.closeReview());
    expect(result.current.open).toBe(true);
    await waitFor(() => expect(calls).toBe(1));
    gate.release();
    await waitFor(() => expect(result.current.canSubmit).toBe(true));
  });

  it('saves the latest marks and feedback before draft and server validation', async () => {
    const { result, rerender, saveStates, getSavedCount } = setupReview(true);
    const order: string[] = [];
    let savedBody: unknown;
    mswServer.use(
      http.post('*/api/academics/exams/:examId/marks/bulk-save', async ({ request }) => {
        order.push('bulk-save');
        savedBody = await request.json();
        return HttpResponse.json({ data: {} });
      }),
      http.post('*/api/academics/exams/:examId/marks/draft', () => {
        order.push('draft');
        return HttpResponse.json({ data: {} });
      }),
      http.post('*/api/academics/exams/:examId/marks/validate', () => {
        order.push('validate');
        return HttpResponse.json({ data: validReview });
      })
    );
    rerender({
      examId: 'exam-1',
      rows: [{ ...markRow, marks: 99, feedback: 'Edited immediately' }],
    });
    await act(() => result.current.prepareReview());
    expect(savedBody).toEqual({
      subjectId: 'subject-1',
      divisionId: 'division-1',
      rows: [
        {
          studentId: 'student-1',
          attendanceStatus: 0,
          obtainedMarks: 99,
          feedback: 'Edited immediately',
        },
      ],
    });
    expect(order).toEqual(['bulk-save', 'draft', 'validate']);
    expect(saveStates).toEqual(['saving', 'saved']);
    expect(getSavedCount()).toBe(1);
  });

  it.each([false, true])(
    'keeps validation blockers visible and disallows submission with isValid=%s',
    async (isValid) => {
      const { result } = setupReview();
      const blocker = {
        code: 'MISSING_MARKS',
        message: 'Marks are missing for Arjun.',
        studentId: 'student-1',
      };
      mswServer.use(
        http.post('*/api/academics/exams/:examId/marks/validate', () =>
          HttpResponse.json({ data: { isValid, blockers: [blocker], warnings: [] } })
        )
      );
      await act(() => result.current.prepareReview());
      expect(result.current.open).toBe(true);
      expect(result.current.validation.blockers).toEqual([blocker]);
      expect(result.current.canSubmit).toBe(false);
    }
  );

  it('rejects an incomplete validation response instead of treating it as success', async () => {
    const { result } = setupReview();
    mswServer.use(
      http.post('*/api/academics/exams/:examId/marks/validate', () =>
        HttpResponse.json({ data: {} })
      )
    );
    await act(() => result.current.prepareReview());
    expect(result.current.preparationError).toContain('Review validation could not be confirmed');
    expect(result.current.canSubmit).toBe(false);
  });

  it('ignores old exam responses and validates again when review is reopened', async () => {
    const { result, rerender } = setupReview();
    const gate = deferredResponse();
    let firstStarted = false;
    const exams: string[] = [];
    mswServer.use(
      http.post('*/api/academics/exams/:examId/marks/validate', async ({ params }) => {
        exams.push(String(params.examId));
        if (params.examId === 'exam-1') {
          firstStarted = true;
          await gate.promise;
        }
        return HttpResponse.json({ data: validReview });
      })
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.prepareReview();
    });
    await waitFor(() => expect(firstStarted).toBe(true));
    rerender({ examId: 'exam-2', rows: [markRow] });
    expect(result.current.open).toBe(false);
    gate.release();
    await act(() => pending!);
    expect(result.current.canSubmit).toBe(false);
    await act(() => result.current.prepareReview());
    expect(result.current.canSubmit).toBe(true);
    act(() => result.current.closeReview());
    await act(() => result.current.prepareReview());
    expect(exams).toEqual(['exam-1', 'exam-2', 'exam-2']);
  });
});
