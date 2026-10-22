import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { ChargeCategoryDialog } from './ChargeCategory';

const mocks = vi.hoisted(() => ({ save: vi.fn(), close: vi.fn() }));

vi.mock('react-redux', async (original) => ({
  ...(await original<typeof import('react-redux')>()),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: { type: string }) =>
    type === 'mutation'
      ? [(payload: unknown) => ({ unwrap: () => mocks.save(payload) }), { isLoading: false }]
      : { data: { items: [] }, isLoading: false },
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <select
      aria-label="Income Category"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select</option>
      <option value="income">Income</option>
    </select>
  ),
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/screens/finance/settings/components/DownstreamUsageWarning', () => ({
  default: () => null,
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

describe('Charge category approval configuration', () => {
  beforeEach(() => {
    mocks.save.mockReset().mockResolvedValue({});
    mocks.close.mockReset();
  });

  it('defaults approval on and submits the selected false value for a new category', async () => {
    render(<ChargeCategoryDialog open onClose={mocks.close} />);
    const toggle = screen.getByRole('switch', { name: 'Approval Required' });
    expect(toggle).toBeChecked();
    fireEvent.click(toggle);
    fireEvent.change(screen.getByRole('textbox', { name: 'Charge Category Name *' }), {
      target: { value: 'Test Charge' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Income Category' }), {
      target: { value: 'income' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          academicYearId: 'year',
          body: expect.objectContaining({ isApprovalRequired: false }),
        })
      )
    );
  });

  it('preserves an existing false value when editing and allows enabling approval', async () => {
    render(
      <ChargeCategoryDialog
        open
        onClose={mocks.close}
        editData={{
          id: 'category',
          name: 'Test Charge',
          incomeCategoryId: 'income',
          isApprovalRequired: false,
        }}
      />
    );
    const toggle = screen.getByRole('switch', { name: 'Approval Required' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith(
        expect.objectContaining({
          chargeCategoryId: 'category',
          body: expect.objectContaining({ isApprovalRequired: true }),
        })
      )
    );
  });

  it('keeps edited values while the parent decides whether to discard them', () => {
    render(<ChargeCategoryDialog open onClose={mocks.close} />);
    const name = screen.getByRole('textbox', { name: 'Charge Category Name *' });
    fireEvent.change(name, { target: { value: 'Unsaved Category' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mocks.close).toHaveBeenCalledWith(null, false);
    expect(name).toHaveValue('Unsaved Category');
  });
});
