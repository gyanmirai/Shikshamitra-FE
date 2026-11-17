import type { AppDispatch } from 'src/redux/store';

import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { studentType, studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { admissionInquiriesApi } from 'src/redux/student/admissions/admission-inquiries-api';
import { admissionInquiryManagementApi } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { preloadInquiryWorkspace } from './preload-inquiry-workspace';

const state = vi.hoisted(() => ({ urls: [] as string[], denied: false }));
vi.mock('src/redux/service', async () => {
  const { createApi } = await import('@reduxjs/toolkit/query/react');
  return {
    api: createApi({
      reducerPath: 'inquiryOpeningTest',
      baseQuery: async (input: string) => {
        state.urls.push(input);
        if (state.denied) return { error: { status: 403, data: 'Denied' } };
        return { data: { id: input.split('/inquiries/')[1]?.split('/')[0] } };
      },
      tagTypes: [...Object.values(studentType), ...Object.values(studentAdmissionsCrmType)],
      endpoints: () => ({}),
    }),
  };
});

const store = configureStore({
  reducer: { [admissionInquiriesApi.reducerPath]: admissionInquiriesApi.reducer },
  middleware: (defaults) => defaults().concat(admissionInquiriesApi.middleware),
});
const preload = (id: string) =>
  preloadInquiryWorkspace(store.dispatch as unknown as AppDispatch, id);
const settle = () =>
  Promise.all(store.dispatch(admissionInquiriesApi.util.getRunningQueriesThunk()));
afterEach(async () => {
  await settle();
  store.dispatch(admissionInquiriesApi.util.resetApiState());
  state.urls = [];
  state.denied = false;
});

it('starts only the existing detail and management reads alongside navigation', async () => {
  preload('one');
  expect(state.urls).toEqual([
    '/student/enrollment/admissions/inquiries/one',
    '/student/enrollment/admissions/inquiries/one/management',
  ]);
  await settle();
});

it('shares pending requests with repeated clicks and destination subscriptions', async () => {
  preload('one');
  preload('one');
  const detail = store.dispatch(
    admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('one')
  );
  const management = store.dispatch(
    admissionInquiryManagementApi.endpoints.getAdmissionInquiryManagement.initiate('one')
  );
  await Promise.all([detail, management]);
  preload('one');
  await settle();
  expect(state.urls).toHaveLength(2);
  detail.unsubscribe();
  management.unsubscribe();
});

it('keeps different record keys isolated', async () => {
  preload('one');
  preload('two');
  await settle();
  expect(state.urls).toHaveLength(4);
  expect(
    admissionInquiriesApi.endpoints.getAdmissionInquiry.select('two')(store.getState()).data?.id
  ).toBe('two');
});

it('does not turn access failures into cached success and lets the normal screen retry', async () => {
  state.denied = true;
  preload('one');
  await settle();
  expect(
    admissionInquiriesApi.endpoints.getAdmissionInquiry.select('one')(store.getState()).isError
  ).toBe(true);
  state.denied = false;
  const read = store.dispatch(admissionInquiriesApi.endpoints.getAdmissionInquiry.initiate('one'));
  await read;
  expect(
    admissionInquiriesApi.endpoints.getAdmissionInquiry.select('one')(store.getState()).data?.id
  ).toBe('one');
  expect(state.urls).toHaveLength(3);
  read.unsubscribe();
});

it('retains the existing invalidation contract for previously prepared reads', async () => {
  preload('one');
  await settle();
  store.dispatch(
    admissionInquiriesApi.util.invalidateTags([
      { type: studentAdmissionsCrmType.admissionInquiry, id: 'one' },
    ])
  );
  preload('one');
  await settle();
  expect(state.urls).toHaveLength(4);
});
