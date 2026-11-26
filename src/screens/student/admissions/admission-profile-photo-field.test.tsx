import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { fileToBase64 } from 'src/utils/file-to-base64';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { act, render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AdmissionProfilePhotoField } from './admission-profile-photo-field';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/utils/file-to-base64', () => ({ fileToBase64: vi.fn() }));
vi.mock('react-webcam', async () => {
  const { forwardRef, useEffect, useImperativeHandle } = await import('react');
  return {
    default: forwardRef<{ getScreenshot: () => string }, { onUserMedia: () => void }>(
      ({ onUserMedia }, ref) => {
        useImperativeHandle(ref, () => ({
          getScreenshot: () => 'data:image/jpeg;base64,/9j/',
        }));
        useEffect(onUserMedia, [onUserMedia]);
        return <span>Test camera</span>;
      }
    ),
  };
});
vi.mock('src/components/image-frame/image-frame', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/components/image-frame/image-frame')>()),
  loadFrameImage: async () => ({ naturalWidth: 640, naturalHeight: 480 }),
  renderImageFrame: async () => new File(['framed'], 'framed.png', { type: 'image/png' }),
}));

beforeEach(() => vi.clearAllMocks());

function renderPhoto(disabled = false) {
  const onChange = vi.fn();
  const onBusyChange = vi.fn();
  const store = configureStore({ reducer: { confirmPopup } });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AdmissionProfilePhotoField
          field={{ label: 'Student photo', required: false }}
          value=""
          disabled={disabled}
          onChange={onChange}
          onBusyChange={onBusyChange}
        />
      </ThemeProvider>
    </Provider>
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
    const usePhoto = await screen.findByRole('button', { name: 'Use framed photo' });
    expect(usePhoto).toBeVisible();
    expect(fileToBase64).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    await user.click(usePhoto);
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
    await user.click(await screen.findByRole('button', { name: 'Use framed photo' }));
    await waitFor(() =>
      expect(screen.getByText('Choose the file again', { exact: false })).toBeVisible()
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
    await user.click(await screen.findByRole('button', { name: 'Use framed photo' }));
    unmount();
    await act(async () => {
      finishRead('data:image/png;base64,iVBORw0KGgo=');
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });

  it('keeps the form answer unchanged when framing is cancelled', async () => {
    const user = userEvent.setup();
    const { input, onChange, onBusyChange } = renderPhoto();
    await user.upload(input, new File(['image'], 'photo.png', { type: 'image/png' }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(fileToBase64).not.toHaveBeenCalled();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  });

  it('opens the same frame before accepting a camera capture', async () => {
    const user = userEvent.setup();
    const { onChange } = renderPhoto();
    vi.mocked(fileToBase64).mockResolvedValueOnce('data:image/png;base64,iVBORw0KGgo=');
    await user.click(screen.getByRole('button', { name: 'Choose student photo' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Take Photo' }));
    await user.click(await screen.findByRole('button', { name: 'Capture' }));
    const usePhoto = await screen.findByRole('button', { name: 'Use framed photo' });
    expect(onChange).not.toHaveBeenCalled();
    await user.click(usePhoto);
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('data:image/png;base64,iVBORw0KGgo=')
    );
  });
});
