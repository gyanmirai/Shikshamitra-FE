import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach } from 'vitest';

import { useLoginSceneMotion } from './use-login-scene-motion';

describe('shared classroom animation controls', () => {
  afterEach(() => vi.restoreAllMocks());

  it('plays automatically on a visible page without a manual playback toggle', () => {
    const { result } = renderHook(() => useLoginSceneMotion());
    expect(result.current.motionPaused).toBe(false);
    expect(result.current).not.toHaveProperty('togglePaused');
  });

  it('keeps the entire scene still when reduced motion is requested', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((media) => ({
      matches: media === '(prefers-reduced-motion: reduce)',
      media,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    const { result } = renderHook(() => useLoginSceneMotion());
    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.motionPaused).toBe(true);
  });

  it('stops background-page motion and resumes when the page becomes visible', () => {
    const { result } = renderHook(() => useLoginSceneMotion());
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.motionPaused).toBe(true);
    visibility.mockReturnValue('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(result.current.motionPaused).toBe(false);
  });
});
