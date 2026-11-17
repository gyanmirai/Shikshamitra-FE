import { useState } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { FormBuilderWorkspace } from './form-builder-workspace';

const viewport = vi.hoisted(() => ({ desktop: true }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => viewport.desktop }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden /> }));

function Fields() {
  const [search, setSearch] = useState('');
  return (
    <input
      aria-label="Search Student Fields"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}

function Harness({ fieldsNeedAttention = false }: { fieldsNeedAttention?: boolean }) {
  const [panel, setPanel] = useState<'fields' | 'form'>('fields');
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FormBuilderWorkspace
        panel={panel}
        onPanelChange={setPanel}
        fieldsNeedAttention={fieldsNeedAttention}
        fields={<Fields />}
        form={<button type="button">Canvas action</button>}
      >
        <button type="button">Continue</button>
      </FormBuilderWorkspace>
    </ThemeProvider>
  );
}

beforeEach(() => {
  viewport.desktop = true;
});

it('collapses the library to a reopen control while preserving its mounted search and canvas', async () => {
  const user = userEvent.setup();
  render(<Harness />);
  await user.type(screen.getByRole('textbox', { name: 'Search Student Fields' }), 'guardian');
  const collapse = screen.getByRole('button', { name: 'Collapse Field Library' });
  expect(collapse).toHaveAttribute('aria-expanded', 'true');
  await user.click(collapse);
  expect(screen.queryByRole('textbox', { name: 'Search Student Fields' })).not.toBeInTheDocument();
  // JSDOM does not apply the desktop media query; the canvas must remain mounted.
  expect(screen.getByText('Canvas action')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Expand Field Library' })).toHaveAttribute(
    'aria-expanded',
    'false'
  );
  await user.keyboard('{Enter}');
  expect(screen.getByRole('textbox', { name: 'Search Student Fields' })).toHaveValue('guardian');
});

it('reveals a collapsed library when a new library error requires attention', async () => {
  const user = userEvent.setup();
  const view = render(<Harness />);
  await user.click(screen.getByRole('button', { name: 'Collapse Field Library' }));
  view.rerender(<Harness fieldsNeedAttention />);
  expect(screen.getByRole('textbox', { name: 'Search Student Fields' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Collapse Field Library' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
});
