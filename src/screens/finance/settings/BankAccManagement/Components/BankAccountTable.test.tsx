import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import BankAccountTable from './BankAccountTable';

import type { IBankAccount } from './type';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/hooks/useAccountSettingPermissions', () => ({
  useAccountSettingPermissions: () => ({ canChangeStatus: true, canEdit: true, canDelete: true }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({ default: () => [vi.fn(), {}] }));
vi.mock('src/redux/finance/BankAccountManage/bankAccountApi', () => ({
  useGetBankAccountVersionsQuery: () => ({}),
  usePatchBankAccountStatusMutation: vi.fn(),
}));
vi.mock('src/screens/finance/settings/components/AccountSettingVersionDialog', () => ({
  default: () => null,
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions, directActionLimit }: any) => (
    <div data-testid="row-actions" data-limit={directActionLimit}>
      {actions.map((action: any) => (
        <button type="button" key={action.id} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, handleRowClick }: any) => (
    <div>
      {data.map((row: any) => (
        <div
          key={row.id}
          data-testid="row"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleRowClick(row);
          }}
          onClick={() => handleRowClick(row)}
        >
          {columns
            .filter((col: any) => ['bankName', 'isActive', 'action'].includes(col.id))
            .map((col: any) => (
              <React.Fragment key={col.id}>{col.render(row[col.id], row)}</React.Fragment>
            ))}
        </div>
      ))}
    </div>
  ),
}));
const bank = { id: 'bank', bankName: 'School Bank', isActive: true } as IBankAccount;
function show() {
  const props = {
    data: [bank],
    onAddBankAccount: {},
    editData: null,
    open: false,
    setOpenDialog: vi.fn(),
    setEditData: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };
  render(<BankAccountTable {...props} />);
  return props;
}
describe('bank list activity entry', () => {
  it('opens through the bank name and the explicit View action', () => {
    const props = show();
    fireEvent.click(screen.getByRole('button', { name: 'School Bank' }));
    expect(props.onView).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'View activity' }));
    expect(props.onView).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('row-actions')).toHaveAttribute('data-limit', '2');
  });
  it('isolates history, edit, delete and active switch from row opening', () => {
    const props = show();
    ['Version history', 'Edit', 'Delete'].forEach((name) =>
      fireEvent.click(screen.getByRole('button', { name }))
    );
    fireEvent.click(screen.getByRole('switch', { name: 'Deactivate School Bank' }));
    expect(props.onView).not.toHaveBeenCalled();
    expect(props.onEdit).toHaveBeenCalledWith(bank);
    expect(props.onDelete).toHaveBeenCalledWith(bank);
  });
  it('opens the activity through a plain row click', () => {
    const props = show();
    fireEvent.click(screen.getByTestId('row'));
    expect(props.onView).toHaveBeenCalledWith(bank);
  });
});
