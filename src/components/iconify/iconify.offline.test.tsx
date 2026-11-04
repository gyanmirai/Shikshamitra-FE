import { createRef } from 'react';
import { _api } from '@iconify/react';
import { render, waitFor } from '@testing-library/react';
import { it, vi, expect, afterAll, describe, beforeAll } from 'vitest';

import { Iconify } from './iconify';

// Existing icons observed on the signed-in Finance landing page and its navigation.
// These names intentionally preserve legacy glyphs; new UI icons must use mdi:.
const criticalIcons = [
  "lucide:landmark",
  "lucide:layout-dashboard",
  "lucide:info",
  "ph:books-light",
  "ph:student",
  "solar:buildings-2-outline",
  "solar:shield-check-outline",
  "solar:square-academic-cap-2-broken",
  "solar:user-check-outline",
  "solar:hamburger-menu-outline",
  "solar:pin-bold",
  "solar:export-bold",
  "solar:eye-bold",
  "solar:magnifer-linear",
  "solar:maximize-square-3-outline",
  "clarity:building-line",
  "clarity:employee-line",
  "fluent-mdl2:office-chat",
  "gis:route",
  "streamline-freehand:human-resources-businessman",
  "mdi:bank-outline",
  "mdi:bell-outline",
  "mdi:cash-plus",
  "mdi:cash-refund",
  "mdi:chart-box-outline",
  "mdi:clipboard-list-outline",
  "mdi:clipboard-text-clock-outline",
  "mdi:cog-outline",
  "mdi:currency-usd",
  "mdi:file-document-outline",
  "mdi:hand-coin-outline",
  "mdi:receipt-text-outline",
  "mdi:source-branch-check",
  "mdi:ticket-percent-outline",
  "mdi:view-dashboard-outline",
  "eva:arrow-ios-downward-fill",
  "eva:arrow-ios-forward-fill",
  "fluent:filter-12-filled"
];

const originalFetch = _api.getFetch();
const offlineFetch = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}', { status: 404 }));

beforeAll(() => _api.setFetch(offlineFetch));
afterAll(() => {
  if (originalFetch) _api.setFetch(originalFetch);
});

describe('critical Iconify delivery', () => {
  it('renders the existing navigation and finance icons without provider requests', async () => {
    const { container } = render(
      <div>
        {criticalIcons.map((icon) => <Iconify key={icon} icon={icon} aria-label={icon} />)}
      </div>
    );
    await waitFor(() => expect(container.querySelectorAll('svg')).toHaveLength(criticalIcons.length), { timeout: 2500 });
    criticalIcons.forEach((icon) => {
      const svg = container.querySelector(`svg[aria-label="${  icon  }"]`);
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBeTruthy();
      expect(svg?.innerHTML).toMatch(/<(path|g|circle|rect|ellipse|polygon|polyline|line)\b/);
    });
    expect(offlineFetch).not.toHaveBeenCalled();
  });

  it('keeps refs, sizing, classes and accessibility props on the real SVG', async () => {
    const ref = createRef<SVGElement>();
    const { getByLabelText } = render(
      <Iconify ref={ref} icon="mdi:bank-outline" width={28} className="bank-icon"
        aria-label="School bank" aria-hidden={false} sx={{ color: 'primary.main' }} />
    );
    await waitFor(() => expect(ref.current?.tagName.toLowerCase()).toBe('svg'));
    expect(ref.current).toBe(getByLabelText('School bank'));
    expect(ref.current).toHaveClass('bank-icon');
    expect(ref.current).not.toHaveAttribute('aria-hidden', 'true');
    expect(ref.current).toHaveStyle({ width: '28px', height: '28px' });
    expect(offlineFetch).not.toHaveBeenCalled();
  });
  it('retains provider fallback for an icon outside the critical bundle', async () => {
    offlineFetch.mockClear();
    render(<Iconify icon="mdi:abacus" />);
    await waitFor(() => expect(offlineFetch).toHaveBeenCalled());
    expect(String(offlineFetch.mock.calls[0][0])).toContain('mdi.json');
    expect(String(offlineFetch.mock.calls[0][0])).toContain('abacus');
  });

});
