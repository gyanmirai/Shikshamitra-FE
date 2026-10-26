import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { useIdentityEditor } from './use-identity-editor';

import type { IdentityProfile } from '../types';

const mutations = vi.hoisted(() => ({
  save: vi.fn(),
  upload: vi.fn(),
  saving: false,
  uploading: false,
}));
vi.mock('src/redux/InstituteSetup/schoolIdentityApi', () => ({
  useUpdateSchoolIdentityMutation: () => [mutations.save, { isLoading: mutations.saving }],
  useUploadSchoolIdentityAssetMutation: () => [
    mutations.upload,
    { isLoading: mutations.uploading },
  ],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));

const profile: IdentityProfile = {
  concurrencyStamp: 'opened-version',
  canAccessSignature: true,
  canManage: true,
  choices: { logo: { mode: 0 }, banner: { mode: 0 }, signature: { mode: 0 } },
  effective: {},
};

describe('School Identity editor lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutations.saving = false;
    mutations.uploading = false;
    mutations.upload.mockReturnValue({ unwrap: async () => ({ id: 'draft-logo' }) });
    mutations.save.mockReturnValue({ unwrap: async () => ({}) });
  });

  it('uploads a draft without saving configuration or closing the editor', async () => {
    const close = vi.fn();
    const { result } = renderHook(() => useIdentityEditor(profile, {}, close));
    await act(async () => result.current.uploadFile('logo', new File(['image'], 'logo.png')));
    expect(result.current.formik.values.logo).toEqual({ mode: 1, assetId: 'draft-logo' });
    expect(mutations.save).not.toHaveBeenCalled();
    expect(result.current.formik.dirty).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it('submits the original version with the selected context and closes after success', async () => {
    const close = vi.fn();
    const context = { boardId: 'board', mediumId: 'medium' };
    const { result } = renderHook(() => useIdentityEditor(profile, context, close));
    await act(async () => result.current.uploadFile('banner', new File(['image'], 'banner.png')));
    await act(async () => result.current.formik.submitForm());
    expect(mutations.save).toHaveBeenCalledWith(
      expect.objectContaining({
        ...context,
        concurrencyStamp: 'opened-version',
        choices: expect.objectContaining({ banner: { mode: 1, assetId: 'draft-logo' } }),
      })
    );
    expect(close).toHaveBeenCalledOnce();
  });

  it('keeps a conflicting draft and the original stamp when a background profile refresh arrives', async () => {
    const close = vi.fn();
    mutations.save.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { status: 409 })),
    });
    const { result, rerender } = renderHook(
      ({ current }) => useIdentityEditor(current, {}, close),
      { initialProps: { current: profile } }
    );
    await act(async () => result.current.uploadFile('logo', new File(['image'], 'logo.png')));
    rerender({ current: { ...profile, choices: { ...profile.choices, logo: { mode: 2 } } } });
    await act(async () => result.current.formik.submitForm());
    expect(result.current.formik.values.logo.assetId).toBe('draft-logo');
    expect(result.current.error).toMatch(/changed|reload/i);
    expect(close).not.toHaveBeenCalled();
    expect(mutations.save.mock.calls[0][0].concurrencyStamp).toBe('opened-version');
  });

  it('preserves the selected asset when a replacement upload fails', async () => {
    mutations.upload.mockReturnValue({
      unwrap: () => Promise.reject(Object.assign(new Error('Invalid image'), { status: 400 })),
    });
    const initial = {
      ...profile,
      choices: { ...profile.choices, logo: { mode: 1 as const, assetId: 'saved-logo' } },
    };
    const { result } = renderHook(() => useIdentityEditor(initial, {}, vi.fn()));
    await act(async () => result.current.uploadFile('logo', new File(['bad'], 'bad.png')));
    expect(result.current.formik.values.logo.assetId).toBe('saved-logo');
    expect(result.current.error).not.toBe('');
    expect(mutations.save).not.toHaveBeenCalled();
  });

  it.each(['uploading', 'saving'] as const)('reports busy while %s', (operation) => {
    mutations[operation] = true;
    const close = vi.fn();
    const { result } = renderHook(() => useIdentityEditor(profile, {}, close));
    expect(result.current.busy).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });
});
