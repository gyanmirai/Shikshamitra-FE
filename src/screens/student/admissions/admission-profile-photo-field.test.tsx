import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { fileToBase64 } from 'src/utils/file-to-base64';
import { act, render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionProfilePhotoField } from './admission-profile-photo-field';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/utils/file-to-base64', () => ({ fileToBase64: vi.fn() }));

function renderPhoto(disabled = false) {
  const onChange = vi.fn();
  const onBusyChange = vi.fn();
  const view = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionProfilePhotoField
        field={{ label: 'Student photo', required: false }}
        value=""
        disabled={disabled}
        onChange={onChange}
        onBusyChange={onBusyChange}
      />
    </ThemeProvider>
  );
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')!;
  return { ...view, input, onChange, onBusyChange };
}

describe('admission photo upload', () => {
  it('exposes a named keyboard control and reports the whole asynchronous read to the form', async () => {
    const user = userEvent.setup();
    let finishRead!: (value: string) => void;
    vi.mocked(fileToBase64).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRead = resolve;
        })
    );
    const { input, onChange, onBusyChange } = renderPhoto();
    expect(screen.getByRole('button', { name: 'Choose student photo' })).toHaveAttribute(
      'tabindex',
      '0'
    );
    await user.upload(input, new File(['image'], 'photo.png', { type: 'image/png' }));
    await waitFor(() => expect(onBusyChange).toHaveBeenCalledWith(true));
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => {
      finishRead('data:image/png;base64,iVBORw0KGgo=');
    });
    expect(onChange).toHaveBeenCalledWith('data:image/png;base64,iVBORw0KGgo=');
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  }, 15000);

  it('retains the current answer and unlocks the form when reading fails', async () => {
    const user = userEvent.setup();
    vi.mocked(fileToBase64).mockRejectedValueOnce(new Error('Cannot read file'));
    const { input, onChange, onBusyChange } = renderPhoto();
    await user.upload(input, new File(['image'], 'photo.png', { type: 'image/png' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Choose the file again')
    );
    expect(onChange).not.toHaveBeenCalled();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });

  it('does not update an unmounted form after a pending read completes', async () => {
    const user = userEvent.setup();
    let finishRead!: (value: string) => void;
    vi.mocked(fileToBase64).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRead = resolve;
        })
    );
    const { input, onChange, onBusyChange, unmount } = renderPhoto();
    await user.upload(input, new File(['image'], 'photo.png', { type: 'image/png' }));
    await waitFor(() => expect(onBusyChange).toHaveBeenCalledWith(true));
    unmount();
    await act(async () => {
      finishRead('data:image/png;base64,iVBORw0KGgo=');
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });
});
