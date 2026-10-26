import { useFormik } from 'formik';
import { useBoolean } from 'src/hooks/use-boolean';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import RoomForm from './AddRoomForm';
import { getRoomFormValues } from '../services/room-layout';

const mocks = vi.hoisted(() => ({ save: vi.fn(), busy: false }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./RoomFeatures', () => ({ RoomFeatures: () => null }));
vi.mock('./RoomImageField', () => ({ RoomImageField: () => null }));
vi.mock('./RoomPreviewSection', () => ({ RoomPreviewSection: () => null }));
vi.mock('../hooks/useRoomForm', () => ({
  useRoomForm: () => ({
    formik: useFormik({ initialValues: getRoomFormValues(undefined), onSubmit: mocks.save }),
    buildings: [],
    floors: [],
    roomTypes: [],
    saving: mocks.busy,
    loadingOptions: false,
    optionsError: false,
    retryOptions: vi.fn(),
  }),
}));

function Fixture({ onClose }: { onClose: () => void }) {
  const open = useBoolean(true);
  return open.value ? (
    <RoomForm
      open={open}
      onClose={() => {
        open.onFalse();
        onClose();
      }}
    />
  ) : null;
}

function setup() {
  const close = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Fixture onClose={close} />
    </ThemeProvider>
  );
  return close;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
  mocks.busy = false;
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(['Cancel', 'close', 'Escape'])(
  'guards dirty room %s through one shared confirmation',
  async (control) => {
    const close = setup();
    await act(async () => {
      fireEvent.change(screen.getByRole('textbox', { name: /Room name/ }), {
        target: { value: 'A202' },
      });
    });
    const leave = () => {
      if (control === 'Escape')
        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Add Room' }), { key: 'Escape' });
      else fireEvent.click(screen.getByRole('button', { name: control }));
    };
    leave();
    expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('textbox', { name: /Room name/ })).toHaveValue('A202');
    expect(close).not.toHaveBeenCalled();
    leave();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(close).toHaveBeenCalledOnce();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
  }
);

it('closes an unchanged room without a native prompt', () => {
  const close = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledOnce();
  expect(window.confirm).not.toHaveBeenCalled();
});

it('locks shell and footer cancellation while saving', () => {
  mocks.busy = true;
  const close = setup();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Add Room' }), { key: 'Escape' });
  expect(close).not.toHaveBeenCalled();
  expect(window.confirm).not.toHaveBeenCalled();
});
