import { it, vi, expect, describe } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';

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
  it.each(['Income category', 'Expense category', 'Bank account'])(
    'selects and searches recorded versions for %s',
    (recordType) => {
      const onClose = vi.fn();
      renderWithProviders(
        <AccountCategoryVersionDrawer
          open
          title="School income"
          recordType={recordType}
          data={data}
          hiddenFields={['tags']}
          onClose={onClose}
        />
      );
      expect(screen.getByRole('dialog')).toHaveAccessibleName(
        new RegExp(`${recordType} Version History`, 'i')
      );
      expect(screen.getByText('Read Only')).toBeVisible();
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
      expect(within(table).getByText('3A2499917E0DB739D5A9C5D2F8450600')).toBeVisible();
      expect(screen.queryByText('hidden tag')).not.toBeInTheDocument();
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
      fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
      expect(onClose).toHaveBeenCalledOnce();
    }
  );

  it('keeps loading, error, and empty history distinct and allows retry', () => {
    const onRetry = vi.fn();
    const props = {
      open: true,
      title: 'Tuition',
      recordType: 'Income category',
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
