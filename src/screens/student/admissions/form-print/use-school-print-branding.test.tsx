import { act, waitFor, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { useSchoolPrintBranding } from './use-school-print-branding';

const mocks = vi.hoisted(() => ({
  tenantId: 'tenant-1' as string | undefined,
  metadata: vi.fn(),
  image: vi.fn(),
  refetchMetadata: vi.fn(),
  refetchLogo: vi.fn(),
  refetchBanner: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { sessionContext: { tenantId: mocks.tenantId } } }),
}));
vi.mock('src/redux/InstituteSetup/schoolIdentityApi', () => ({
  useGetSchoolBrandingQuery: mocks.metadata,
  useGetSchoolBrandingImageQuery: mocks.image,
}));

describe('Registration school branding reads', () => {
  it('uses persisted school name and address from the existing tenant branding query', () => {
    mocks.metadata.mockReturnValue({
      currentData: {
        schoolName: 'Sample School',
        addressLines: ['School Road', 'Surat, Gujarat 395001'],
        logo: null,
        banner: null,
      },
      isFetching: false,
      isError: false,
    });
    const { result, rerender } = renderHook(({ enabled }) => useSchoolPrintBranding(enabled), {
      initialProps: { enabled: true },
    });
    expect(result.current.branding).toMatchObject({
      schoolName: 'Sample School',
      addressLines: ['School Road', 'Surat, Gujarat 395001'],
    });
    rerender({ enabled: false });
    expect(result.current.branding.schoolName).toBeUndefined();
    expect(result.current.branding.addressLines).toBeUndefined();
  });

  it('never uses a cached image after Institute Setup removes that asset', () => {
    mocks.image.mockReturnValue({
      currentData: new Blob(['old logo']),
      isFetching: false,
      isError: true,
    });
    mocks.metadata.mockReturnValue({
      currentData: { logo: null, banner: null },
      isFetching: false,
      isError: false,
    });
    const { result } = renderHook(() => useSchoolPrintBranding(true));
    expect(result.current.branding.logoUrl).toBeUndefined();
    expect(result.current.error).toBe(false);
    expect(result.current.loading).toBe(false);
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.tenantId = 'tenant-1';
    mocks.metadata.mockReturnValue({
      currentData: { logo: null, banner: null },
      isFetching: false,
      isError: false,
      refetch: mocks.refetchMetadata,
    });
    mocks.image.mockImplementation(({ kind }: { kind: string }) => ({
      currentData: undefined,
      isFetching: false,
      isError: false,
      refetch: kind === 'logo' ? mocks.refetchLogo : mocks.refetchBanner,
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('uses the active tenant and requests only configured branding images', () => {
    mocks.metadata.mockReturnValue({
      currentData: { logo: 'logo-key', banner: null },
      isFetching: false,
      isError: false,
    });
    renderHook(() => useSchoolPrintBranding(true));
    expect(mocks.metadata).toHaveBeenCalledWith({ tenantId: 'tenant-1' }, { skip: false });
    expect(mocks.image).toHaveBeenCalledWith(
      { kind: 'logo', tenantId: 'tenant-1' },
      { skip: false }
    );
    expect(mocks.image).toHaveBeenCalledWith(
      { kind: 'banner', tenantId: 'tenant-1' },
      { skip: true }
    );
  });

  it.each([false, true])(
    'skips branding without enabled header or tenant (enabled %s)',
    (enabled) => {
      if (enabled) mocks.tenantId = undefined;
      const { result } = renderHook(() => useSchoolPrintBranding(enabled));
      expect(mocks.metadata).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
      expect(mocks.image.mock.calls.every((call) => call[1].skip)).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(false);
      expect(result.current.branding.logoUrl).toBeUndefined();
    }
  );

  it('exposes failures and retries configured metadata and image requests', () => {
    mocks.metadata.mockReturnValue({
      currentData: { logo: 'logo', banner: 'banner' },
      isFetching: false,
      isError: true,
      refetch: mocks.refetchMetadata,
    });
    const { result } = renderHook(() => useSchoolPrintBranding(true));
    expect(result.current.error).toBe(true);
    act(() => result.current.retry());
    expect(mocks.refetchMetadata).toHaveBeenCalledOnce();
    expect(mocks.refetchLogo).toHaveBeenCalledOnce();
    expect(mocks.refetchBanner).toHaveBeenCalledOnce();
  });

  it('waits for image conversion and drops branding when school header is disabled', async () => {
    const blob = new Blob(['school logo'], { type: 'image/png' });
    mocks.metadata.mockReturnValue({
      currentData: { logo: 'logo', banner: null },
      isFetching: false,
      isError: false,
    });
    mocks.image.mockImplementation(({ kind }: { kind: string }) => ({
      currentData: kind === 'logo' ? blob : undefined,
      isFetching: false,
      isError: false,
    }));
    const { result, rerender } = renderHook(({ enabled }) => useSchoolPrintBranding(enabled), {
      initialProps: { enabled: true },
    });
    expect(result.current.loading).toBe(true);
    await waitFor(() =>
      expect(result.current.branding.logoUrl).toMatch(/^data:image\/png;base64,/)
    );
    expect(result.current.loading).toBe(false);
    rerender({ enabled: false });
    expect(result.current.branding.logoUrl).toBeUndefined();
    expect(result.current.loading).toBe(false);
  });
});
