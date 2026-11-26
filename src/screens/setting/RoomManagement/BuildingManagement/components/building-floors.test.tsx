import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

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
  it('keeps assigned floors read-only and protects the editable first floor', async () => {
    const building = {
      ...buildingFixture,
      floors: [buildingFixture.floors[0], { ...buildingFixture.floors[1], roomCount: 1 }],
    };
    renderBuildingForm(store, vi.fn(), building);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    const first = within(screen.getByRole('listitem', { name: 'Floor 1' }));
    const occupied = within(screen.getByRole('listitem', { name: 'Floor 2' }));
    expect(first.getByRole('button', { name: 'Remove floor 1' })).toBeDisabled();
    expect(first.getByLabelText(/^Floor name/i)).not.toHaveAttribute('readonly');
    expect(first.getByRole('button', { name: 'Move floor 1 down' })).toBeDisabled();
    expect(occupied.getByLabelText(/^Floor name/i)).toHaveAttribute('readonly');
    expect(occupied.getByLabelText(/^Total rooms/i)).toHaveAttribute('readonly');
    expect(occupied.getByRole('button', { name: 'Drag floor 2 to reorder' })).toBeDisabled();
    expect(occupied.getByRole('button', { name: 'Remove floor 2' })).toBeDisabled();
  });

  it('restores multiple removed floors with their original order, identities, and capacity', async () => {
    const building = {
      ...buildingFixture,
      totalFloors: 3,
      floors: [...buildingFixture.floors, { id: 'floor-c', floorNo: 3, floorName: 'Top', totalRoom: 3 }],
    };
    let saved: Record<string, unknown> | undefined;
    mswServer.use(
      http.put('*/api/institute-setup/buildings/7', async ({ request }) => {
        saved = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const onClose = vi.fn();
    renderBuildingForm(store, onClose, building);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove floor 2' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 2' }));
    expect(screen.queryAllByRole('textbox', { name: /Floor name/i })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Undo remove' }));
    fireEvent.click(screen.getByRole('button', { name: 'Undo remove' }));
    expect(
      screen
        .getAllByRole('textbox', { name: /Floor name/i })
        .map((field) => (field as HTMLInputElement).value)
    ).toEqual(['Ground', 'First', 'Top']);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
    expect(saved).toMatchObject({
      totalFloors: 3,
      floorsToUpdate: building.floors,
      floorIdsToDelete: [],
    });
  });

  it('keeps the starter floor in Add Building and allows its name to be entered', () => {
    renderBuildingForm(store, vi.fn(), null);
    expect(screen.getByRole('button', { name: 'Remove floor 1' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove floor 1' }));
    const name = screen.getByLabelText(/^Floor name/i);
    fireEvent.change(name, { target: { value: 'Ground' } });
    expect(name).toHaveValue('Ground');
  });
});
