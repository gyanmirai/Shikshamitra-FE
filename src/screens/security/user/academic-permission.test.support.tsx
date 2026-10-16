import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { addIcon } from '@iconify/react';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, afterEach, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import globalState from 'src/redux/globalState/globalSlice';
import { render, screen, cleanup } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';

import AcademicPermissionDialog from './academic-permission-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'fixture-token' }),
  signOut: vi.fn(),
}));

export const years = [
  { id: 'year-1', name: '2025-2026' },
  { id: 'year-2', name: '2026-2027' },
];
export const requestedYears: string[] = [];
export const savedPayloads: unknown[] = [];
const stores: ReturnType<typeof makeStore>[] = [];

function makeStore(yearId: string) {
  return configureStore({
    reducer: { globalState, confirmPopup, [api.reducerPath]: api.reducer },
    preloadedState: {
      globalState: {
        currentYear: years.find((year) => year.id === yearId) ?? {},
        currentBoard: {},
        currentMedium: {},
      },
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
}

beforeEach(() => {
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true)
  );
  [
    'basil:cross-solid',
    'material-symbols-light:save',
    'eva:arrow-ios-downward-fill',
    'eva:arrow-ios-forward-fill',
  ].forEach((name) => addIcon(name, { body: '', width: 24, height: 24 }));
  requestedYears.length = 0;
  savedPayloads.length = 0;
  clearCachedAuthSession();
  mswServer.use(
    http.get(/^https:\/\/api\.(iconify\.design|simplesvg\.com|unisvg\.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        prefix: url.pathname.slice(1).replace('.json', ''),
        icons: {},
        not_found: url.searchParams.get('icons')?.split(',') ?? [],
      });
    }),
    http.get('*/api/app/academic-year', () => HttpResponse.json({ items: years })),
    http.get('*/api/app/education-board', () =>
      HttpResponse.json({
        items: years.map((year, index) => ({
          id: `board-${index + 1}`,
          name: index === 0 ? 'CBSE' : 'State Board',
          academicYearId: year.id,
          educationMediums: [
            { id: `medium-${index + 1}`, name: 'English', educationMediumStages: [] },
          ],
        })),
      })
    ),
    http.get('*/api/app/user-scope/user-scope-hierarchy', ({ request }) => {
      requestedYears.push(new URL(request.url).searchParams.get('academicYearId') ?? '');
      return HttpResponse.json({ userId: 'user-1', accessibleHierarchy: [] });
    }),
    http.post('*/api/app/user-scope/bulk-assign', async ({ request }) => {
      savedPayloads.push(await request.json());
      return HttpResponse.json({});
    })
  );
});

afterEach(() => {
  cleanup();
  stores.splice(0).forEach((store) => store.dispatch(api.util.resetApiState()));
  clearCachedAuthSession();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

export function renderAcademicPermission(yearId = 'year-1') {
  const store = makeStore(yearId);
  stores.push(store);
  const onClose = vi.fn();
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AcademicPermissionDialog
          open
          user={{ id: 'user-1', userName: 'Test Staff' }}
          onClose={onClose}
        />
      </ThemeProvider>
    </Provider>
  );
  return { store, onClose };
}

export async function chooseYear(
  user: { click: (element: Element) => Promise<void> },
  name: string
) {
  await user.click(screen.getByRole('combobox', { name: 'Academic year' }));
  await user.click(screen.getByRole('option', { name }));
}
