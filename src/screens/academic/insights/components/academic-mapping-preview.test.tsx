import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { it, expect, describe } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { AcademicMappingWaffle } from './academic-mapping-waffle';

const mapping: AcademicInsightsSection = {
  key: 'classrooms',
  status: 'ready',
  summary: 'Active class teacher mappings in the selected scope.',
  metrics: [
    { key: 'divisions', label: 'Divisions', value: 31 },
    { key: 'mapped', label: 'Mapped divisions', value: 0 },
  ],
  series: [
    {
      name: 'class-mapping',
      points: Array.from({ length: 31 }, (_, index) => ({
        key: `division-${index + 1}`,
        label: `Division ${index + 1}`,
        value: 0,
        status: 'unmapped',
      })),
    },
  ],
  items: [],
};
const totalValue = (label: string) =>
  within(screen.getByRole('group', { name: 'Mapping totals' })).getByText(label).nextElementSibling;

describe('academic mapping preview', () => {
  it('bounds the real 31-division preview and retains all supplied divisions in accessible data', () => {
    render(<AcademicMappingWaffle section={mapping} />);
    expect(
      within(screen.getByRole('list', { name: 'Class teacher mapping' })).getAllByRole('listitem')
    ).toHaveLength(12);
    expect(screen.getByText('Showing 12 of 31 returned divisions.')).toBeVisible();
    expect(totalValue('Total divisions')).toHaveTextContent('31');
    expect(totalValue('Teacher assigned')).toHaveTextContent('0');
    expect(totalValue('Needs assignment')).toHaveTextContent('31');
    const data = screen.getByRole('group', { name: 'Chart data' });
    expect(within(data).getByText('Division 31')).toBeInTheDocument();
    expect(data).not.toHaveAttribute('aria-hidden', 'true');
  });

  it('shows full-scope totals separately from a capped returned preview', () => {
    render(
      <AcademicMappingWaffle
        section={{
          ...mapping,
          metrics: [
            { key: 'divisions', label: 'Divisions', value: 240 },
            { key: 'mapped', label: 'Mapped divisions', value: 200 },
          ],
        }}
      />
    );
    expect(totalValue('Total divisions')).toHaveTextContent('240');
    expect(totalValue('Teacher assigned')).toHaveTextContent('200');
    expect(totalValue('Needs assignment')).toHaveTextContent('40');
    expect(screen.getByText('Showing 12 of 31 returned divisions.')).toBeVisible();
  });

  it('does not replace missing full-scope metrics with zero or assume returned points cover the whole scope', () => {
    render(
      <AcademicMappingWaffle
        section={{
          ...mapping,
          metrics: [
            { key: 'divisions', label: 'Divisions', value: null },
            { key: 'mapped', label: 'Mapped divisions', value: null },
          ],
        }}
      />
    );
    expect(totalValue('Total divisions')).toHaveTextContent('Unavailable');
    expect(totalValue('Teacher assigned')).toHaveTextContent('Unavailable');
    expect(totalValue('Needs assignment')).toHaveTextContent('Unavailable');
  });
});
