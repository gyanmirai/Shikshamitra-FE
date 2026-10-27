import type { ReactNode } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { addIcon } from '@iconify/react';
import auth from 'src/redux/auth/authSlice';
import { GlobalIcons } from 'src/utils/icons';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import BuildingForm from './buildingForm';

import type { IBuilding } from '../types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

Object.values(GlobalIcons).forEach((icon) => addIcon(icon, { body: '<path />' }));

const router: AppRouterInstance = {
  back: () => undefined,
  forward: () => undefined,
  refresh: () => undefined,
  push: () => undefined,
  replace: () => undefined,
  prefetch: () => undefined,
  bfcacheId: 'building-form-test',
};

export const buildingFixture: IBuilding = {
  id: 7,
  buildingName: 'North Block',
  description: 'Classroom block',
  totalFloors: 2,
  floors: [
    { id: 'floor-a', floorNo: 1, floorName: 'Ground', totalRoom: 5 },
    { id: 'floor-b', floorNo: 2, floorName: 'First', totalRoom: 8 },
  ],
};

export const createBuildingFormStore = () => {
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
  return configureStore({
    reducer: { auth, confirmPopup, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
};

export function renderBuildingForm(
  store: ReturnType<typeof createBuildingFormStore>,
  onClose: (event: unknown, submitted?: boolean) => void,
  editData: IBuilding | null = buildingFixture,
  context: ReactNode = null,
  mockUsage = true
) {
  if (editData && mockUsage) {
    mswServer.use(
      http.get(`*/api/institute-setup/buildings/${editData.id}`, () => HttpResponse.json(editData))
    );
  }
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme()}>
        <AppRouterContext.Provider value={router}>
          {context}
          <BuildingForm
            open={{ value: true, onTrue: () => {}, onFalse: () => {} }}
            onClose={onClose}
            editData={editData}
          />
        </AppRouterContext.Provider>
      </ThemeProvider>
    </Provider>
  );
}
