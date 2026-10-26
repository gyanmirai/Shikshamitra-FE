import { it, expect, describe } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { focusAdjacentControl } from './dropdown-focus';

describe('dropdown Tab focus', () => {
  it.each([false, true])(
    'focuses the checked radio in its group (backwards=%s)',
    async (backwards) => {
      render(
        <form>
          {!backwards && <button type="button">Dropdown</button>}
          <label htmlFor="monday">
            <input id="monday" type="radio" name="day" value="Monday" />
            Monday
          </label>
          <label htmlFor="wednesday">
            <input id="wednesday" type="radio" name="day" value="Wednesday" defaultChecked />
            Wednesday
          </label>
          <label htmlFor="friday">
            <input id="friday" type="radio" name="day" value="Friday" />
            Friday
          </label>
          {backwards && <button type="button">Dropdown</button>}
        </form>
      );
      focusAdjacentControl(screen.getByRole('button', { name: 'Dropdown' }), backwards);
      await waitFor(() => expect(screen.getByRole('radio', { name: 'Wednesday' })).toHaveFocus());
    }
  );

  it('skips hidden and disabled fields and stays inside its dialog', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <div role="dialog" aria-label="Form">
          <button type="button">Dropdown</button>
          <input aria-label="Disabled" disabled />
          <div hidden>
            <input aria-label="Hidden" />
          </div>
          <button type="button">Next field</button>
        </div>
      </>
    );
    focusAdjacentControl(screen.getByRole('button', { name: 'Dropdown' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
  });
});
