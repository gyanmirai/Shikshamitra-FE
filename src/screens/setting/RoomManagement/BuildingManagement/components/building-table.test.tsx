// @vitest-environment jsdom

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import BuildingTable from './buildingTable';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe = vi.fn();

      unobserve = vi.fn();

      disconnect = vi.fn();
    }
  );
});

const northBuilding = {
  id: 7,
  buildingName: 'North Block',
  description: '<p data-secret="hidden-markup">North classrooms</p>',
  totalFloors: 12,
  floors: [],
};
const southBuilding = {
  id: 8,
  buildingName: 'South Block',
  description: 'Science laboratories',
  totalFloors: 2,
  floors: [],
};
const createBuildingTableStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createBuildingTableStore>;

beforeEach(() => {
  clearCachedAuthSession();
  store = createBuildingTableStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/institute-setup/buildings', () =>
      HttpResponse.json([northBuilding, southBuilding])
    ),
    http.get(/^https:\/\/api\.(iconify.design|simplesvg.com|unisvg.com)\//, ({ request }) => {
      const url = new URL(request.url);
      return HttpResponse.json({
        prefix: url.pathname.slice(1, -5),
        icons: {},
        not_found: url.searchParams.get('icons')?.split(',') || [],
      });
    })
  );
});

afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

function renderBuildingTable(onEdit = vi.fn()) {
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <BuildingTable onAddBuilding={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
      </ThemeProvider>
    </Provider>
  );
}

describe('building table behavior', () => {
  it('searches visible legacy description text without matching hidden markup', async () => {
    renderBuildingTable();
    expect(await screen.findByRole('rowheader', { name: 'North Block' })).toBeVisible();
    const search = screen.getByRole('textbox', { name: 'Search buildings' });
    fireEvent.change(search, { target: { value: 'classrooms' } });
    await waitFor(() => {
      expect(screen.getByRole('rowheader', { name: 'North Block' })).toBeVisible();
      expect(screen.queryByRole('rowheader', { name: 'South Block' })).not.toBeInTheDocument();
    });
    fireEvent.change(search, { target: { value: 'hidden-markup' } });
    await waitFor(() => expect(screen.queryByRole('rowheader')).not.toBeInTheDocument());
    expect(
      within(screen.getByRole('table', { name: 'Buildings table' })).getByRole('button', {
        name: 'Clear search',
      })
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add building' })).not.toBeInTheDocument();
  });

  it('applies numeric greater-than filters to total floors', async () => {
    renderBuildingTable();
    expect(await screen.findByRole('rowheader', { name: 'South Block' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Filter Total Floors' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /Filter Type/ }));
    fireEvent.click(await screen.findByRole('option', { name: 'Greater Than' }));
    fireEvent.change(screen.getByRole('spinbutton', { name: /Total Floors/ }), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => {
      expect(screen.getByRole('rowheader', { name: 'North Block' })).toBeVisible();
      expect(screen.queryByRole('rowheader', { name: 'South Block' })).not.toBeInTheDocument();
    });
  });

  it('passes the original legacy description and floor data to Edit', async () => {
    const onEdit = vi.fn();
    renderBuildingTable(onEdit);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit North Block' }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining(northBuilding));
  });
});
