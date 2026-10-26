import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import {
  buildingFixture,
  renderBuildingForm,
  createBuildingFormStore,
} from './building-form-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createBuildingFormStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createBuildingFormStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('building floor removal recovery', () => {
  it('restores multiple removed floors with their original order, identities, and capacity', async () => {
    let saved: Record<string, unknown> | undefined;
    mswServer.use(
      http.put('*/api/institute-setup/buildings/7', async ({ request }) => {
        saved = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const onClose = vi.fn();
    renderBuildingForm(store, onClose);
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 1' }));
    expect(screen.queryAllByRole('textbox', { name: /Floor name/i })).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Undo remove' }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo remove' }));
    expect(
      screen
        .getAllByRole('textbox', { name: /Floor name/i })
        .map((field) => (field as HTMLInputElement).value)
    ).toEqual(['Ground', 'First']);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
    expect(saved).toMatchObject({
      totalFloors: 2,
      floorsToUpdate: buildingFixture.floors,
      floorIdsToDelete: [],
    });
  });

  it('shows validation and does not save an empty floor list', async () => {
    const save = vi.fn(() => new HttpResponse(null, { status: 204 }));
    mswServer.use(http.put('*/api/institute-setup/buildings/7', save));
    const onClose = vi.fn();
    renderBuildingForm(store, onClose);
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText(/Add at least one floor/i)).toBeVisible();
    expect(save).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
