import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { expect } from 'vitest';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import globalState from 'src/redux/globalState/globalSlice';
import auth, { setPermissions } from 'src/redux/auth/authSlice';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import RoomForm from './AddRoomForm';

import type { IRoom } from '../types';

const router: AppRouterInstance = {
  back: () => undefined,
  forward: () => undefined,
  refresh: () => undefined,
  push: () => undefined,
  replace: () => undefined,
  prefetch: () => undefined,
  bfcacheId: 'room-capacity-test',
};

export const existingRoom = {
  id: 'room-a',
  roomName: 'A101',
  buildingId: 'building-a',
  floorId: 'floor-a',
  roomTypeId: 'type-a',
  columnRows: [3, 2],
  benchesPerColumn: 2,
  benchesPerRow: 3,
  benchCapacity: 2,
  totalBenches: 5,
  capacity: 10,
  features: ['Whiteboard'],
} as IRoom;

export function renderCapacityForm(onClose: () => void, edit = false, canEditBuilding = true) {
  const store = configureStore({
    reducer: { auth, confirmPopup, globalState, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  store.dispatch(
    setPermissions(
      ['View', 'Add'].map((action) => ({
        name: `ShikshaMitra.Module.InstituteSetup.BuildingManagement.${action}`,
        isGranted: action === 'View' || canEditBuilding,
      }))
    )
  );
  function Harness() {
    const open = useBoolean(true);
    return (
      <AppRouterContext.Provider value={router}>
        <RoomForm open={open} onClose={onClose} editData={edit ? existingRoom : undefined} />
      </AppRouterContext.Provider>
    );
  }
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <Harness />
      </ThemeProvider>
    </Provider>
  );
}

export async function selectRoomOption(label: string, option: string) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: new RegExp(`^${label}`) }));
  fireEvent.click(await screen.findByRole('option', { name: option }));
}

export async function fillRoomDraft() {
  await screen.findByRole('checkbox', { name: 'Whiteboard' });
  fireEvent.change(screen.getByLabelText(/^Room name/), { target: { value: 'A102' } });
  await selectRoomOption('Building', 'Main');
  await selectRoomOption('Floor', 'First');
  await selectRoomOption('Room type', 'Classroom');
  fireEvent.change(screen.getByLabelText(/^Columns/), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText(/^Column 1 rows/), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText(/^Column 2 rows/), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText(/^Students per bench/), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Whiteboard' }));
}

export async function openBuildingEditor() {
  fireEvent.click(await screen.findByRole('button', { name: 'Edit building' }));
  return screen.findByRole('dialog', { name: 'Edit Building' });
}

export async function saveBuildingCapacity(editor: HTMLElement, totalRoom: number) {
  fireEvent.change(within(editor).getByLabelText(/^Total rooms/), {
    target: { value: String(totalRoom) },
  });
  fireEvent.click(within(editor).getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Edit Building' })).not.toBeInTheDocument()
  );
}

export function expectRoomDraft() {
  expect(screen.getByLabelText(/^Room name/)).toHaveValue('A102');
  expect(screen.getByLabelText(/^Column 1 rows/)).toHaveValue(3);
  expect(screen.getByLabelText(/^Column 2 rows/)).toHaveValue(2);
  expect(screen.getByLabelText(/^Students per bench/)).toHaveValue(2);
  expect(screen.getByRole('checkbox', { name: 'Whiteboard' })).toBeChecked();
  expect(screen.getByRole('combobox', { name: /^Building/ })).toHaveTextContent('Main');
  expect(screen.getByRole('combobox', { name: /^Floor/ })).toHaveTextContent('First');
  expect(screen.getByRole('combobox', { name: /^Room type/ })).toHaveTextContent('Classroom');
}
