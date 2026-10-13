import type { PropsWithChildren } from 'react';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, describe, afterEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { profileChangeDiff, useProfileChangeDiff } from './student-record-change-diff';
import {
  customField,
  customSource,
  customSection,
  customStudentId,
} from '../studentProfile/student-custom-details-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const stores: ReturnType<typeof createDocumentTestStore>[] = [];
const oldMedium = 'ad400010-0000-4000-8000-000000000001';
const newMedium = 'ad400010-0000-4000-8000-000000000002';
const board = 'ad400010-0000-4000-8000-000000000003';
const source = customSource(
  [
    customSection([
      customField('medium', 6, {
        label: 'Teaching medium',
        optionsJson: '{"source":"EducationMediums","parentField":"board"}',
      }),
      customField('board', 6, { label: 'Board', optionsJson: '{"source":"EducationBoards"}' }),
    ]),
  ],
  { medium: oldMedium, board },
  {
    optionsByField: {
      medium: [{ value: oldMedium, label: 'English', displayOrder: 0, isActive: true }],
    },
  }
);

function pendingChange(overrides: Partial<RecordChange> = {}): RecordChange {
  return {
    id: 'change-1',
    studentId: customStudentId,
    studentName: 'Riya Shah',
    academicYearId: 'year-1',
    requestedBy: 'staff-1',
    action: 'Correction',
    section: 'custom-details',
    reason: 'Verified school detail correction',
    status: 'Pending',
    concurrencyStamp: 'change-stamp-1',
    effectiveAt: '2026-10-12T08:00:00Z',
    creationTime: '2026-10-12T08:00:00Z',
    approvalCount: 0,
    requiredApprovals: 1,
    canApprove: true,
    canCancel: true,
    payloadMasked: false,
    decisions: [],
    before: { sources: [{ applicationId: 'application-1', values: { medium: oldMedium, board } }] },
    proposed: {
      sources: [{ applicationId: 'application-1', values: { medium: newMedium, board } }],
    },
    ...overrides,
  };
}

function renderDiff(change: RecordChange) {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  const store = createDocumentTestStore();
  stores.push(store);
  return renderHook(() => useProfileChangeDiff(change, [source]), {
    wrapper: ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>,
  });
}

afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
});

