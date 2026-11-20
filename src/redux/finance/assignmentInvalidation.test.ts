import { beforeEach, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { api } from 'src/redux/service';
import { feeCollectionApi } from 'src/redux/feeCollection/feeCollection';
import { studentFeeAssignmentApi } from './studentFeeAssignment';

const transport = vi.hoisted(() => ({
  reads: {} as Record<string, number>,
  writes: [] as string[],
  fail: false,
}));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes, financeModuleType } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      keepUnusedDataFor: 0,
      baseQuery: async (args: any) => {
        const url = typeof args === 'string' ? args : args.url;
        if (url.startsWith('/audit-assignment/')) {
          transport.reads[url] = (transport.reads[url] ?? 0) + 1;
          return { data: {} };
        }
        transport.writes.push(url);
        return transport.fail
          ? { error: { status: 500, data: {} } }
          : { data: { assignmentId: 'assignment', outcome: 'Assigned', assignment: {} } };
      },
      endpoints: (builder) => ({
        auditAssignment: builder.query<object, string>({
          query: (studentId) => '/audit-assignment/' + studentId,
          providesTags: (_result, _error, studentId) => [
            { type: financeModuleType.studentFeeAssignment, id: 'year:student:' + studentId },
          ],
        }),
      }),
    }),
  };
});

beforeEach(() => {
  transport.reads = {};
  transport.writes = [];
  transport.fail = false;
});
const store = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
const subscribe = async (instance: ReturnType<typeof store>) => {
  const audit = api as typeof api & { endpoints: { auditAssignment: any } };
  await instance.dispatch(audit.endpoints.auditAssignment.initiate('one'));
  await instance.dispatch(audit.endpoints.auditAssignment.initiate('two'));
};

it('refreshes assignment eligibility after a successful fee collection', async () => {
  const instance = store();
  await subscribe(instance);
  const result = await instance.dispatch(
    feeCollectionApi.endpoints.collectFee.initiate({
      studentId: 'one',
      academicYearId: 'year',
    } as never)
  );
  expect(transport.writes).toContain('/fee-collections');
  expect(result).toHaveProperty('data');
  await Promise.all(instance.dispatch(api.util.getRunningQueriesThunk()));
  expect(transport.reads['/audit-assignment/one']).toBe(2);
  instance.dispatch(api.util.resetApiState());
});

it('does not refresh assignment eligibility after a failed fee collection', async () => {
  const instance = store();
  await subscribe(instance);
  transport.fail = true;
  await instance.dispatch(
    feeCollectionApi.endpoints.collectFee.initiate({
      studentId: 'one',
      academicYearId: 'year',
    } as never)
  );
  expect(transport.reads['/audit-assignment/one']).toBe(1);
  instance.dispatch(api.util.resetApiState());
});

it('refreshes only the confirmed student after an assignment command', async () => {
  const instance = store();
  await subscribe(instance);
  await instance.dispatch(
    studentFeeAssignmentApi.endpoints.assignmentCommit.initiate({
      studentId: 'one',
      academicYearId: 'year',
    } as never)
  );
  await Promise.all(instance.dispatch(api.util.getRunningQueriesThunk()));
  expect(transport.reads['/audit-assignment/one']).toBe(2);
  expect(transport.reads['/audit-assignment/two']).toBe(1);
  instance.dispatch(api.util.resetApiState());
});

vi.mock('src/redux/finance/financeModuleApi', async () => {
  const { api } = await import('src/redux/service');
  return { financeModuleApi: api };
});
