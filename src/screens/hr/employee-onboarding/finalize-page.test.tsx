import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { hrPermissions } from 'src/constants/hr-menus';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, waitFor } from '@testing-library/react';

import FinalizeOnboardingPage from './finalize-page';

const route = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), search: '' }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next/navigation', () => ({
  useRouter: () => route,
  useSearchParams: () => new URLSearchParams(route.search),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
// Exercise the real query/page boundary independently of the separately tested full wizard.
vi.mock('./index', () => ({
  FinalizeWorkflow: ({ application, readReady, readError, onRetry, onFinalized }: any) => {
    const [draft, setDraft] = useState(application.fullName);
    return (
      <>
        <label htmlFor="draft">
          Draft
          <input id="draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
        </label>
        {readError && <p role="alert">Refresh failed; draft retained</p>}
        <button type="button" onClick={onRetry}>
          Refresh application
        </button>
        <button type="button" disabled={!readReady} onClick={onFinalized}>
          Finalize test workflow
        </button>
      </>
    );
  },
}));

const idA = '11111111-1111-1111-1111-111111111111';
const idB = '22222222-2222-2222-2222-222222222222';
const application = (id: string, fullName = 'Synthetic applicant'): EmployeeApplication => ({
  id,
  fullName,
  applicationNumber: 'APP-TEST',
  status: 5,
  hasPhoto: false,
  hasResume: false,
  tokenExpiresAt: '',
  linkLastIssuedAt: '',
  creationTime: '',
});
let auth: any;
let store: any;
let reads = 0;
let responseStatus = 200;
let responseName = 'Synthetic applicant';

const view = (id = idA) => (
  <Provider store={store}>
    <FinalizeOnboardingPage applicationId={id} />
  </Provider>
);
beforeEach(() => {
  vi.clearAllMocks();
  clearCachedAuthSession();
  reads = 0;
  responseStatus = 200;
  responseName = 'Synthetic applicant';
  route.search = '';
  auth = {
    loading: false,
    permissionsInitialized: true,
    initializationVersion: 1,
    user: { sub: 'actor-a' },
    sessionContext: { tenantId: 'tenant-a' },
    permissions: ['View', 'Finalize'].map((action) => ({
      name: `${hrPermissions.employee.onboarding}.${action}`,
      isGranted: true,
    })),
  };
  store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: (state: any, action: any) =>
        action.type === 'test/auth' ? { ...state, ...action.payload } : (state ?? auth),
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'test-token' })),
    http.get('*/api/employee-applications/:id', ({ params }) => {
      reads += 1;
      return responseStatus === 200
        ? HttpResponse.json(application(String(params.id), responseName))
        : HttpResponse.json({ detail: 'Unavailable' }, { status: responseStatus });
    })
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('loads a direct link independently, preserves safe return context and navigates once on success', async () => {
  const user = userEvent.setup();
  route.search = new URLSearchParams({
    returnTo: '/hr/employee/onboarding?page=3&pageSize=25&search=Synthetic&status=5',
  }).toString();
  render(view());
  expect(await screen.findByLabelText('Draft')).toHaveValue('Synthetic applicant');
  expect(reads).toBe(1);
  await user.click(screen.getByRole('button', { name: 'Finalize test workflow' }));
  expect(route.replace).toHaveBeenCalledWith(
    '/hr/employee/onboarding?page=3&pageSize=25&search=Synthetic&status=5'
  );
});

