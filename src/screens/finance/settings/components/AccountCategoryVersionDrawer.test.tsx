import { it, vi, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { act, screen, within, fireEvent } from '@testing-library/react';

import AccountCategoryVersionDrawer from './AccountCategoryVersionDrawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const data = {
  totalCount: 3,
  items: [
    { id: 'legacy', versionNumber: 1, changeAction: 'unavailable' },
    {
      id: 'created',
      versionNumber: 2,
      changeAction: 'created',
      actorName: 'Admin',
      changedFields: [{ fieldName: 'Name', newValue: '"Tuition"' }],
    },
    {
      id: 'updated',
      versionNumber: 3,
      changeAction: 'updated',
      actorName: 'Accountant',
      changedFields: [
        { fieldName: 'Name', originalValue: '"Tuition"', newValue: '"School income"' },
        { fieldName: 'IsActive', originalValue: 'false', newValue: 'true' },
        { fieldName: 'Tags', newValue: '["hidden tag"]' },
        { fieldName: 'Code', newValue: '"3A2499917E0DB739D5A9C5D2F8450600"' },
      ],
    },
  ],
};

describe('Category version history drawer', () => {
  it.each(['Income category', 'Expense category', 'Bank account'] as const)(
    'selects and searches recorded versions for %s',
    (recordType) => {
      const onClose = vi.fn();
      renderWithProviders(
        <AccountCategoryVersionDrawer
          open
          title="School income"
          recordType={recordType}
          data={data}
          onClose={onClose}
          onPageChange={vi.fn()}
        />
      );
      expect(screen.getByRole('dialog')).toHaveAccessibleName(
        new RegExp(`${recordType} Version History`, 'i')
      );
      expect(screen.queryByText('Read Only')).not.toBeInTheDocument();
      expect(screen.queryByText(/recorded versions$/)).not.toBeInTheDocument();
      expect(screen.queryByRole('navigation', { name: 'Version history pages' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'View version 3' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      const table = screen.getByRole('table', { name: 'Changes in version 3' });
      expect(
        within(table)
          .getAllByRole('columnheader')
          .map((cell) => cell.textContent)
      ).toEqual(['Field', 'Before', 'After']);
      expect(within(table).getByText('School income')).toBeVisible();
      expect(within(table).getByText('Active')).toBeVisible();
      if (recordType === 'Bank account') {
        expect(within(table).getByText('3A2499917E0DB739D5A9C5D2F8450600')).toBeVisible();
      } else {
        expect(within(table).queryByRole('rowheader', { name: 'Code' })).not.toBeInTheDocument();
        expect(screen.queryByText('hidden tag')).not.toBeInTheDocument();
      }
      fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
      expect(screen.getByRole('table', { name: 'Changes in version 3' })).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'View version 2' }));
      expect(screen.getByRole('table', { name: 'Changes in version 2' })).toBeVisible();
      fireEvent.change(screen.getByRole('textbox', { name: 'Search versions' }), {
        target: { value: 'unmatched' },
      });
      expect(screen.getByText('No versions match your search.')).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      fireEvent.click(screen.getByRole('button', { name: 'View version 1' }));
      expect(
        screen.getByText('Changes and editor were not recorded for this older version.')
      ).toBeVisible();
      expect(screen.getByText('Editor not recorded', { exact: true })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /^Close .+ Version History$/ }));
      expect(onClose).toHaveBeenCalledOnce();
    }
  );

  it.each(['Income category', 'Expense category'] as const)(
    'shows only populated or changed business fields for %s',
    (recordType) => {
      renderWithProviders(
        <AccountCategoryVersionDrawer
          open
          title="School income"
          recordType={recordType}
          onClose={vi.fn()}
          data={{
            items: [
              {
                id: 'created',
                versionNumber: 1,
                changeAction: 'created',
                changedFields: [
                  { fieldName: 'Description', originalValue: null, newValue: 'null' },
                  { fieldName: 'EffectiveTo', newValue: '""' },
                  { fieldName: 'IsActive', newValue: 'true' },
                  { fieldName: 'EffectiveFrom', originalValue: '', newValue: null },
                  { fieldName: 'DeactivationReason', newValue: '"  "' },
                  { fieldName: 'Name', newValue: '"School income"' },
                  { fieldName: 'DefaultAccountHeadId', newValue: '"internal-account-id"' },
                  { fieldName: 'Code', newValue: '"3A251E846DEA63D42F401CE39C8F04E9"' },
                ],
              },
              {
                id: 'updated',
                versionNumber: 2,
                changeAction: 'updated',
                changedFields: [
                  { fieldName: 'Name', originalValue: 'School income', newValue: '"School income"' },
                  { fieldName: 'Description', originalValue: '"Old description"', newValue: 'null' },
                  { fieldName: 'IsActive', originalValue: 'true', newValue: 'false' },
                  { fieldName: 'DeactivationReason', newValue: '"Not set"' },
                  { fieldName: 'EffectiveFrom', newValue: '"2026-11-24T00:00:00+05:30"' },
                ],
              },
              {
                id: 'internal-only',
                versionNumber: 3,
                changeAction: 'updated',
                changedFields: [{ fieldName: 'Code', newValue: '"LEGACY-123"' }],
              },
            ],
          }}
        />
      );

      expect(screen.getByText('No changes to display for this version.')).toBeVisible();
      fireEvent.click(screen.getByRole('button', { name: 'View version 1' }));
      const creation = within(screen.getByRole('table', { name: 'Changes in version 1' }));
      expect(creation.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
        'Status',
        'Name',
      ]);
      expect(creation.getByRole('row', { name: 'Status Not set Active' })).toBeVisible();
      expect(creation.getByRole('row', { name: 'Name Not set School income' })).toBeVisible();

      fireEvent.click(screen.getByRole('button', { name: 'View version 2' }));
      const update = within(screen.getByRole('table', { name: 'Changes in version 2' }));
      expect(update.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
        'Description',
        'Status',
        'Deactivation Reason',
        'Effective From',
      ]);
      expect(update.getByRole('row', { name: 'Description Old description Not set' })).toBeVisible();
      expect(update.getByRole('row', { name: 'Status Active Inactive' })).toBeVisible();
    }
  );

  it('keeps navigation to older versions when the list spans multiple pages', () => {
    const onPageChange = vi.fn();
    renderWithProviders(
      <AccountCategoryVersionDrawer
        open
        title="School income"
        recordType="Income category"
        data={{ ...data, totalCount: 51 }}
        onClose={vi.fn()}
        onPageChange={onPageChange}
      />
    );

    const pagination = screen.getByRole('navigation', { name: 'Version history pages' });
    expect(within(pagination).getByRole('button', { name: 'Go to previous page' })).toBeDisabled();
    const nextPage = within(pagination).getByRole('button', { name: 'Go to next page' });
    act(() => nextPage.focus());
    fireEvent.click(nextPage);
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('keeps loading, error, and empty history distinct and allows retry', () => {
    const onRetry = vi.fn();
    const props = {
      open: true,
      title: 'Tuition',
      recordType: 'Income category' as const,
      onClose: vi.fn(),
      onRetry,
    };
    const { rerender } = renderWithProviders(<AccountCategoryVersionDrawer {...props} isLoading />);
    expect(screen.getByRole('status', { name: 'Loading version history' })).toBeVisible();
    rerender(<AccountCategoryVersionDrawer {...props} isError />);
    expect(screen.getByRole('alert')).toHaveTextContent('Version history could not be loaded');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
    rerender(<AccountCategoryVersionDrawer {...props} data={{ items: [] }} />);
    expect(screen.getByText('No history recorded yet')).toBeVisible();
  });

  it('keeps bank account numbers masked in both comparison columns', () => {
    renderWithProviders(
      <AccountCategoryVersionDrawer
        open
        title="School Bank"
        recordType="Bank account"
        onClose={vi.fn()}
        data={{
          items: [
            {
              id: 'bank-version',
              versionNumber: 1,
              changeAction: 'updated',
              changedFields: [
                {
                  fieldName: 'AccountNumber',
                  originalValue: '"123456781234"',
                  newValue: '"987654324321"',
                },
              ],
            },
          ],
        }}
      />
    );
    expect(screen.getByText('•••• 1234')).toBeVisible();
    expect(screen.getByText('•••• 4321')).toBeVisible();
    expect(screen.queryByText('123456781234')).not.toBeInTheDocument();
    expect(screen.queryByText('987654324321')).not.toBeInTheDocument();
  });
});
