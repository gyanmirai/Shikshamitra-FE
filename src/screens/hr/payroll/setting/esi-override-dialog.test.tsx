import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import EsiOverrideDialog from './esi-override-dialog';

const create = vi.hoisted(() => vi.fn());
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  useGetEsiOverridesQuery: () => ({ data: [] }),
  useCreateEsiOverrideMutation: () => [create, { isLoading: false }],
}));
it.each([
  ['2026-02', '2026-02-28'],
  ['2028-02', '2028-02-29'],
])('serializes complete months for %s', async (month, end) => {
  create.mockReturnValue({ unwrap: () => Promise.resolve() });
  render(
    <EsiOverrideDialog
      open
      month={month}
      employee={{ employeeId: 'e1', employeeName: 'Employee' } as any}
      onClose={vi.fn()}
      onSaved={async () => undefined}
    />
  );
  expect(screen.getByLabelText(/Start month/)).toHaveAttribute('type', 'month');
  expect(screen.getByLabelText(/End month/)).toHaveValue(month);
  fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: 'Supported exception' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add Exception' }));
  await waitFor(() =>
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ effectiveFrom: `${month  }-01`, effectiveTo: end }),
      })
    )
  );
});
it('prevents saving a reversed month range', () => {
  render(
    <EsiOverrideDialog
      open
      month="2026-08"
      employee={{ employeeId: 'e1' } as any}
      onClose={vi.fn()}
      onSaved={async () => undefined}
    />
  );
  fireEvent.change(screen.getByLabelText(/Reason/), { target: { value: 'Supported exception' } });
  fireEvent.change(screen.getByLabelText(/End month/), { target: { value: '2026-07' } });
  expect(screen.getByRole('button', { name: 'Add Exception' })).toBeDisabled();
});
