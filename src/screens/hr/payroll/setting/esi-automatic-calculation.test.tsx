import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { EsiAutomaticCalculation } from './esi-automatic-calculation';

afterEach(cleanup);
describe('monthly ESIC rate guidance', () => {
  it('explains a missing effective policy separately from a transient rate read failure', () => {
    const refetch = vi.fn();
    const view = render(
      <EsiAutomaticCalculation
        rules={{
          isError: true,
          error: { data: { errorCode: 'HR:Payroll:EsiPolicyNotEffective' } },
          refetch,
        }}
      />
    );
    expect(
      screen.getByText(/An ESIC policy effective for this month is unavailable/)
    ).toBeVisible();
    expect(screen.queryByText(/Statutory rates could not be loaded/)).toBeNull();
    view.rerender(
      <EsiAutomaticCalculation rules={{ isError: true, error: { status: 503 }, refetch }} />
    );
    expect(screen.getByText(/Statutory rates could not be loaded/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
