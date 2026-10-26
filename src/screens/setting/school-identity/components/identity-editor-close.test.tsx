import { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { IdentityEditor } from './identity-editor';

import type { IdentityProfile, IdentitySelection } from '../types';

const mocks = vi.hoisted(() => ({ save: vi.fn(), upload: vi.fn(), busy: false }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/redux/InstituteSetup/schoolIdentityApi', () => ({
  useUpdateSchoolIdentityMutation: () => [mocks.save, { isLoading: mocks.busy }],
  useUploadSchoolIdentityAssetMutation: () => [mocks.upload, { isLoading: false }],
}));
vi.mock('./identity-preview', () => ({ IdentityPreviewButton: () => null }));
vi.mock('./identity-asset-field', () => ({
  IdentityAssetField: ({
    kind,
    value,
    onChange,
    disabled,
  }: {
    kind: string;
    value: IdentitySelection;
    onChange: (value: IdentitySelection) => void;
    disabled: boolean;
  }) =>
    kind === 'logo' ? (
      <button type="button" disabled={disabled} onClick={() => onChange({ ...value, mode: 2 })}>
        Change logo
      </button>
    ) : null,
}));

const profile: IdentityProfile = {
  concurrencyStamp: 'opened-version',
  canManage: true,
  canAccessSignature: true,
  choices: { logo: { mode: 0 }, banner: { mode: 0 }, signature: { mode: 0 } },
  effective: {},
};
function Fixture({ close }: { close: () => void }) {
  const [open, setOpen] = useState(true);
  return open ? (
    <IdentityEditor
      profile={profile}
      context={{}}
      onClose={() => {
        setOpen(false);
        close();
      }}
    />
  ) : null;
}
function setup() {
  const close = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Fixture close={close} />
    </ThemeProvider>
  );
  return close;
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('confirm', vi.fn());
  mocks.busy = false;
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(['Cancel', 'close', 'Escape'])(
  'keeps identity changes on %s until discard is chosen',
  async (control) => {
    const close = setup();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Change logo' }));
    });
    const leave = () => {
      if (control === 'Escape')
        fireEvent.keyDown(screen.getByRole('dialog', { name: 'Edit School Defaults' }), {
          key: 'Escape',
        });
      else fireEvent.click(screen.getByRole('button', { name: control }));
    };
    leave();
    expect(screen.getByRole('dialog', { name: 'Discard School Identity Changes?' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    expect(close).not.toHaveBeenCalled();
    leave();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(close).toHaveBeenCalledOnce();
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
  }
);

it('closes a clean identity editor directly', () => {
  const close = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(close).toHaveBeenCalledOnce();
  expect(window.confirm).not.toHaveBeenCalled();
});

it('locks cancellation while identity changes are saving', () => {
  mocks.busy = true;
  const close = setup();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Edit School Defaults' }), {
    key: 'Escape',
  });
  expect(close).not.toHaveBeenCalled();
});
