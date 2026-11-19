import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { act, render, screen, cleanup, waitFor } from '@testing-library/react';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { vi, it, expect, afterEach } from 'vitest';

import StudentPhotoAvatar from './student-photo-avatar';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const studentId = 'be93149c-0144-4baa-a776-217af73be301';
const photoPath = `*/api/students/records/${studentId}/photo`;
const permission = { name: 'Students.Records.StudentList.View', isGranted: true };
const makeStore = () =>
  configureStore({
    reducer: { auth, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });

function setup({
  granted = true,
  hasPhoto,
  lazy = false,
  copies = 1,
  status = 200,
}: {
  granted?: boolean;
  hasPhoto?: boolean;
  lazy?: boolean;
  copies?: number;
  status?: number;
} = {}) {
  const response = vi.fn(
    () =>
      new HttpResponse(status === 200 ? new Uint8Array([137, 80, 78, 71]) : null, {
        status,
        headers: { 'Content-Type': 'image/png' },
      })
  );
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(photoPath, response)
  );
  const store = makeStore();
  store.dispatch(setPermissions(granted ? [permission] : []));
  render(
    <Provider store={store}>
      {Array.from({ length: copies }, (_, index) => (
        <StudentPhotoAvatar
          key={index}
          studentId={studentId}
          hasPhoto={hasPhoto}
          alt="Aanya Patel"
          lazy={lazy}
        >
          AP
        </StudentPhotoAvatar>
      ))}
    </Provider>
  );
  return { response, store };
}

afterEach(() => {
  cleanup();
  clearCachedAuthSession();
  vi.unstubAllGlobals();
});

it.each([{ granted: false }, { hasPhoto: false }])(
  'keeps initials and skips requesting the photo for %o',
  (options) => {
    const { store } = setup(options);
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(Object.keys(store.getState().api.queries)).toHaveLength(0);
  }
);

it.each([404, 403])('keeps initials when the photo API returns %s', async (status) => {
  const { store } = setup({ status });
  await waitFor(() =>
    expect(Object.values(store.getState().api.queries)[0]?.status).toBe('rejected')
  );
  expect(screen.getByText('AP')).toBeInTheDocument();
  expect(screen.queryByRole('img')).toBeNull();
});

it('loads a table photo once its rows are visible and shares the request', async () => {
  const notify: (() => void)[] = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        notify.push(() =>
          callback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            this as unknown as IntersectionObserver
          )
        );
      }

      observe = vi.fn();

      disconnect = vi.fn();
    }
  );
  const { response, store } = setup({ lazy: true, copies: 2 });
  expect(screen.getAllByText('AP')).toHaveLength(2);
  expect(Object.keys(store.getState().api.queries)).toHaveLength(0);

  act(() => notify.forEach((update) => update()));

  expect(await screen.findAllByRole('img', { name: 'Aanya Patel' })).toHaveLength(2);
  expect(response).toHaveBeenCalledTimes(1);

  act(() => store.dispatch(setPermissions([])));
  expect(screen.queryByRole('img')).toBeNull();
  expect(screen.getAllByText('AP')).toHaveLength(2);
});
