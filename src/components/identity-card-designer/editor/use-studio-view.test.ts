import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useStudioView } from './use-studio-view';

it('keeps Fit responsive while preserving a deliberate zoom until Fit is selected again', () => {
  const { result } = renderHook(() => useStudioView(true, null));
  act(() => result.current.measureFit(0.5));
  expect(result.current.zoom).toBe(0.5);
  act(() => result.current.measureFit(0.3));
  expect(result.current.zoom).toBe(0.3);
  act(() => result.current.setZoom(1));
  act(() => result.current.measureFit(0.2));
  expect(result.current.zoom).toBe(1);
  act(() => result.current.fitCanvas());
  expect(result.current.zoom).toBe(0.2);
  act(() => result.current.measureFit(0.4));
  expect(result.current.zoom).toBe(0.4);
});
