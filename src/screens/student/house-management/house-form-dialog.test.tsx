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
const { upload } = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock('src/redux/student/house-management/house-management-api', () => ({
  useUploadHouseLogoMutation: () => [upload],
}));
vi.mock('./use-house-logo', () => ({ useHouseLogo: () => undefined }));
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

it('uploads a selected logo once and retains its reference when a house save is retried', async () => {
  upload.mockReset().mockReturnValue({ unwrap: () => Promise.resolve('/api/files/logo.png') });
  const onSave = vi
    .fn()
    .mockRejectedValueOnce(new Error('Save failed'))
    .mockResolvedValueOnce(undefined);
  setup(onSave);
  fireEvent.change(screen.getByLabelText(/House name/), { target: { value: 'Falcons' } });
  fireEvent.click(screen.getByRole('button', { name: 'Green (#00B96B)' }));
  const file = new File(['logo'], 'falcons.png', { type: 'image/png' });
  fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [file] } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2));
  expect(upload).toHaveBeenCalledExactlyOnceWith(file);
  expect(onSave).toHaveBeenLastCalledWith(
    expect.objectContaining({ name: 'Falcons', color: '#00B96B', logoUrl: '/api/files/logo.png' })
  );
});

it('rejects non-image logo files and reports the error beside the uploader', async () => {
  setup();
  fireEvent.change(document.querySelector('input[type="file"]')!, {
    target: { files: [new File(['pdf'], 'logo.pdf', { type: 'application/pdf' })] },
  });
  expect(await screen.findByText('Choose a PNG or JPEG image.')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Remove logo.pdf' })).not.toBeInTheDocument();
});
