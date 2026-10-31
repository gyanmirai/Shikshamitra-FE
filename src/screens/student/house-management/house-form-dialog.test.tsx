import { Provider } from 'react-redux';
import { vi, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import HouseFormDialog from './house-form-dialog';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
function setup(onSave = vi.fn().mockResolvedValue(undefined)) {
  const onClose = vi.fn();
  render(
    <Provider store={configureStore({ reducer: { confirmPopup: () => ({ isChanges: false }) } })}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <HouseFormDialog academicMediumId="medium" onSave={onSave} onClose={onClose} />
      </ThemeProvider>
    </Provider>
  );
  return { onSave, onClose };
}
it('keeps a dirty house draft mounted until discard is confirmed', async () => {
  const { onClose } = setup();
  fireEvent.change(screen.getByLabelText(/House name/), { target: { value: 'Falcon' } });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByText('Discard Unsaved Changes?')).toBeVisible();
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText(/House name/)).toHaveValue('Falcon');
});
it('validates the real house field limits before sending', async () => {
  const { onSave } = setup();
  fireEvent.change(screen.getByLabelText(/House name/), { target: { value: 'x'.repeat(201) } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(screen.getByText('Use 200 characters or fewer.')).toBeVisible());
  expect(onSave).not.toHaveBeenCalled();
});
