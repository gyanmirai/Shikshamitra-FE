import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { addIcon } from '@iconify/react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, cleanup } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import UserTable from './user-table';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'fixture' }),
  signOut: vi.fn(),
}));

const store = configureStore({
  reducer: { auth: () => ({ permissions: [] }), confirmPopup, [api.reducerPath]: api.reducer },
  middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
});

afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('shows assigned roles and a truthful no-role state, loading every API page', async () => {
  [
    'fluent:filter-12-filled',
    'solar:magnifer-linear',
    'mingcute:close-line',
    'solar:eye-bold',
    'solar:export-bold',
    'solar:maximize-square-3-outline',
    'solar:minimize-square-3-outline',
  ].forEach((name) => addIcon(name, { body: '', width: 24, height: 24 }));
  const skips: number[] = [];
  const users = [
    { id: 'qa-1', userName: 'QA User 1', roleNames: ['Teacher', 'HR Manager'] },
    { id: 'qa-2', userName: 'QA User 2', roleNames: [] },
  ];
  mswServer.use(
    http.get('*/api/identity/roles/all', () =>
      HttpResponse.json({
        items: [
          { id: 'role-teacher', name: 'Teacher', extraProperties: { color: '#00B8D9' } },
          { id: 'role-hr', name: 'HR Manager', extraProperties: { Color: '#22C55E' } },
        ],
      })
    ),
    http.get('*/api/identity/users', () => HttpResponse.json({ items: users, totalCount: 2 })),
    http.get('*/api/security/user-directory', ({ request }) => {
      const skip = Number(new URL(request.url).searchParams.get('skipCount'));
      skips.push(skip);
      return HttpResponse.json({ items: users.slice(skip, skip + 1), totalCount: 2 });
    })
  );
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <UserTable onAction={() => {}} />
      </ThemeProvider>
    </Provider>
  );
  expect(await screen.findByRole('columnheader', { name: /Role/ })).toBeVisible();
  expect(await screen.findByText('Teacher', { exact: true })).toBeVisible();
  expect(screen.getByText('HR Manager', { exact: true })).toBeVisible();
  expect(await screen.findByText('No role assigned')).toBeVisible();
  expect(skips).toEqual([0, 1]);
});
