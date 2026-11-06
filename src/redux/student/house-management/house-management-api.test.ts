import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { createDocumentTestStore } from 'src/redux/student/admissions/document-test-fixture';

import { houseManagementApi } from './house-management-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createDocumentTestStore>;
const root = '*/api/students/records/house-management';
beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'synthetic-house-test' }))
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('uploads house logos using authenticated multipart storage and returns a saved file reference', async () => {
  mswServer.use(
    http.post('*/api/files', async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer synthetic-house-test');
      const body = await request.formData();
      expect((body.get('file') as File).name).toBe('falcons.png');
      return HttpResponse.json({ data: 'saved-logo.png' });
    })
  );
  await expect(
    store
      .dispatch(
        houseManagementApi.endpoints.uploadHouseLogo.initiate(
          new File(['logo'], 'falcons.png', { type: 'image/png' })
        )
      )
      .unwrap()
  ).resolves.toBe('/api/files/saved-logo.png');
});

it('sends server roster filters and unwraps only the current medium response', async () => {
  mswServer.use(
    http.get(`${root}/students`, ({ request }) => {
      expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({
        academicMediumId: 'm1',
        standardId: 'c1',
        unassignedOnly: 'true',
        skipCount: '25',
        maxResultCount: '25',
        filter: 'Riya',
        sorting: 'studentName desc',
      });
      return HttpResponse.json({ data: { items: [], totalCount: 0 } });
    })
  );
  expect(
    await store
      .dispatch(
        houseManagementApi.endpoints.getHouseStudents.initiate({
          academicMediumId: 'm1',
          standardId: 'c1',
          unassignedOnly: true,
          skipCount: 25,
          maxResultCount: 25,
          filter: 'Riya',
          sorting: 'studentName desc',
        })
      )
      .unwrap()
  ).toEqual({ items: [], totalCount: 0 });
});
it('sends the exact reviewed token and null destination for membership removal', async () => {
  const command = {
    academicMediumId: 'm1',
    enrollmentIds: ['e1', 'e2'],
    houseId: null,
    previewToken: 'reviewed-version',
  };
  mswServer.use(
    http.post(`${root}/assignments/commit`, async ({ request }) => {
      expect(await request.json()).toEqual(command);
      return HttpResponse.json({ data: null });
    })
  );
  await expect(
    store.dispatch(houseManagementApi.endpoints.commitHouseAssignment.initiate(command)).unwrap()
  ).resolves.toBeDefined();
});
it('keeps rejected stale commits from refreshing saved lists', async () => {
  let reads = 0;
  mswServer.use(
    http.get(`${root}/houses`, () => {
      reads += 1;
      return HttpResponse.json({ data: { items: [], totalCount: 0, canManage: false } });
    }),
    http.post(`${root}/assignments/commit`, () =>
      HttpResponse.json(
        { error: { code: 'Students:HouseManagement:StalePreview', message: 'Preview again.' } },
        { status: 409 }
      )
    )
  );
  const read = await store
    .dispatch(houseManagementApi.endpoints.getManagedHouses.initiate({ academicMediumId: 'm1' }))
    .unwrap();
  expect(read.canManage).toBe(false);
  await expect(
    store
      .dispatch(
        houseManagementApi.endpoints.commitHouseAssignment.initiate({
          academicMediumId: 'm1',
          enrollmentIds: ['e1'],
          houseId: null,
          previewToken: 'stale',
        })
      )
      .unwrap()
  ).rejects.toBeDefined();
  expect(reads).toBe(1);
});

it('refreshes the current house catalogue after successful create, update and delete', async () => {
  let houses: { id: string; name: string }[] = [];
  let reads = 0;
  const house = { id: 'h1', name: 'Blue' };
  const updatedHouse = { ...house, name: 'Ocean' };
  mswServer.use(
    http.get(`${root}/houses`, () => {
      reads += 1;
      return HttpResponse.json({
        data: { items: houses, totalCount: houses.length, canManage: true },
      });
    }),
    http.post(`${root}/houses`, () => {
      houses = [house];
      return HttpResponse.json({ data: house });
    }),
    http.put(`${root}/houses/h1`, () => {
      houses = [updatedHouse];
      return HttpResponse.json({ data: updatedHouse });
    }),
    http.delete(`${root}/houses/h1`, () => {
      houses = [];
      return new HttpResponse(null, { status: 204 });
    })
  );
  const query = { academicMediumId: 'm1' };
  const managed = houseManagementApi.endpoints.getManagedHouses;
  const expectCatalogue = async (items: typeof houses, readCount: number) => {
    await vi.waitFor(() => {
      expect(managed.select(query)(store.getState()).data?.items).toEqual(items);
    });
    expect(reads).toBe(readCount);
  };
  await store.dispatch(managed.initiate(query)).unwrap();
  await expectCatalogue([], 1);
  const body = { academicMediumId: 'm1', name: 'Blue', color: '#123456' };
  await store.dispatch(houseManagementApi.endpoints.createManagedHouse.initiate(body)).unwrap();
  await expectCatalogue([house], 2);
  await store
    .dispatch(
      houseManagementApi.endpoints.updateManagedHouse.initiate({
        ...body,
        id: 'h1',
        name: 'Ocean',
        concurrencyStamp: 'v1',
      })
    )
    .unwrap();
  await expectCatalogue([updatedHouse], 3);
  await store
    .dispatch(
      houseManagementApi.endpoints.deleteManagedHouse.initiate({
        id: 'h1',
        academicMediumId: 'm1',
        concurrencyStamp: 'v2',
      })
    )
    .unwrap();
  await expectCatalogue([], 4);
});
