import type { AppDispatch } from 'src/redux/store';

import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { studentOnboardingType } from 'src/redux/tagTypes';
import { studentOnboardingApi } from 'src/redux/student/onboarding/student-onboarding-api';

import { preloadStudentSetup } from './preload-student-setup';

const state = vi.hoisted(() => ({
  urls: [] as string[],
  denied: false,
  pause: null as Promise<void> | null,
  mismatch: false,
}));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  return {
    api: createApi({
      reducerPath: 'setupOpeningTest',
      baseQuery: async (input: string) => {
        state.urls.push(input);
        if (state.pause && input === '/student/onboarding/one') await state.pause;
        return state.denied
          ? { error: { status: 403, data: 'Denied' } }
          : {
              data: {
                id: state.mismatch ? 'other' : input.split('/onboarding/')[1]?.split('/')[0],
              },
            };
      },
      tagTypes: Object.values(studentOnboardingType),
      endpoints: () => ({}),
    }),
  };
});
const store = configureStore({
  reducer: {
    [studentOnboardingApi.reducerPath]: studentOnboardingApi.reducer,
    auth: (value: number | undefined, action: { type: string }) =>
      action.type === 'auth/replaced' ? (value ?? 0) + 1 : (value ?? 0),
  },
  middleware: (defaults) => defaults().concat(studentOnboardingApi.middleware),
});
const preload = (id: string) => preloadStudentSetup(store.dispatch as unknown as AppDispatch, id);
const settle = async () => {
  await Promise.all(store.dispatch(studentOnboardingApi.util.getRunningQueriesThunk()));
  await Promise.all(store.dispatch(studentOnboardingApi.util.getRunningQueriesThunk()));
};
afterEach(async () => {
  await settle();
  store.dispatch(studentOnboardingApi.util.resetApiState());
  state.urls = [];
  state.denied = false;
  state.pause = null;
  state.mismatch = false;
});

it('prepares only the four existing opening reads without any write or preview', async () => {
  preload('one');
  expect(state.urls).toEqual(['/student/onboarding/one', '/student/onboarding/one/fee-structure']);
  await settle();
  expect(state.urls).toEqual([
    '/student/onboarding/one',
    '/student/onboarding/one/fee-structure',
    '/student/onboarding/one/credentials',
    '/student/onboarding/one/workflow-documents',
  ]);
});
it('shares pending and cached reads with repeated clicks and destination subscribers', async () => {
  preload('one');
  preload('one');
  const reads = [
    store.dispatch(studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('one')),
    store.dispatch(studentOnboardingApi.endpoints.getStudentOnboardingFeeStructure.initiate('one')),
    store.dispatch(studentOnboardingApi.endpoints.getStudentOnboardingCredentials.initiate('one')),
    store.dispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingWorkflowDocuments.initiate('one')
    ),
  ];
  await Promise.all(reads);
  preload('one');
  await settle();
  expect(state.urls).toHaveLength(4);
  reads.forEach((read) => read.unsubscribe());
});
it('isolates case IDs and preserves the normal denied-read retry path', async () => {
  state.denied = true;
  preload('one');
  await settle();
  expect(
    studentOnboardingApi.endpoints.getStudentOnboardingCase.select('one')(store.getState()).isError
  ).toBe(true);
  state.denied = false;
  preload('two');
  await settle();
  expect(
    studentOnboardingApi.endpoints.getStudentOnboardingCase.select('two')(store.getState()).data?.id
  ).toBe('two');
  const read = store.dispatch(
    studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate('one')
  );
  await read;
  expect(state.urls).toHaveLength(7);
  read.unsubscribe();
});

it('does not prepare protected summaries across an auth change or mismatched case result', async () => {
  let release!: () => void;
  state.pause = new Promise<void>((resolve) => {
    release = resolve;
  });
  preload('one');
  store.dispatch({ type: 'auth/replaced' });
  release();
  await settle();
  expect(state.urls).toHaveLength(2);
  state.mismatch = true;
  preload('two');
  await settle();
  expect(state.urls).toHaveLength(4);
});
