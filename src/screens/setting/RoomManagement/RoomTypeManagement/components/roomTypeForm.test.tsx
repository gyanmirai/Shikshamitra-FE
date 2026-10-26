import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import RoomTypeManagement from '..';

const mocks = vi.hoisted(() => ({
  add: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  addHook: () => {},
  updateHook: () => {},
  deleteHook: () => {},
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/institute-field-formatting/use-institute-field-preview', () => ({
  useInstituteFieldPreview: () => undefined,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/InstituteSetup/RoomTypeApi/roomTypeApi', () => ({
  useAddRoomTypeMutation: mocks.addHook,
  useUpdateRoomTypeMutation: mocks.updateHook,
  useDeleteRoomTypeMutation: mocks.deleteHook,
  roomTypeApi: { util: { updateQueryData: vi.fn() } },
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: { currentQueryAndMutation: unknown }) => [
    currentQueryAndMutation === mocks.addHook
      ? mocks.add
      : currentQueryAndMutation === mocks.updateHook
        ? mocks.update
        : mocks.remove,
    { isLoading: false },
  ],
}));
vi.mock('./roomTypeTable', () => ({
  default: ({ onEdit }: { onEdit: (value: object) => void }) => (
    <button type="button" onClick={() => onEdit({ id: 7, roomTypeName: 'Lab', shortName: 'LAB' })}>
      Edit saved room type
    </button>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.add.mockReturnValue({ unwrap: async () => ({}) });
  mocks.update.mockReturnValue({ unwrap: async () => ({}) });
  vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
});
afterEach(() => vi.unstubAllGlobals());

function setup(edit = false) {
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <RoomTypeManagement />
    </ThemeProvider>
  );
  fireEvent.click(
    screen.getByRole('button', { name: edit ? 'Edit saved room type' : 'Room Type' })
  );
}

describe('Room Type dialog ownership', () => {
  it.each(['Cancel', 'close', 'Escape'])(
    'keeps the draft on %s until discard is chosen',
    async (control) => {
      setup();
      fireEvent.change(screen.getByRole('textbox', { name: /Room type/i }), {
        target: { value: 'Review draft' },
      });
      const requestClose = () =>
        control === 'Escape'
          ? fireEvent.keyDown(screen.getByRole('dialog', { name: 'Add Room Type' }), {
              key: 'Escape',
            })
          : fireEvent.click(screen.getByRole('button', { name: control }));
      requestClose();
      expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
      expect(screen.getByRole('textbox', { name: /Room type/i })).toHaveValue('Review draft');
      requestClose();
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(window.confirm).not.toHaveBeenCalled();
      expect(mocks.add).not.toHaveBeenCalled();
    }
  );

  it('closes a clean form directly and exposes real required inputs', async () => {
    setup();
    expect(screen.getByRole('textbox', { name: /Room type/i })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /Short name/i })).toBeRequired();
    fireEvent.blur(screen.getByRole('textbox', { name: /Room type/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('locks close paths while awaiting the unchanged update payload and preserves a failed draft', async () => {
    let rejectSave: (reason: unknown) => void = () => {};
    mocks.update.mockReturnValue({
      unwrap: () =>
        new Promise((_resolve, reject) => {
          rejectSave = reject;
        }),
    });
    setup(true);
    fireEvent.change(screen.getByRole('textbox', { name: /Short name/i }), {
      target: { value: 'LAB2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledExactlyOnceWith({
        id: 7,
        body: { roomTypeName: 'Lab', shortName: 'LAB2' },
      })
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    rejectSave({ data: { error: { message: 'Unable to save room type.' } } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
    expect(screen.getByRole('textbox', { name: /Short name/i })).toHaveValue('LAB2');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    mocks.update.mockReturnValue({ unwrap: async () => ({}) });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mocks.update).toHaveBeenCalledTimes(2);
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('submits the unchanged create payload exactly once through the native form path', async () => {
    setup();
    const name = screen.getByRole('textbox', { name: /Room type/i });
    fireEvent.change(name, { target: { value: 'Hall' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Short name/i }), {
      target: { value: 'HL' },
    });
    fireEvent.submit(name.closest('form')!);
    await waitFor(() =>
      expect(mocks.add).toHaveBeenCalledExactlyOnceWith({ roomTypeName: 'Hall', shortName: 'HL' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
