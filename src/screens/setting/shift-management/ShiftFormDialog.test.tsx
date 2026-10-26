import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { screen, within, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { ShiftFormDialog } from './ShiftFormDialog';

const mocks = vi.hoisted(() => ({ busy: false, mutate: vi.fn() }));
vi.mock('src/components/institute-field-formatting/use-institute-field-preview', () => ({
  useInstituteFieldPreview: () => undefined,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.mutate, { isLoading: mocks.busy }],
}));

function renderForm() {
  const onClose = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ShiftFormDialog editData={null} onClose={onClose} />
      </LocalizationProvider>
    </ThemeProvider>
  );
  return onClose;
}

beforeEach(() => {
  mocks.busy = false;
  mocks.mutate.mockClear();
});

describe('Shift form presentation and close guard', () => {
  it('groups required fields under the shared section with header help', () => {
    renderForm();
    expect(
      screen.getByRole('heading', { name: 'Shift Details' }).closest('section')
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Shift Details information' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add Shift information' })).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Shift name/ })).toBeRequired();
    ['startTime', 'endTime'].forEach((name) => {
      expect(document.querySelector(`input[name="${name}"]`)).toBeRequired();
    });
    expect(screen.queryByText('Shift Start Time')).not.toBeInTheDocument();
  });

  it('closes a clean form once without a discard decision', () => {
    const onClose = renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('dialog', { name: 'Discard Unsaved Changes?' })
    ).not.toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it.each(['Cancel', 'close', 'Escape'])('protects the same draft through %s', async (action) => {
    const onClose = renderForm();
    fireEvent.change(screen.getByRole('textbox', { name: /Shift name/ }), {
      target: { value: 'UI draft' },
    });
    if (action === 'Escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    else fireEvent.click(screen.getByRole('button', { name: action }));
    const confirmation = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: /Shift name/ })).toHaveValue('UI draft');
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    const second = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    fireEvent.click(within(second).getByRole('button', { name: 'Discard changes' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { name: /Shift name/ })).toHaveValue('');
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('locks inputs, Cancel and shell close while a save is busy', () => {
    mocks.busy = true;
    const onClose = renderForm();
    expect(screen.getByRole('textbox', { name: /Shift name/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
