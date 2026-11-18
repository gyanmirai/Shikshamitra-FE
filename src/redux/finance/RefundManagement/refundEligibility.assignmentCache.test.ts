import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, expect, it, vi } from 'vitest';

import { api } from 'src/redux/service';

import { studentFeeAssignmentApi } from '../studentFeeAssignment';
import { feeRefundApi } from './feeRefundManage';

const transport = vi.hoisted(() => ({ version: 'old-version', reads: 0, fail: false }));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  const { tagTypes } = await import('src/redux/tagTypes');
  return {
    api: createApi({
      reducerPath: 'api',
      tagTypes,
      endpoints: () => ({}),
      baseQuery: async (args: any) => {
        if (args.url === '/fee-refunds/eligibility') {
          transport.reads += 1;
          return { data: { refundPolicyVersionId: transport.version } };
        }
        if (transport.fail) return { error: { status: 409, data: {} } };
        transport.version = args.body.policies[0].versionId;
        return { data: { concurrencyStamp: 'updated', assignment: {} } };
      },
    }),
  };
});

beforeEach(() => {
  Object.assign(transport, { version: 'old-version', reads: 0, fail: false });
});

it.each([false, true])(
  'refreshes refund eligibility only after a successful policy repin (failure: %s)',
  async (fail) => {
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (getDefault) => getDefault().concat(api.middleware),
    });
    const args = { studentId: 'student', academicYearId: 'year' };
    const subscription = store.dispatch(feeRefundApi.endpoints.getRefundEligibility.initiate(args));
    try {
      expect((await subscription.unwrap()).refundPolicyVersionId).toBe('old-version');
      transport.fail = fail;
      const result = await store.dispatch(
        studentFeeAssignmentApi.endpoints.assignmentUpdatePolicies.initiate({
          ...args,
          concurrencyStamp: 'original',
          reason: 'Include paid charges and late fees in future refunds',
          policies: [{ family: 'refund', versionId: 'enabled-version' }],
        })
      );
      expect('error' in result).toBe(fail);
      await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
      expect(
        feeRefundApi.endpoints.getRefundEligibility.select(args)(store.getState()).data
          ?.refundPolicyVersionId
      ).toBe(fail ? 'old-version' : 'enabled-version');
      expect(transport.reads).toBe(fail ? 1 : 2);
    } finally {
      subscription.unsubscribe();
      store.dispatch(api.util.resetApiState());
    }
  }
);
