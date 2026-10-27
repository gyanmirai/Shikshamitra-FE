import { api } from 'src/redux/service';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';

import { renderBuildingForm, createBuildingFormStore } from './building-form-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createBuildingFormStore>;
beforeEach(() => {
  store = createBuildingFormStore();
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect(
    this: Element
  ) {
    const row = this.closest('[role="listitem"]');
    const index = row ? [...document.querySelectorAll('[role="listitem"]')].indexOf(row) : 0;
    const top = index * 160;
    return {
      x: 0,
      y: top,
      top,
      left: 0,
      right: 500,
      bottom: top + 150,
      width: 500,
      height: 150,
      toJSON: () => ({}),
    };
  });
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  vi.restoreAllMocks();
});

it.each([false, true])(
  'Escape cancels a floor drag without closing the dialog (dirty: %s)',
  async (dirty) => {
    const onClose = vi.fn();
    renderBuildingForm(store, onClose);
    if (dirty) {
      fireEvent.change(screen.getByRole('textbox', { name: /Building name/i }), {
        target: { value: 'Updated Block' },
      });
    }
    const handle = screen.getByRole('button', { name: 'Drag floor 1 to reorder' });
    act(() => handle.focus());
    fireEvent.keyDown(handle, { code: 'Space', key: ' ' });
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.keyDown(handle, { code: 'ArrowDown', key: 'ArrowDown' });
    await screen.findByText('Ground is at position 2.');
    fireEvent.keyDown(handle, { code: 'Escape', key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Discard changes' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Edit Building' })).toBeVisible();
    await screen.findByText('Ground was not moved.');
    expect(
      screen
        .getAllByRole('textbox', { name: /Floor name/i })
        .map((field) => (field as HTMLInputElement).value)
    ).toEqual(['Ground', 'First']);
  }
);
