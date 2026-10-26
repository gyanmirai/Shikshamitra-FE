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

import type { IBuilding } from '../types';

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

function renderDialog(editData: IBuilding | null = null) {
  const onClose = vi.fn();
  renderBuildingForm(store, onClose, editData, <p>Buildings workspace stays mounted</p>);
  return onClose;
}

describe('building form dialog', () => {
  it.each([
    [null, 'Add Building'],
    [buildingFixture, 'Edit Building'],
  ])('opens the expected title and a single native form', (editData, title) => {
    renderDialog(editData as IBuilding | null);
    expect(screen.getByRole('dialog', { name: title as string })).toBeVisible();
    expect(document.querySelectorAll('form')).toHaveLength(1);
    expect(screen.getByText('Buildings workspace stays mounted')).toBeInTheDocument();
  });

  it.each(['Cancel', 'close', 'Escape'])('closes a clean draft through %s', (action) => {
    const onClose = renderDialog();
    if (action === 'Escape') {
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    } else fireEvent.click(screen.getByRole('button', { name: action }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledWith(null, false);
    expect(screen.queryByRole('button', { name: 'Discard changes' })).not.toBeInTheDocument();
  });

  it('protects dirty values until the user chooses to discard them', async () => {
    const onClose = renderDialog();
    fireEvent.change(screen.getByRole('textbox', { name: /Building name/i }), {
      target: { value: 'New Block' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeVisible();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: /Building name/i })).toHaveValue('New Block')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('locks close paths and inputs while saving and keeps a failed draft', async () => {
    let finish: (() => void) | undefined;
    mswServer.use(
      http.put('*/api/institute-setup/buildings/7', async () => {
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
        return HttpResponse.json(
          { error: { message: 'Unable to save building.' } },
          { status: 500 }
        );
      })
    );
    const onClose = renderDialog(buildingFixture);
    const name = screen.getByRole('textbox', { name: /Building name/i });
    fireEvent.change(name, { target: { value: 'Updated Block' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(finish).toBeDefined());
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(name).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    finish?.();
    await waitFor(() => expect(name).toBeEnabled());
    expect(name).toHaveValue('Updated Block');
    expect(onClose).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save building.');
  });
});
