import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { renderBuildingForm, createBuildingFormStore } from './building-form-test-utils';

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

describe('building floor entry', () => {
  it('preserves entered case for building and new floor names with Default formatting', () => {
    renderBuildingForm(store, vi.fn(), null);
    const name = screen.getByRole('textbox', { name: /Building name/i });
    const floor = screen.getByRole('textbox', { name: /Floor name/i });
    fireEvent.change(name, { target: { value: 'north CBSE block' } });
    fireEvent.change(floor, { target: { value: 'ground floor A' } });
    expect(name).toHaveValue('north CBSE block');
    expect(floor).toHaveValue('ground floor A');
  });

  it('replaces the total count and rich editor with individual floors and a textarea', () => {
    renderBuildingForm(store, vi.fn(), null);
    expect(screen.queryByLabelText(/Total floors/i)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Description/i }).tagName).toBe('TEXTAREA');
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    const originalCount = screen.queryAllByRole('textbox', { name: /Floor name/i }).length;
    fireEvent.click(screen.getByRole('button', { name: /Add floor/i }));
    expect(screen.getAllByRole('textbox', { name: /Floor name/i })).toHaveLength(originalCount + 1);
  });

  it('keeps floor identity and room capacity when the sequence changes', async () => {
    let saved: Record<string, unknown> | undefined;
    mswServer.use(
      http.put('*/api/institute-setup/buildings/7', async ({ request }) => {
        saved = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      })
    );
    const onClose = vi.fn();
    renderBuildingForm(store, onClose);
    fireEvent.click(screen.getByRole('button', { name: 'Move floor 2 up' }));
    expect(
      screen
        .getAllByRole('textbox', { name: /Floor name/i })
        .map((field) => (field as HTMLInputElement).value)
    ).toEqual(['First', 'Ground']);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
    expect(saved).toMatchObject({
      totalFloors: 2,
      floorsToUpdate: [
        { id: 'floor-b', floorNo: 1, floorName: 'First', totalRoom: 8 },
        { id: 'floor-a', floorNo: 2, floorName: 'Ground', totalRoom: 5 },
      ],
    });
  });

  it('sends removed persisted floors explicitly and derives the new count', async () => {
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
    const confirmation = screen.queryByRole('button', { name: 'Remove floor' });
    if (confirmation) fireEvent.click(confirmation);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
    expect(saved).toMatchObject({ totalFloors: 1, floorIdsToDelete: ['floor-a'] });
    expect(saved?.floorsToUpdate).toEqual([
      { id: 'floor-b', floorNo: 1, floorName: 'First', totalRoom: 8 },
    ]);
  });

  it('waits for saving, locks controls, and retains a failed draft for retry', async () => {
    let finish: (() => void) | undefined;
    let attempts = 0;
    mswServer.use(
      http.put('*/api/institute-setup/buildings/7', async () => {
        attempts += 1;
        if (attempts > 1) return new HttpResponse(null, { status: 204 });
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
        return HttpResponse.json({ error: { message: 'Unable to save floors.' } }, { status: 500 });
      })
    );
    const onClose = vi.fn();
    renderBuildingForm(store, onClose);
    fireEvent.change(screen.getByRole('textbox', { name: /Building name/i }), {
      target: { value: 'Updated Block' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(finish).toBeDefined());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Add floor/i })).toBeDisabled();
    finish?.();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    expect(screen.getByRole('textbox', { name: /Building name/i })).toHaveValue('Updated Block');
    expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
    expect(attempts).toBe(2);
  });
});
