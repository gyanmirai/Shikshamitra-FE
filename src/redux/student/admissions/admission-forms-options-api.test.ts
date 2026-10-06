import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { admissionFormsApi } from './admission-forms-api';
import { createDocumentTestStore } from './document-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createDocumentTestStore>;
let requestParams: URLSearchParams;
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/student/enrollment/admissions/forms/metadata/options', ({ request }) => {
      requestParams = new URL(request.url).searchParams;
      return HttpResponse.json({
        data: [{ value: 'student-1', label: 'Asha', displayOrder: 0, isActive: true }],
      });
    })
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('sends bounded sibling search and repeated selected IDs without undefined query parameters', async () => {
  const selectedIds = [
    '01a10d21-822d-7ce0-a344-302c0506a570',
    '01a10d21-822d-7ce0-a344-302c0506a571',
  ];
  const result = await store
    .dispatch(
      admissionFormsApi.endpoints.getAdmissionFormOptions.initiate({
        sourceKey: 'StudentSiblings',
        searchTerm: 'Asha & family',
        skipCount: 20,
        maxResultCount: 21,
        selectedIds,
      })
    )
    .unwrap();
  expect(requestParams.getAll('selectedIds')).toEqual(selectedIds);
  expect(requestParams.get('searchTerm')).toBe('Asha & family');
  expect(requestParams.get('skipCount')).toBe('20');
  expect(requestParams.get('maxResultCount')).toBe('21');
  expect(requestParams.has('parentId')).toBe(false);
  expect(requestParams.has('academicYearId')).toBe(false);
  expect(result[0].label).toBe('Asha');
});

it('sends sibling search paging without requiring selected IDs', async () => {
  await store
    .dispatch(
      admissionFormsApi.endpoints.getAdmissionFormOptions.initiate({
        sourceKey: 'StudentSiblings',
        searchTerm: 'Asha',
        skipCount: 0,
        maxResultCount: 21,
      })
    )
    .unwrap();
  expect(Object.fromEntries(requestParams)).toEqual({
    sourceKey: 'StudentSiblings',
    searchTerm: 'Asha',
    skipCount: '0',
    maxResultCount: '21',
  });
});

it('preserves dependent lookup parameters and omits sibling-only arguments for other sources', async () => {
  await store
    .dispatch(
      admissionFormsApi.endpoints.getAdmissionFormOptions.initiate({
        sourceKey: 'StudentClasses',
        parentId: 'school-1',
        academicYearId: 'year-1',
        searchTerm: 'ignored',
        skipCount: 20,
        maxResultCount: 21,
        selectedIds: ['ignored'],
      })
    )
    .unwrap();
  expect(Object.fromEntries(requestParams)).toEqual({
    sourceKey: 'StudentClasses',
    parentId: 'school-1',
    academicYearId: 'year-1',
  });
});
