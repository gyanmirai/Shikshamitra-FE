import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { studentGroupApi } from 'src/redux/student/student-group/student-group';
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

it.each(['legacy', 'managed'] as const)(
  'refreshes both subscribed house catalogues once after each successful %s create, update and delete',
  async (writer) => {
    let houses: { id: string; name: string }[] = [];
    const reads = { legacy: 0, managed: 0 };
    const legacyRoot = '*/api/students/records';
    const house = { id: 'h1', name: 'Blue' };
    const updatedHouse = { ...house, name: 'Ocean' };
    const create = () => {
      houses = [house];
      return HttpResponse.json({ data: house });
    };
    const update = () => {
      houses = [updatedHouse];
      return HttpResponse.json({ data: updatedHouse });
    };
    const remove = () => {
      houses = [];
      return new HttpResponse(null, { status: 204 });
    };
    mswServer.use(
      http.get(`${root}/houses`, () => {
        reads.managed += 1;
        return HttpResponse.json({
          data: { items: houses, totalCount: houses.length, canManage: true },
        });
      }),
      http.get(`${legacyRoot}/academic-mediums/m1/house-settings`, () => {
        reads.legacy += 1;
        return HttpResponse.json(houses);
      }),
      http.post(`${root}/houses`, create),
      http.put(`${root}/houses/h1`, update),
      http.delete(`${root}/houses/h1`, remove),
      http.post(`${legacyRoot}/academic-mediums/m1/house-settings`, create),
      http.put(`${legacyRoot}/house-settings/h1`, update),
      http.delete(`${legacyRoot}/house-settings/h1`, remove)
    );
    const query = { academicMediumId: 'm1' };
    const managed = houseManagementApi.endpoints.getManagedHouses;
    const legacy = studentGroupApi.endpoints.getAllGroup;
    await Promise.all([
      store.dispatch(managed.initiate(query)).unwrap(),
      store.dispatch(legacy.initiate('m1')).unwrap(),
    ]);
    const expectCatalogues = async (items: typeof houses, readCount: number) => {
      await vi.waitFor(() => {
        expect(managed.select(query)(store.getState()).data?.items).toEqual(items);
        expect(legacy.select('m1')(store.getState()).data).toEqual(items);
      });
      expect(reads).toEqual({ legacy: readCount, managed: readCount });
    };
    await expectCatalogues([], 1);
    const body = { academicMediumId: 'm1', name: 'Blue', color: '#123456' };
    await (
      writer === 'legacy'
        ? store.dispatch(
            studentGroupApi.endpoints.addStudentGroup.initiate({ academicMediumId: 'm1', body })
          )
        : store.dispatch(houseManagementApi.endpoints.createManagedHouse.initiate(body))
    ).unwrap();
    await expectCatalogues([house], 2);
    await (
      writer === 'legacy'
        ? store.dispatch(
            studentGroupApi.endpoints.updateStudentGroup.initiate({
              houseSettingId: 'h1',
              body: { ...body, name: 'Ocean' },
            })
          )
        : store.dispatch(
            houseManagementApi.endpoints.updateManagedHouse.initiate({
              ...body,
              id: 'h1',
              name: 'Ocean',
              concurrencyStamp: 'v1',
            })
          )
    ).unwrap();
    await expectCatalogues([updatedHouse], 3);
    await (
      writer === 'legacy'
        ? store.dispatch(studentGroupApi.endpoints.deleteGroup.initiate('h1'))
        : store.dispatch(
            houseManagementApi.endpoints.deleteManagedHouse.initiate({
              id: 'h1',
              academicMediumId: 'm1',
              concurrencyStamp: 'v2',
            })
          )
    ).unwrap();
    await expectCatalogues([], 4);
    await Promise.all([
      store.dispatch(managed.initiate(query)).unwrap(),
      store.dispatch(legacy.initiate('m1')).unwrap(),
    ]);
    expect(reads).toEqual({ legacy: 4, managed: 4 });
  }
);

it('keeps the legacy catalogue cached when only a student membership changes', async () => {
  let reads = 0;
  mswServer.use(
    http.get('*/api/students/records/academic-mediums/m1/house-settings', () => {
      reads += 1;
      return HttpResponse.json([{ id: 'h1', name: 'Blue' }]);
    }),
    http.post(`${root}/assignments/commit`, () => new HttpResponse(null, { status: 204 }))
  );
  await store.dispatch(studentGroupApi.endpoints.getAllGroup.initiate('m1')).unwrap();
  await store
    .dispatch(
      houseManagementApi.endpoints.commitHouseAssignment.initiate({
        academicMediumId: 'm1',
        enrollmentIds: ['e1'],
        houseId: 'h1',
        previewToken: 'reviewed',
      })
    )
    .unwrap();
  await store.dispatch(studentGroupApi.endpoints.getAllGroup.initiate('m1')).unwrap();
  expect(reads).toBe(1);
});
