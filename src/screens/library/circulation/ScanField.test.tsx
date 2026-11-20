import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { ScanField } from './ScanField';

it('uses scanner Enter as input completion without implicitly submitting an operational form', async () => {
  const submitted = vi.fn();
  function Harness() {
    const [value, setValue] = useState('');
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted();
        }}
      >
        <ScanField value={value} onChange={setValue} onBlur={vi.fn()} disabled={false} />
        <button type="submit">Issue</button>
      </form>
    );
  }
  render(<Harness />);
  await userEvent
    .setup()
    .type(screen.getByRole('textbox', { name: /Accession or scan token/ }), 'SCHOOL/42{Enter}');
  expect(screen.getByRole('textbox', { name: /Accession or scan token/ })).toHaveValue('SCHOOL/42');
  expect(submitted).not.toHaveBeenCalled();
});
