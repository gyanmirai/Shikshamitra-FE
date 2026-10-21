import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { signOut, getSession } from 'next-auth/react';
import { instituteSetupType } from 'src/redux/tagTypes';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { schoolIdentityApi } from 'src/redux/InstituteSetup/schoolIdentityApi';

import { SchoolBrandingLogo } from './school-branding-logo';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({ getSession: vi.fn(), signOut: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('src/components/logo', () => ({ Logo: () => <span data-testid="default-logo" /> }));

const base = 'http://localhost:5000/api/institute-setup/school-identity';
const originalURL = URL;
const imageResponse = () =>
  new Response(new Blob(['synthetic image'], { type: 'image/png' }), {
    headers: { 'Content-Type': 'image/png' },
  });
const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;
let fetchMock: ReturnType<typeof vi.fn>;
let createObjectURL: ReturnType<typeof vi.fn<typeof URL.createObjectURL>>;
let revokeObjectURL: ReturnType<typeof vi.fn<typeof URL.revokeObjectURL>>;

function view(tenantId?: string) {
  return (
    <Provider store={store}>
      <SchoolBrandingLogo tenantId={tenantId} />
    </Provider>
  );
}

beforeEach(() => {
  clearCachedAuthSession();
  vi.mocked(getSession).mockResolvedValue({ accessToken: 'tenant-a-token' } as any);
  store = createStore();
  let sequence = 0;
  createObjectURL = vi.fn<typeof URL.createObjectURL>(() => {
    sequence += 1;
    return `blob:school-logo-${sequence}`;
  });
  revokeObjectURL = vi.fn<typeof URL.revokeObjectURL>();
  vi.stubGlobal(
    'URL',
    class extends originalURL {
      static createObjectURL = createObjectURL;

      static revokeObjectURL = revokeObjectURL;
    }
  );
  fetchMock = vi.fn().mockImplementation(async () => imageResponse());
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('loads the logo in one authenticated request and releases its object URL on unmount', async () => {
  const rendered = render(view('tenant-a'));
  expect(await screen.findByRole('img', { name: 'School logo' })).toHaveAttribute(
    'src',
    'blob:school-logo-1'
  );
  expect(fetchMock).toHaveBeenCalledOnce();
  const request = fetchMock.mock.calls[0][0] as Request;
  expect(request.url).toBe(`${base}/branding/logo`);
  expect(request.headers.get('Authorization')).toBe('Bearer tenant-a-token');
  rendered.unmount();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:school-logo-1');
});

it('does not request school branding for the host or a missing tenant', async () => {
  render(view());
  expect(screen.getByTestId('default-logo')).toBeVisible();
  expect(fetchMock).not.toHaveBeenCalled();
});

it('uses the default logo for a 204 response without allocating an object URL', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  render(view('tenant-a'));
  await waitFor(() =>
    expect(
      schoolIdentityApi.endpoints.getSchoolBrandingImage.select({
        tenantId: 'tenant-a',
        kind: 'logo',
      })(store.getState()).isSuccess
    ).toBe(true)
  );
  expect(screen.getByTestId('default-logo')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(createObjectURL).not.toHaveBeenCalled();
});

it('falls back when the request fails', async () => {
  fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));
  render(view('tenant-a'));
  await waitFor(() =>
    expect(
      schoolIdentityApi.endpoints.getSchoolBrandingImage.select({
        tenantId: 'tenant-a',
        kind: 'logo',
      })(store.getState()).isError
    ).toBe(true)
  );
  expect(screen.getByTestId('default-logo')).toBeVisible();
  expect(createObjectURL).not.toHaveBeenCalled();
});

it('preserves structured inactive-school errors for the shared authentication handler', async () => {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ errorCode: 'TENANT_INACTIVE' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  render(view('tenant-a'));
  await waitFor(() =>
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login?reason=tenant-inactive' })
  );
  expect(screen.getByTestId('default-logo')).toBeVisible();
  expect(createObjectURL).not.toHaveBeenCalled();
});

it('falls back for an undecodable image and recovers after branding invalidation', async () => {
  render(view('tenant-a'));
  fireEvent.error(await screen.findByRole('img', { name: 'School logo' }));
  expect(screen.getByTestId('default-logo')).toBeVisible();
  store.dispatch(api.util.invalidateTags([instituteSetupType.schoolIdentity]));
  await waitFor(() =>
    expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute(
      'src',
      'blob:school-logo-2'
    )
  );
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:school-logo-1');
});

it('clears the displayed image immediately when the tenant changes and fetches with the new token', async () => {
  const rendered = render(view('tenant-a'));
  await screen.findByRole('img', { name: 'School logo' });
  clearCachedAuthSession();
  vi.mocked(getSession).mockResolvedValue({ accessToken: 'tenant-b-token' } as any);
  let finish!: (response: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finish = resolve;
      })
  );
  rendered.rerender(view('tenant-b'));
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByTestId('default-logo')).toBeVisible();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:school-logo-1');
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  expect((fetchMock.mock.calls[1][0] as Request).headers.get('Authorization')).toBe(
    'Bearer tenant-b-token'
  );
  finish(imageResponse());
  await waitFor(() =>
    expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute(
      'src',
      'blob:school-logo-2'
    )
  );
  rendered.rerender(view());
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:school-logo-2');
});

it('ignores a previous tenant response that finishes after the new tenant logo loads', async () => {
  let finishOld!: (response: Response) => void;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finishOld = resolve;
      })
  );
  const rendered = render(view('tenant-a'));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  clearCachedAuthSession();
  vi.mocked(getSession).mockResolvedValue({ accessToken: 'tenant-b-token' } as any);
  rendered.rerender(view('tenant-b'));
  await screen.findByRole('img', { name: 'School logo' });
  finishOld(imageResponse());
  await waitFor(() =>
    expect(
      schoolIdentityApi.endpoints.getSchoolBrandingImage.select({
        tenantId: 'tenant-a',
        kind: 'logo',
      })(store.getState()).isLoading
    ).toBe(false)
  );
  expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute(
    'src',
    'blob:school-logo-1'
  );
  expect(createObjectURL).toHaveBeenCalledOnce();
});

it('reads the small branding metadata contract and supports the named banner route', async () => {
  const metadata = {
    logo: { id: 'logo-id', contentType: 'image/png', width: 40, height: 40 },
    banner: null,
  };
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(metadata), {
      headers: { 'Content-Type': 'application/json' },
    })
  );
  expect(
    await store
      .dispatch(schoolIdentityApi.endpoints.getSchoolBranding.initiate({ tenantId: 'tenant-a' }))
      .unwrap()
  ).toEqual(metadata);
  const banner = await store
    .dispatch(
      schoolIdentityApi.endpoints.getSchoolBrandingImage.initiate({
        tenantId: 'tenant-a',
        kind: 'banner',
      })
    )
    .unwrap();
  expect(banner?.type).toBe('image/png');
  expect((fetchMock.mock.calls[1][0] as Request).url).toBe(`${base}/branding/banner`);
});
