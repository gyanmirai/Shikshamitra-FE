import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { PfCoverageSettings } from './pf-coverage-settings';

const mocks = vi.hoisted(() => ({ save: vi.fn(), permissions: ['View', 'Add'], wideScope: true }));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_: unknown, permission: string) =>
    mocks.permissions.includes(permission.split('.').pop()!),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('../structure/salary-structure-builder-utils', () => ({
  getLocalMonthKey: () => '2026-10',
}));
vi.mock('src/redux/hr/pf-coverage-api', () => ({
  useGetPfCoverageQuery: () => ({
    data: {
      hasSchoolWideScope: mocks.wideScope,
      history: [
        { id: 'coverage-1', effectiveMonth: '2026-10-01', isCovered: true, isCancelled: false },
      ],
    },
  }),
  useSavePfCoverageMutation: () => [mocks.save, { isLoading: false }],
}));

describe('School PF coverage', () => {
  beforeEach(() => {
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = true;
    mocks.save.mockReset().mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });
  afterEach(cleanup);
  it('keeps coverage writes hidden without the exact Add permission or school scope', () => {
    mocks.permissions = ['View'];
    const view = render(<PfCoverageSettings />);
    expect(screen.queryByRole('button', { name: 'Save PF coverage' })).toBeNull();
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = false;
    view.rerender(<PfCoverageSettings />);
    expect(screen.queryByRole('button', { name: 'Save PF coverage' })).toBeNull();
  });
  it('requires coverage and evidence before writing', async () => {
    render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Save PF coverage' }));
    await screen.findByText('Select school coverage.');
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('retains the evidence and idempotency key after a failed save', async () => {
    mocks.save.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Temporary test failure')),
    });
    render(<PfCoverageSettings />);
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'School establishment coverage' }));
    fireEvent.click(screen.getByRole('option', { name: /^Covered under PF$/ }));
    fireEvent.change(screen.getByLabelText('PF coverage evidence reference'), {
      target: { value: 'Synthetic registration' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save PF coverage' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Save PF coverage' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1][0]).toEqual(mocks.save.mock.calls[0][0]);
    expect(mocks.save.mock.calls[0][0]).toMatchObject({
      expectedConfigurationId: 'coverage-1',
      effectiveMonth: '2026-10-01T00:00:00.000Z',
      isCovered: true,
      evidenceReference: 'Synthetic registration',
    });
    expect(screen.getByLabelText('PF coverage evidence reference')).toHaveValue(
      'Synthetic registration'
    );
  });
});