it('preserves an edited draft after 503, blocks stale finalization and recovers without resetting it', async () => {
  const user = userEvent.setup();
  render(view());
  const input = await screen.findByLabelText('Draft');
  await user.clear(input);
  await user.type(input, 'Unsaved draft');
  responseStatus = 503;
  await user.click(screen.getByRole('button', { name: 'Refresh application' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('draft retained');
  expect(input).toHaveValue('Unsaved draft');
  expect(screen.getByRole('button', { name: 'Finalize test workflow' })).toBeDisabled();
  responseStatus = 200;
  await user.click(screen.getByRole('button', { name: 'Refresh application' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Finalize test workflow' })).toBeEnabled()
  );
  expect(screen.getByLabelText('Draft')).toBe(input);
  expect(input).toHaveValue('Unsaved draft');
});

it.each([403, 404])('removes cached protected content after a %s read failure', async (status) => {
  const user = userEvent.setup();
  render(view());
  await screen.findByLabelText('Draft');
  responseStatus = status;
  await user.click(screen.getByRole('button', { name: 'Refresh application' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    status === 403 ? 'current access' : 'not found'
  );
  expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument();
});

it('cancels the previous application read and ignores its late response after a param change', async () => {
  let release: (() => void) | undefined;
  let aborted = false;
  let started = false;
  mswServer.use(
    http.get('*/api/employee-applications/:id', async ({ params, request }) => {
      if (params.id === idA) {
        started = true;
        request.signal.addEventListener('abort', () => {
          aborted = true;
        });
        await new Promise<void>((resolve) => {
          release = resolve;
        });
      }
      return HttpResponse.json(
        application(String(params.id), params.id === idA ? 'Old application' : 'New application')
      );
    })
  );
  const mounted = render(view(idA));
  await waitFor(() => expect(started).toBe(true));
  mounted.rerender(view(idB));
  expect(await screen.findByLabelText('Draft')).toHaveValue('New application');
  await act(async () => {
    release?.();
  });
  expect(aborted).toBe(true);
  expect(screen.getByLabelText('Draft')).toHaveValue('New application');
});

it('starts a new in-memory draft and fresh read for a changed actor/tenant scope', async () => {
  const user = userEvent.setup();
  render(view());
  const input = await screen.findByLabelText('Draft');
  await user.type(input, ' edited');
  responseName = 'New scope application';
  act(() =>
    store.dispatch({
      type: 'test/auth',
      payload: {
        user: { sub: 'actor-b' },
        sessionContext: { tenantId: 'tenant-b' },
        initializationVersion: 2,
      },
    })
  );
  expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByLabelText('Draft')).toHaveValue('New scope application'));
  expect(reads).toBe(2);
});

it('rejects a response for the wrong ID rather than rendering it as the requested application', async () => {
  mswServer.use(
    http.get('*/api/employee-applications/:id', () =>
      HttpResponse.json(application(idB, 'Wrong applicant'))
    )
  );
  render(view(idA));
  expect(await screen.findByRole('alert')).toHaveTextContent('could not be loaded or verified');
  expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument();
  expect(screen.queryByText('Wrong applicant')).not.toBeInTheDocument();
});

it.each([0, 6, 7, 8])(
  'does not mount the wizard for ineligible application status %s',
  async (status) => {
    mswServer.use(
      http.get('*/api/employee-applications/:id', () =>
        HttpResponse.json({ ...application(idA), status })
      )
    );
    render(view());
    expect(await screen.findByRole('alert')).toHaveTextContent('not eligible for finalization');
    expect(screen.queryByLabelText('Draft')).not.toBeInTheDocument();
  }
);

it.each(['View', 'Finalize'])(
  'requires the exact existing %s grant before reading application data',
  (action) => {
    store.dispatch({
      type: 'test/auth',
      payload: {
        permissions: auth.permissions.filter(
          (p: any) => p.name !== `${hrPermissions.employee.onboarding}.${action}`
        ),
      },
    });
    render(view());
    expect(screen.getByRole('alert')).toHaveTextContent('do not have permission');
    expect(reads).toBe(0);
  }
);

it('does not issue an application read for a malformed route identifier', () => {
  render(view('../other'));
  expect(screen.getByRole('alert')).toHaveTextContent('link is invalid');
  expect(reads).toBe(0);
});

it('waits for access initialization before issuing a scoped read', async () => {
  act(() =>
    store.dispatch({ type: 'test/auth', payload: { loading: true, permissionsInitialized: false } })
  );
  render(view());
  expect(screen.getByLabelText('Loading onboarding access')).toBeInTheDocument();
  expect(reads).toBe(0);
  act(() =>
    store.dispatch({ type: 'test/auth', payload: { loading: false, permissionsInitialized: true } })
  );
  expect(await screen.findByLabelText('Draft')).toHaveValue('Synthetic applicant');
  expect(reads).toBe(1);
});

it('loads an uppercase Guid deep link using its canonical application identity', async () => {
  render(view('AAAAAAAA-1111-1111-1111-111111111111'));
  expect(await screen.findByLabelText('Draft')).toHaveValue('Synthetic applicant');
  expect(reads).toBe(1);
});
