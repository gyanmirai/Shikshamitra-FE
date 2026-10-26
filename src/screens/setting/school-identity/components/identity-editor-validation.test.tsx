import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { IdentityEditor } from './identity-editor';

import type { IdentityProfile } from '../types';

const mutations = vi.hoisted(() => ({ save: vi.fn(), upload: vi.fn() }));
vi.mock('src/components/institute-field-formatting/use-institute-field-preview', () => ({
  useInstituteFieldPreview: () => undefined,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/redux/InstituteSetup/schoolIdentityApi', () => ({
  useUpdateSchoolIdentityMutation: () => [mutations.save, { isLoading: false }],
  useUploadSchoolIdentityAssetMutation: () => [mutations.upload, { isLoading: false }],
}));
vi.mock('./identity-preview', () => ({ IdentityPreviewButton: () => null }));
vi.mock('./identity-image-upload', () => ({ IdentityImageUpload: () => null }));
vi.mock('./identity-image', () => ({ IdentityImage: () => null }));

const profile: IdentityProfile = {
  concurrencyStamp: 'opened-version',
  canManage: true,
  canAccessSignature: true,
  choices: {
    logo: { mode: 0 },
    banner: { mode: 0 },
    signature: {
      mode: 1,
      assetId: 'saved-signature',
      principalName: 'School Principal',
      designation: 'Principal',
    },
  },
  effective: {},
};
const originalScroll = HTMLElement.prototype.scrollIntoView;
beforeEach(() => {
  vi.clearAllMocks();
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  cleanup();
  HTMLElement.prototype.scrollIntoView = originalScroll;
});

it.each([
  [/^Principal’s name/, 'Enter the principal’s name.'],
  [/^Designation/, 'Enter the designation.'],
] as const)('shows an inline required error for %s without saving', async (label, error) => {
  const close = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <IdentityEditor profile={profile} context={{}} onClose={close} />
    </ThemeProvider>
  );
  const input = screen.getByRole('textbox', { name: label });
  const form = input.closest('form');
  if (!form) throw new Error('Expected the school identity form.');
  expect(form).toHaveAttribute('novalidate');
  expect(input).toBeRequired();
  await act(async () => {
    fireEvent.change(input, { target: { value: '' } });
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(error)).toBeVisible();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription(error);
  await waitFor(() => expect(input).toHaveFocus());
  expect(input).toHaveValue('');
  expect(close).not.toHaveBeenCalled();
  expect(mutations.save).not.toHaveBeenCalled();
  expect(mutations.upload).not.toHaveBeenCalled();
});
