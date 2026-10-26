import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { menu } from 'src/theme/core/components/menu';
import { render, screen, waitFor } from '@testing-library/react';
import { extendTheme, ThemeProvider } from '@mui/material/styles';

import GroupCustomSelect from './index';

const theme = extendTheme({ components: menu });
const options = [
  {
    label: 'Core subjects',
    group: true as const,
    items: [
      { label: 'English', value: 'english' },
      { label: 'Mathematics', value: 'math' },
    ],
  },
  {
    label: 'Additional subjects',
    group: true as const,
    items: [{ label: 'Music', value: 'music' }],
  },
];

function GroupedSelectFixture() {
  const [value, setValue] = useState<string[] | number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  return (
    <ThemeProvider theme={theme}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <GroupCustomSelect label="Subjects" options={options} value={value} onChange={setValue} />
        <button type="button">Next field</button>
        <output aria-label="Selected subjects">{value.join(', ') || 'No selection'}</output>
        <output aria-label="Submitted">{submitted ? 'yes' : 'no'}</output>
      </form>
    </ThemeProvider>
  );
}

describe('grouped dropdown keyboard selection', () => {
  it.each([
    ['Spacebar', ' '],
    ['Enter', '{Enter}'],
    ['Tab', '{Tab}'],
  ])('skips group headings and selects an option with %s', async (_label, key) => {
    const user = userEvent.setup();
    render(<GroupedSelectFixture />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'English' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByRole('option', { name: 'Music' })).toHaveFocus();
    await user.keyboard(key);
    expect(screen.getByLabelText('Selected subjects')).toHaveTextContent('music');
    expect(screen.getByLabelText('Submitted')).toHaveTextContent('no');
    if (key === '{Tab}') {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      await waitFor(() => expect(screen.getByRole('button', { name: 'Next field' })).toHaveFocus());
    }
  });

  it('keeps earlier selections when a second group is selected', async () => {
    const user = userEvent.setup();
    render(<GroupedSelectFixture />);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{Enter}{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByLabelText('Selected subjects')).toHaveTextContent('english, music');
    expect(screen.getByRole('option', { name: 'English' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('option', { name: 'Music' })).toHaveAttribute('aria-selected', 'true');
  });
});
