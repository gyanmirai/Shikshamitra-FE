import { useState } from 'react';
import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, within, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { DocumentClassPicker } from './document-class-picker';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const classes = [
  { id: 'g2', name: 'Class 2', context: '2026-2027 / GSEB / Gujarati / Primary' },
  { id: 'g3', name: 'Class 3', context: '2025-2026 / GSEB / English / Primary' },
  { id: 'c2', name: 'Class 2', context: '2026-2027 / CBSE / English / Primary' },
];

function Harness({ initial = [] as string[], disabled = false, isLoading = false }) {
  const [value, setValue] = useState(initial);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <DocumentClassPicker
        classes={classes}
        value={value}
        onChange={setValue}
        onBlur={() => undefined}
        error={false}
        helperText=""
        disabled={disabled}
        isLoading={isLoading}
      />
    </ThemeProvider>
  );
}

async function chooseBoard(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole('combobox', { name: 'Board' }));
  await user.click(screen.getByRole('option', { name }));
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
}

describe('document class picker', () => {
  it('filters by board and medium, omits years, and retains selections across filters and reopening', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole('combobox', { name: 'Board' })).toBeInTheDocument();
    await chooseBoard(user, 'GSEB');
    await user.click(screen.getByRole('combobox', { name: 'Classes' }));
    const dialog = () => within(screen.getByRole('dialog', { name: 'Select classes' }));
    expect(dialog().queryByRole('combobox', { name: 'Board' })).not.toBeInTheDocument();
    expect(dialog().queryByText(/2026|2025|Academic year/)).not.toBeInTheDocument();
    expect(dialog().getAllByRole('checkbox')).toHaveLength(2);
    expect(dialog().queryByText(/CBSE/)).not.toBeInTheDocument();
    await user.click(dialog().getByRole('checkbox', { name: /Class 2 Gujarati/ }));
    await user.type(dialog().getByRole('textbox', { name: 'Search classes' }), 'english');
    expect(dialog().getAllByRole('checkbox')).toHaveLength(1);
    expect(dialog().getByRole('checkbox', { name: /Class 3 English/ })).not.toBeChecked();
    await user.click(dialog().getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await chooseBoard(user, 'CBSE');
    await user.click(screen.getByRole('combobox', { name: 'Classes' }));
    await user.click(dialog().getByRole('checkbox', { name: /Class 2 English/ }));
    await user.click(dialog().getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Classes' })).toHaveTextContent(
      '2 classes selected'
    );
    await chooseBoard(user, 'All boards');
    await user.click(screen.getByRole('combobox', { name: 'Classes' }));
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(2);
  });

  it('handles empty search, clears hidden and unavailable selections, and supports keyboard dismissal', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['g2', 'missing']} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Classes' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const dialog = within(screen.getByRole('dialog', { name: 'Select classes' }));
    await user.click(
      dialog.getByRole('checkbox', { name: 'Unavailable class (remove or replace)' })
    );
    expect(dialog.queryByRole('checkbox', { name: /Unavailable/ })).not.toBeInTheDocument();
    await user.type(dialog.getByRole('textbox', { name: 'Search classes' }), 'not-a-class');
    expect(dialog.getByRole('status')).toHaveTextContent('No matching classes');
    await user.click(dialog.getByRole('button', { name: 'Clear' }));
    expect(dialog.getByText('0 classes selected')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: 'Classes' })).toHaveFocus();
  });

  it('keeps classes inaccessible while disabled or loading', () => {
    const { rerender } = render(<Harness disabled />);
    expect(screen.getByRole('combobox', { name: 'Classes' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    rerender(<Harness isLoading />);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
