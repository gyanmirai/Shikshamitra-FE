import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { admissionFormStageApi } from 'src/redux/student/admissions/admission-form-stage-api';
import { admissionApplicationsApi } from 'src/redux/student/admissions/admission-applications-api';

import { preloadAdmissionApplication } from './preload-admission-application';

const requests = vi.hoisted(() => ({
  urls: [] as string[],
  fail: false,
  formWorkflow: false,
  managed: true,
  workflowStatus: 0,
  stageStatus: 1,
  mismatch: false,
  workflowPause: null as Promise<void> | null,
}));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  return {
    api: createApi({
      reducerPath: 'admissionOpeningTest',
      baseQuery: async (input: string) => {
        requests.urls.push(input);
        if (requests.fail) return { error: { status: 403, data: 'Access denied' } };
        if (input.endsWith('/workflow')) {
          if (requests.workflowPause) await requests.workflowPause;
          return {
            data: {
              status: requests.workflowStatus,
              currentStageInstanceId: 'form-stage',
              stages: requests.formWorkflow
                ? [
                    {
                      id: 'form-stage',
                      stageType: 1,
                      status: requests.stageStatus,
                      formStageEnabled: requests.managed,
                    },
                  ]
                : [],
            },
          };
        }
        return {
          data: {
            id: input.split('/applications/')[1]?.split('/')[0],
            currentStageInstanceId: requests.mismatch ? 'different-stage' : 'form-stage',
          },
        };
      },
      tagTypes: ['AdmissionApplication'] as any,
      endpoints: () => ({}),
    }),
  };
});

const store = configureStore({
  reducer: {
    [admissionApplicationsApi.reducerPath]: admissionApplicationsApi.reducer,
    auth: (state: { revision: number } | undefined, action: { type: string }) => {
      const current = state ?? { revision: 0 };
      return action.type === 'auth/replaced' ? { revision: current.revision + 1 } : current;
    },
  },
  middleware: (defaults) => defaults().concat(admissionApplicationsApi.middleware),
});
afterEach(async () => {
  await Promise.all(store.dispatch(admissionApplicationsApi.util.getRunningQueriesThunk()));
  store.dispatch(admissionApplicationsApi.util.resetApiState());
  requests.urls = [];
  requests.fail = false;
  requests.formWorkflow = false;
  requests.managed = true;
  requests.workflowStatus = 0;
  requests.stageStatus = 1;
  requests.mismatch = false;
  requests.workflowPause = null;
});

it('starts both opening reads immediately, without subscribing or loading other stages', async () => {
  preloadAdmissionApplication(store.dispatch as any, 'one');
  expect(requests.urls).toEqual([
    '/student/enrollment/admissions/applications/one',
    '/student/enrollment/admissions/applications/one/workflow',
  ]);
  await Promise.all(store.dispatch(admissionApplicationsApi.util.getRunningQueriesThunk()));
});

it('shares pending reads with the detail screen and repeated clicks, then reuses the same cache', async () => {
  preloadAdmissionApplication(store.dispatch as any, 'one');
  preloadAdmissionApplication(store.dispatch as any, 'one');
  const application = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('one')
  );
  const workflow = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplicationWorkflow.initiate('one')
  );
  await Promise.all([application, workflow]);
  preloadAdmissionApplication(store.dispatch as any, 'one');
  expect(requests.urls).toHaveLength(2);
  application.unsubscribe();
  workflow.unsubscribe();
});

it('keeps different applications in separate cache entries', async () => {
  preloadAdmissionApplication(store.dispatch as any, 'one');
  preloadAdmissionApplication(store.dispatch as any, 'two');
  expect(requests.urls).toHaveLength(4);
  expect(requests.urls.filter((url) => url.includes('/two'))).toHaveLength(2);
});

it('honors existing invalidation rather than retaining preloaded data after a write', async () => {
  preloadAdmissionApplication(store.dispatch as any, 'one');
  await Promise.all(store.dispatch(admissionApplicationsApi.util.getRunningQueriesThunk()));
  store.dispatch(
    admissionApplicationsApi.util.invalidateTags([studentAdmissionsCrmType.admissionApplication])
  );
  preloadAdmissionApplication(store.dispatch as any, 'one');
  expect(requests.urls).toHaveLength(4);
});

it('keeps denied reads rejected and allows the destination to retry normally', async () => {
  requests.fail = true;
  requests.formWorkflow = true;
  preloadAdmissionApplication(store.dispatch as any, 'one');
  await Promise.all(store.dispatch(admissionApplicationsApi.util.getRunningQueriesThunk()));
  expect(
    admissionApplicationsApi.endpoints.getAdmissionApplication.select('one')(store.getState())
      .status
  ).toBe('rejected');
  const retry = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplication.initiate('one')
  );
  await retry;
  expect(requests.urls).toHaveLength(3);
  await expect(retry).resolves.toMatchObject({ isError: true });
  retry.unsubscribe();
});

it('prepares active Form reads before the route mounts and shares them with its subscriptions', async () => {
  requests.formWorkflow = true;
  preloadAdmissionApplication(store.dispatch as any, 'one');
  await vi.waitFor(() => expect(requests.urls).toHaveLength(4));
  expect(requests.urls.slice(2)).toEqual([
    '/student/enrollment/admissions/applications/one/form',
    '/student/enrollment/admissions/applications/one/form-stages/form-stage',
  ]);
  const form = store.dispatch(
    admissionApplicationsApi.endpoints.getAdmissionApplicationForm.initiate('one')
  );
  const stage = store.dispatch(
    admissionFormStageApi.endpoints.getAdmissionFormStage.initiate({
      applicationId: 'one',
      stageId: 'form-stage',
    })
  );
  await Promise.all([form, stage]);
  expect(requests.urls).toHaveLength(4);
  form.unsubscribe();
  stage.unsubscribe();
});

it('does not request a managed summary for an unmanaged Form', async () => {
  requests.formWorkflow = true;
  requests.managed = false;
  preloadAdmissionApplication(store.dispatch as any, 'one');
  await vi.waitFor(() => expect(requests.urls).toHaveLength(3));
  expect(requests.urls.at(-1)).toBe('/student/enrollment/admissions/applications/one/form');
});

it('does not continue preloading after the authentication context changes', async () => {
  requests.formWorkflow = true;
  let release!: () => void;
  requests.workflowPause = new Promise<void>((resolve) => {
    release = resolve;
  });
  preloadAdmissionApplication(store.dispatch as any, 'one');
  store.dispatch({ type: 'auth/replaced' });
  release();
  await Promise.all(store.dispatch(admissionApplicationsApi.util.getRunningQueriesThunk()));
  await Promise.resolve();
  expect(requests.urls).toHaveLength(2);
});

it.each([
  { workflowStatus: 1, stageStatus: 1 },
  { workflowStatus: 0, stageStatus: 2 },
  { workflowStatus: 0, stageStatus: 1, mismatch: true },
])('does not prepare an inactive or inconsistent Form: %j', async (state) => {
  Object.assign(requests, { formWorkflow: true, ...state });
  preloadAdmissionApplication(store.dispatch as any, 'one');
  await Promise.all(store.dispatch(admissionApplicationsApi.util.getRunningQueriesThunk()));
  await Promise.resolve();
  expect(requests.urls).toHaveLength(2);
});
