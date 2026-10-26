import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach } from 'vitest';
import { setPermissions } from 'src/redux/auth/authSlice';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { InstituteFieldFormattingPopover } from './institute-field-formatting-popover';
import {
  renderAcademicOrder,
  createAcademicOrderStore,
} from '../academic-setup/academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
let store: ReturnType<typeof createAcademicOrderStore>;
afterEach(async () => {
  await act(async () => {
    cleanup();
    store?.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

it('shows a fresh-read error instead of opening stale cached settings', async () => {
  store = createAcademicOrderStore();
  store.dispatch(
    setPermissions(
      ['View', 'Add'].map((action) => ({
        name: `ShikshaMitra.Module.InstituteSetup.BuildingManagement.${action}`,
        isGranted: true,
      }))
    )
  );
  let fail = false;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/institute-field-formatting/buildings', () =>
      fail
        ? HttpResponse.json({}, { status: 503 })
        : HttpResponse.json({ fields: { buildingName: 0, floorName: 0, description: 0 } })
    )
  );
  renderAcademicOrder(<InstituteFieldFormattingPopover scope="buildings" />, store);
  fireEvent.click(screen.getByRole('button', { name: 'Field settings' }));
  await screen.findByRole('radio', { name: /^Default/ });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  fail = true;
  fireEvent.click(screen.getByRole('button', { name: 'Field settings' }));
  await screen.findByText('Could not load formatting settings.');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
});
