import type { ReactNode } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import auth from 'src/redux/auth/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { setCustomIconsLoader } from '@iconify/react';
import { render, screen, within } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import type { AcademicSetupNode, AcademicSetupNodeType } from './academic-setup-model';

const orderTestRouter = {
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => undefined,
  prefetch: () => undefined,
  bfcacheId: 'academic-order',
  push: (href: string) => window.history.pushState({}, '', href),
  replace: (href: string) => window.history.replaceState({}, '', href),
};

export const academicOrderItems = [
  { id: 'later', name: 'UKG' },
  { id: 'first', name: 'Nursery' },
];

export const createAcademicOrderStore = (canEdit = true) =>
  configureStore({
    reducer: { auth, confirmPopup, [api.reducerPath]: api.reducer },
    preloadedState: {
      auth: {
        ...auth(undefined, { type: 'init' }),
        permissions: [{ name: 'InstituteSetup.AcademicSetup.Edit', isGranted: canEdit }],
      },
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

export function renderAcademicOrder(
  node: ReactNode,
  store: ReturnType<typeof createAcademicOrderStore>
) {
  ['basil', 'lucide', 'solar', 'material-symbols-light', 'mdi'].forEach((prefix) => {
    setCustomIconsLoader((icons) => ({ prefix, icons: {}, not_found: icons }), prefix);
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <AppRouterContext.Provider value={orderTestRouter}>
          <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
        </AppRouterContext.Provider>
      </Provider>
    );
  }
  return render(node, { wrapper: Wrapper });
}

export const displayedAcademicOrder = () =>
  within(screen.getByRole('list', { name: 'Display order' }))
    .getAllByRole('listitem')
    .map((row) => row.textContent);

export const academicOrderNode = (
  type: AcademicSetupNodeType = 'Organization',
  count = 2
): AcademicSetupNode => ({
  id: 'parent-1',
  name: 'Primary',
  type,
  data: { id: 'parent-1', name: 'Primary' },
  parentsData: {},
  children: academicOrderItems.slice(0, count).map((item) => ({
    ...item,
    type: type === 'Medium' ? 'Organization' : type === 'Organization' ? 'Standard' : 'Division',
    data: item,
    parentsData: {},
  })),
});
