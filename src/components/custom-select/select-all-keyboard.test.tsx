import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { menu } from 'src/theme/core/components/menu';
import { render, screen } from '@testing-library/react';
import { extendTheme, ThemeProvider } from '@mui/material/styles';

import CustomSelect from './index';

function Fixture({ submit = vi.fn() }) {
  const [value, setValue] = useState<string[] | number[]>([]);
  return (
    <ThemeProvider theme={extendTheme({ components: menu })}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <CustomSelect
          label="Fields"
          multiple
          allowSelectAll
          value={value}
          onChange={setValue}
          options={[
            { value: 1, label: 'Name' },
            { value: 2, label: 'Notes' },
          ]}
        />
        <output aria-label="Selected values">{JSON.stringify(value)}</output>
        <button type="submit">Submit</button>
      </form>
    </ThemeProvider>
  );
}

it('keeps selected values when Tab dismisses the focused bulk action', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<Fixture submit={submit} />);
  await user.tab();
  await user.keyboard('{Enter}{Home}{Enter}');
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('[1,2]');
  await user.keyboard('{Home}');
  expect(screen.getByRole('option', { name: 'Deselect All' })).toHaveFocus();
  await user.tab();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('[1,2]');
  expect(submit).not.toHaveBeenCalled();
});

it('continues selecting an ordinary focused option on forward Tab', async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(<Fixture submit={submit} />);
  await user.tab();
  await user.keyboard('{Enter}{Home}{ArrowDown}');
  expect(screen.getByRole('option', { name: 'Name' })).toHaveFocus();
  await user.tab();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Selected values')).toHaveTextContent('[1]');
  expect(submit).not.toHaveBeenCalled();
});