describe('captured form audit option labels', () => {
  it.each(['custom-details', 'registration-form'] as const)(
    'resolves %s references through the bound Records selected-only endpoint',
    async (section) => {
      const calls: URLSearchParams[] = [];
      const admissions = vi.fn();
      mswServer.use(
        http.get('*/api/students/records/:studentId/details/options', ({ request, params }) => {
          expect(params.studentId).toBe(customStudentId);
          const query = new URL(request.url).searchParams;
          calls.push(query);
          return HttpResponse.json({
            data: [
              { value: oldMedium, label: 'English', displayOrder: 0, isActive: true },
              { value: newMedium, label: 'Gujarati', displayOrder: 1, isActive: true },
            ],
          });
        }),
        http.get('*/api/student/enrollment/admissions/forms/metadata/options', () => {
          admissions();
          return HttpResponse.json([], { status: 403 });
        })
      );
      const { result } = renderDiff(pendingChange({ section }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.diffs).toEqual([
        { label: 'Teaching medium', before: 'English', after: 'Gujarati' },
      ]);
      expect(calls).toHaveLength(1);
      expect(Object.fromEntries(calls[0])).toMatchObject({
        submissionId: 'submission-1',
        fieldCode: 'medium',
        parentId: board,
        selectedOnly: 'true',
      });
      expect(calls[0].getAll('selectedIds')).toEqual(
        expect.arrayContaining([oldMedium, newMedium])
      );
      expect(calls[0].has('sourceKey')).toBe(false);
      expect(admissions).not.toHaveBeenCalled();
    }
  );

  it('keeps proposed identifiers out of visible diffs on failure and retries the same labels', async () => {
    let attempts = 0;
    mswServer.use(
      http.get('*/api/students/records/:studentId/details/options', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
          : HttpResponse.json({
              data: [
                { value: oldMedium, label: 'English', displayOrder: 0, isActive: true },
                { value: newMedium, label: 'Gujarati', displayOrder: 1, isActive: true },
              ],
            });
      })
    );
    const { result } = renderDiff(pendingChange());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.diffs).toEqual([
      { label: 'Teaching medium', before: 'English', after: 'Option unavailable' },
    ]);
    expect(JSON.stringify(result.current.diffs)).not.toContain(newMedium);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.diffs[0].after).toBe('Gujarati'));
    expect(result.current.isError).toBe(false);
    expect(attempts).toBe(2);
  });

  it.each(['custom-details', 'registration-form'] as const)(
    'never fetches or exposes masked %s payloads',
    (section) => {
      const change = pendingChange({ section, payloadMasked: true });
      const { result } = renderDiff(change);
      expect(result.current.diffs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(profileChangeDiff(change, [source])).toEqual([]);
    }
  );

  it('uses frozen field labels for direct registration edits and withholds values without the owning source', () => {
    const registration = customSource(
      [customSection([customField('blood', 0, { label: 'Blood group' })])],
      { blood: 'B+' }
    );
    const change = pendingChange({
      section: 'registration-form',
      status: 'Applied',
      before: { sources: [{ applicationId: 'application-1', values: { blood: 'B+' } }] },
      proposed: { sources: [{ applicationId: 'application-1', values: { blood: 'O+' } }] },
    });
    expect(profileChangeDiff(change, [registration])).toEqual([
      { label: 'Blood group', before: 'B+', after: 'O+' },
    ]);
    expect(profileChangeDiff(change, [])).toEqual([
      { label: 'Blood', before: 'Value unavailable', after: 'Value unavailable' },
    ]);
  });

  it('batches all 40 replaced sibling references and merges both original and proposed labels', async () => {
    const ids = Array.from(
      { length: 40 },
      (_, index) => `ad400020-0000-4000-8000-${String(index + 1).padStart(12, '0')}`
    );
    const previous = ids.slice(0, 20);
    const proposed = ids.slice(20);
    const labels = Object.fromEntries(ids.map((id, index) => [id, `Sibling ${index + 1}`]));
    const calls: string[][] = [];
    const registration = customSource(
      [
        customSection([
          customField('siblings', 7, {
            label: 'Sibling students',
            bindingKey: 'Family.SiblingStudentIds',
          }),
        ]),
      ],
      { siblings: previous }
    );
    const change = pendingChange({
      before: { sources: [{ applicationId: 'application-1', values: { siblings: previous } }] },
      proposed: { sources: [{ applicationId: 'application-1', values: { siblings: proposed } }] },
    });
    mswServer.use(
      http.get('*/api/students/records/:studentId/details/options', ({ request }) => {
        const query = new URL(request.url).searchParams;
        expect(query.get('submissionId')).toBe('submission-1');
        expect(query.get('fieldCode')).toBe('siblings');
        expect(query.get('selectedOnly')).toBe('true');
        const selected = query.getAll('selectedIds');
        calls.push(selected);
        return HttpResponse.json({
          data: selected.map((value) => ({
            value,
            label: labels[value],
            displayOrder: 0,
            isActive: true,
          })),
        });
      })
    );
    clearCachedAuthSession();
    mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
    const store = createDocumentTestStore();
    stores.push(store);
    const { result } = renderHook(() => useProfileChangeDiff(change, [registration]), {
      wrapper: ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(calls).toHaveLength(2);
    expect(calls.every((selected) => selected.length <= 20)).toBe(true);
    expect(new Set(calls.flat())).toEqual(new Set(ids));
    expect(result.current.diffs).toEqual([
      {
        label: 'Sibling students',
        before: previous.map((id) => labels[id]).join(', '),
        after: proposed.map((id) => labels[id]).join(', '),
      },
    ]);
  });
});
