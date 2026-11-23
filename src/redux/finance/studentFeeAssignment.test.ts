import { it, vi, expect } from 'vitest';
import { financeModuleType } from 'src/redux/tagTypes';

import './studentFeeAssignment';

const { endpoints } = vi.hoisted(() => ({
  endpoints: {} as Record<
    string,
    {
      query: (input: unknown) => unknown;
      invalidatesTags: (result: unknown, error: unknown, input: unknown) => unknown;
    }
  >,
}));

vi.mock('src/redux/service', () => ({
  api: {
    injectEndpoints: ({
      endpoints: build,
    }: {
      endpoints: (builder: {
        query: (definition: unknown) => unknown;
        mutation: (definition: unknown) => unknown;
      }) => object;
    }) => {
      Object.assign(
        endpoints,
        build({
          query: (definition) => definition,
          mutation: (definition) => definition,
        })
      );
      return {};
    },
  },
}));

it('routes restart by student and refreshes assignment and collection data only after success', () => {
  const studentId = 'student';
  const scope = { academicYearId: 'year', feeHeadId: 'transport' };
  const body = {
    ...scope,
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    monthlyRate: 750.25,
    prorationPolicyVersionId: 'proration-v2',
    paymentTermVersionId: 'monthly-v1',
    requestId: 'request',
  };
  const route = '/student-fee-structure/student/student/optional-service-restart';
  expect(endpoints.assignmentOptionalServiceRestartContext.query({ studentId, ...scope })).toEqual({
    url: `${route}/context`,
    params: scope,
  });
  expect(endpoints.assignmentOptionalServiceRestartPreview.query({ studentId, ...body })).toEqual({
    url: `${route}/preview`,
    method: 'POST',
    body,
  });
  const save = endpoints.assignmentOptionalServiceRestart;
  const commit = { ...body, previewToken: 'quote' };
  expect(save.query({ studentId, ...commit })).toEqual({
    url: route,
    method: 'POST',
    body: commit,
  });
  expect(save.invalidatesTags(undefined, { status: 409 }, { studentId, ...commit })).toEqual([]);
  expect(save.invalidatesTags({}, undefined, { studentId, ...commit })).toEqual([
    { type: financeModuleType.studentFeeAssignment, id: 'year:student:student' },
    financeModuleType.feeCollection,
    financeModuleType.feeDetails,
  ]);
});
