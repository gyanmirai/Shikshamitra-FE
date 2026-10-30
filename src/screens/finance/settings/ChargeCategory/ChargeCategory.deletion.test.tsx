import type { ReactNode } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';

import FinanceChargeCategory, { ChargeCategoryDialog } from './ChargeCategory';

const mocks = vi.hoisted(() => ({ usage: vi.fn(), remove: vi.fn() }));

it('filters charge category names and preserves description punctuation', async () => {
  render(<ChargeCategoryDialog open onClose={vi.fn()} />);
  const name = screen.getByRole('textbox', { name: 'Charge Category Name *' });
  fireEvent.change(name, { target: { value: 'Bus @Charges_% 2' } });
  await waitFor(() => expect(name).toHaveValue('Bus Charges 2'));
  fireEvent.change(name, { target: { value: 'बस शुल्क २#' } });
  await waitFor(() => expect(name).toHaveValue('बस शुल्क २'));
  fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
    target: { value: 'Bus charges (2026): 50% concession.' },
  });
  expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
    'Bus charges (2026): 50% concession.'
  );
  fireEvent.change(name, { target: { value: '@#$' } });
  fireEvent.blur(name);
  expect(await screen.findByText('Charge Category Name is required')).toBeVisible();
});

it('validates an existing charge category name before saving', async () => {
  render(
    <ChargeCategoryDialog
      open
      onClose={vi.fn()}
      editData={{
        id: 'existing',
        name: 'Old@Category',
        incomeCategoryId: 'category',
      }}
    />
  );
  fireEvent.blur(screen.getByRole('textbox', { name: 'Charge Category Name *' }));
  expect(
    await screen.findByText('Charge Category Name can only contain letters, numbers, and spaces')
  ).toBeVisible();
});
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      globalState: { currentYear: { id: 'year' } },
      auth: {
        permissions: [
          { name: 'Finance.Settings.ChargeCategory.Delete', isGranted: true },
          { name: 'Finance.Fees.Charges.View', isGranted: true },
        ],
      },
    }),
}));
vi.mock('src/redux/finance/chargeCategory', () => ({
  useGetChargeCategoriesQuery: () => ({ data: { items: [] } }),
  usePatchChargeCategoryStatusMutation: vi.fn(),
  usePutChargeCategoryMutation: vi.fn(),
  usePostChargeCategoryMutation: vi.fn(),
  useDeleteChargeCategoryMutation: () => [
    (payload: unknown) => ({ unwrap: () => mocks.remove(payload) }),
    { isLoading: false },
  ],
  useLazyGetChargeCategoryUsageQuery: () => [(id: string) => ({ unwrap: () => mocks.usage(id) })],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: { type: string }) =>
    type === 'mutation'
      ? [vi.fn(), { isLoading: false }]
      : {
          data: { items: [{ id: 'category', name: '8th Charge Category', isActive: true }] },
          isLoading: false,
        },
}));
vi.mock('src/hooks/use-finance-form-close', () => ({
  useFinanceFormClose: () => ({ handleClose: vi.fn(), confirmation: null }),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>
          {columns.find((column: any) => column.id === 'actions').render(null, row)}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button key={action.id} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const unused = {
  categoryId: 'category',
  categoryName: '8th Charge Category',
  chargeCount: 0,
  studentAssignmentCount: 0,
  chargeNames: [],
  canDelete: true,
};
const used = {
  ...unused,
  chargeCount: 1,
  studentAssignmentCount: 3,
  chargeNames: ['Test Charge One'],
  canDelete: false,
};

describe('Charge category deletion dependencies', () => {
  beforeEach(() => {
    mocks.usage.mockReset().mockResolvedValue(unused);
    mocks.remove.mockReset().mockResolvedValue({});
  });

  it('shows the named dependency, count and review action before any delete request', async () => {
    mocks.usage.mockResolvedValue(used);
    render(<FinanceChargeCategory />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Test Charge One')).toBeVisible();
    expect(screen.getByText('1 charge')).toBeVisible();
    expect(screen.getByText(/3 student assignments/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Review charges' })).toHaveAttribute(
      'href',
      '/finance/charge-management'
    );
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).not.toHaveTextContent('This action cannot be undone');
  });

  it('requires confirmation and keeps cancellation free of mutations', async () => {
    render(<FinanceChargeCategory />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText(/This action cannot be undone/)).toBeVisible();
    expect(mocks.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mocks.remove).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByText(/This action cannot be undone/);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() =>
      expect(mocks.remove).toHaveBeenCalledExactlyOnceWith({ chargeCategoryId: 'category' })
    );
  });

  it('blocks deletion while dependency lookup fails and permits retry', async () => {
    mocks.usage.mockRejectedValueOnce({ data: { detail: 'Service unavailable' } });
    render(<FinanceChargeCategory />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to check charge dependencies'
    );
    expect(mocks.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText(/This action cannot be undone/)).toBeVisible();
  });

  it('rechecks and explains a dependency created after preflight', async () => {
    mocks.usage.mockResolvedValueOnce(unused).mockResolvedValueOnce(used);
    mocks.remove.mockRejectedValue({ data: { error: { code: 'Finance:Charge:010028' } } });
    render(<FinanceChargeCategory />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByText(/This action cannot be undone/);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));
    expect(await screen.findByText('Test Charge One')).toBeVisible();
    expect(mocks.usage).toHaveBeenCalledTimes(2);
    expect(mocks.remove).toHaveBeenCalledTimes(1);
  });
});
