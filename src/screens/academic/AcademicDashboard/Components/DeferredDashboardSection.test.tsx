import { useState } from 'react';
import { vi, it, expect, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { DeferredDashboardSection } from './DeferredDashboardSection';

function DashboardWithDelayedData() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setLoaded(true)}>
        Load dashboard data
      </button>
      {loaded ? (
        <DeferredDashboardSection>
          <div>Dashboard details</div>
        </DeferredDashboardSection>
      ) : null}
    </>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('waits to mount details until the section approaches the viewport after data loads', async () => {
  vi.stubGlobal('IntersectionObserver', undefined);
  const bounds = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue(DOMRect.fromRect({ x: 0, y: 1800, width: 400, height: 390 }));

  render(<DashboardWithDelayedData />);
  fireEvent.click(screen.getByRole('button', { name: 'Load dashboard data' }));
  expect(screen.queryByText('Dashboard details')).not.toBeInTheDocument();

  bounds.mockReturnValue(DOMRect.fromRect({ x: 0, y: 100, width: 400, height: 390 }));
  fireEvent(window, new Event('resize'));

  await waitFor(() => expect(screen.getByText('Dashboard details')).toBeInTheDocument());
});
