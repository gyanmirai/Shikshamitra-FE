import { vi, it, expect, describe, afterEach } from 'vitest';
import { screen, render, waitFor, fireEvent } from '@testing-library/react';

import { useDeferredRender } from './useDeferredRender';

function DeferredRenderHarness() {
  const { targetRef, shouldRender } = useDeferredRender('0px');

  return (
    <div ref={targetRef} data-testid="target">
      <span data-testid="status">{shouldRender ? 'ready' : 'pending'}</span>
    </div>
  );
}

describe('useDeferredRender', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders when the fallback viewport check reaches the target', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const bounds = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(DOMRect.fromRect({ x: 0, y: 1000, width: 400, height: 390 }));

    render(<DeferredRenderHarness />);
    expect(screen.getByTestId('status')).toHaveTextContent('pending');

    bounds.mockReturnValue(DOMRect.fromRect({ x: 0, y: 100, width: 400, height: 390 }));
    fireEvent(window, new Event('resize'));

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('ready'));
  });
});
