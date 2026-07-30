import type { HrReportField, HrReportFilterCondition } from 'src/redux/hr/hrReportsApi';

import { useState } from 'react';
import { it, expect, describe, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { HrReportFiltersSection } from './HrReportFiltersSection';

// Stub Iconify so tests never fetch icons over HTTPS from the Iconify API.
// Real network fetches get torn down on exit, causing unhandled
// `write ECANCELED` / "SSL destruction" errors that fail CI.
vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

const fields: HrReportField[] = [
  {
    id: 'employeeCode',
    label: 'Employee Code',
    type: 'string',
    filterable: true,
    sortable: true,
    groupable: true,
    summarizable: false,
    operators: ['equals', 'contains', 'in'],
    options: [],
  },
];

function FilterHarness({ initial }: { initial: HrReportFilterCondition[] }) {
  const [conditions, setConditions] = useState(initial);

  return (
    <>
      <HrReportFiltersSection
        conditions={conditions}
        filterFields={fields}
        onAddCondition={() => undefined}
        onUpdateCondition={(index, updater) =>
          setConditions((current) =>
            current.map((condition, itemIndex) =>
              itemIndex === index ? updater(condition) : condition
            )
          )
        }
        onRemoveCondition={() => undefined}
      />
      <pre data-testid="conditions-json">{JSON.stringify(conditions)}</pre>
    </>
  );
}

describe('HrReportFiltersSection', () => {
  it('migrates a single value into values when switching to in', async () => {
    const user = userEvent.setup();
    render(
      <FilterHarness initial={[{ field: 'employeeCode', operator: 'equals', value: 'EMP-1' }]} />
    );

    await user.click(screen.getByRole('combobox', { name: 'Operator' }));
    await user.click(screen.getByRole('option', { name: 'in' }));

    await waitFor(() =>
      expect(screen.getByTestId('conditions-json')).toHaveTextContent(
        '[{"field":"employeeCode","operator":"in","values":["EMP-1"]}]'
      )
    );
  });

  it('migrates the first in value back to value for single-value operators', async () => {
    const user = userEvent.setup();
    render(
      <FilterHarness
        initial={[{ field: 'employeeCode', operator: 'in', values: ['EMP-1', 'EMP-2'] }]}
      />
    );

    await user.click(screen.getByRole('combobox', { name: 'Operator' }));
    await user.click(screen.getByRole('option', { name: 'equals' }));

    await waitFor(() =>
      expect(screen.getByTestId('conditions-json')).toHaveTextContent(
        '[{"field":"employeeCode","operator":"equals","value":"EMP-1"}]'
      )
    );
  });
});
