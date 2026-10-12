import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, cleanup, waitFor, renderHook } from '@testing-library/react';

import { createDocumentTestStore } from './document-test-fixture';
import {
  admissionIntakeProfilesApi,
  useGetAdmissionIntakeCounsellorsQuery,
  useGetAdmissionPublicInquiryLinkOptionsQuery,
} from './admission-intake-profiles-api';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createDocumentTestStore>;
const optionsPath = '*/api/student/enrollment/admissions/public-inquiry-links/options';
const linkOptions = [
  { counsellorAssignmentProfileId: 'profile-1', inquiryFormDefinitionId: 'form-1' },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

beforeEach(() => {
  clearCachedAuthSession();
  store = createDocumentTestStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

afterEach(() => {
  cleanup();
  act(() => {
    store.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

it('exports the real generated public inquiry link options hook', () => {
  expect(useGetAdmissionPublicInquiryLinkOptionsQuery).toBeTypeOf('function');
  expect(useGetAdmissionPublicInquiryLinkOptionsQuery).toBe(
    admissionIntakeProfilesApi.endpoints.getAdmissionPublicInquiryLinkOptions.useQuery
  );
});

it.each([true, false])(
  'requests counsellor role filtering only when opted in (%s)',
  async (counsellorOnly) => {
    let query = new URLSearchParams();
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/intake-profiles/counsellors', ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json({
          data: [{ id: 'counsellor-1', name: 'Counsellor', userName: 'counsellor' }],
        });
      })
    );
    const { result } = renderHook(
      () =>
        useGetAdmissionIntakeCounsellorsQuery(
          counsellorOnly ? { counsellorOnly: true } : undefined
        ),
      { wrapper }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(query.get('counsellorOnly')).toBe(counsellorOnly ? 'true' : null);
    expect(result.current.data?.[0].id).toBe('counsellor-1');
  }
);

it.each(['plain', 'enveloped'] as const)(
  'requests cycle-scoped options and normalizes a %s response through the real hook',
  async (shape) => {
    let query = new URLSearchParams();
    mswServer.use(
      http.get(optionsPath, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json(shape === 'plain' ? linkOptions : { data: linkOptions });
      })
    );

    const { result } = renderHook(() => useGetAdmissionPublicInquiryLinkOptionsQuery('cycle-1'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(query.get('admissionCycleId')).toBe('cycle-1');
    expect(result.current.currentData).toEqual(linkOptions);
  }
);

it('does not request link options before an admission period is selected', () => {
  const request = vi.fn(() => HttpResponse.json(linkOptions));
  mswServer.use(http.get(optionsPath, request));

  const { result } = renderHook(
    () => useGetAdmissionPublicInquiryLinkOptionsQuery('', { skip: true }),
    { wrapper }
  );

  expect(result.current.isUninitialized).toBe(true);
  expect(request).not.toHaveBeenCalled();
});

it('exposes a failed options request without reporting routing data as ready', async () => {
  mswServer.use(
    http.get(optionsPath, () => HttpResponse.json({ detail: 'Unavailable' }, { status: 500 }))
  );

  const { result } = renderHook(() => useGetAdmissionPublicInquiryLinkOptionsQuery('cycle-1'), {
    wrapper,
  });

  await waitFor(() => expect(result.current.isError).toBe(true));
  expect(result.current.currentData).toBeUndefined();
  expect(result.current.error).toMatchObject({ status: 500 });
});

it('restores with a concurrency stamp and refreshes the archived setup list', async () => {
  let restored = false;
  let body: unknown;
  const path = '*/api/student/enrollment/admissions/intake-setups';
  mswServer.use(
    http.get(path, () => HttpResponse.json({ data: [{ id: 'setup-1', isArchived: !restored }] })),
    http.post(`${path}/setup-1/restore`, async ({ request }) => {
      body = await request.json();
      restored = true;
      return HttpResponse.json({ data: { id: 'setup-1', isArchived: false } });
    })
  );
  const { result } = renderHook(
    () =>
      admissionIntakeProfilesApi.endpoints.getAdmissionIntakeSetups.useQuery({
        includeArchived: true,
      }),
    { wrapper }
  );
  await waitFor(() => expect(result.current.data?.[0].isArchived).toBe(true));
  await act(async () => {
    await store
      .dispatch(
        admissionIntakeProfilesApi.endpoints.restoreAdmissionIntakeSetup.initiate({
          id: 'setup-1',
          concurrencyStamp: 'latest-stamp',
        })
      )
      .unwrap();
  });
  expect(body).toEqual({ concurrencyStamp: 'latest-stamp' });
  await waitFor(() => expect(result.current.data?.[0].isArchived).toBe(false));
});
