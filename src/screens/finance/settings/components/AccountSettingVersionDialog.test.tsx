import { it, vi, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import AccountSettingVersionDialog from './AccountSettingVersionDialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

describe('Accounts version history', () => {
  it('shows changes in version order, masks bank details, and closes safely', () => {
    const onClose = vi.fn();
    renderWithProviders(
      <AccountSettingVersionDialog
        open
        title="School bank"
        recordType="Bank account"
        onClose={onClose}
        data={{
          totalCount: 2,
          items: [
            { id: 'created', versionNumber: 1, changeAction: 'created', actorName: 'Admin' },
            {
              id: 'updated',
              versionNumber: 2,
              changeAction: 'updated',
              actorName: 'Accountant',
              changedFields: [
                {
                  fieldName: 'AccountNumber',
                  originalValue: '"123456789012"',
                  newValue: '"123456789999"',
                },
              ],
            },
          ],
        }}
      />
    );
    const entries = screen.getAllByRole('listitem');
    expect(entries[0]).toHaveTextContent('Updated');
    expect(entries[1]).toHaveTextContent('Created');
    expect(screen.getByText('•••• 9012')).toBeInTheDocument();
    expect(screen.getByText('•••• 9999')).toBeInTheDocument();
    expect(screen.queryByText('123456789012')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows a failed request with retry instead of reporting empty history', () => {
    const onRetry = vi.fn();
    renderWithProviders(
      <AccountSettingVersionDialog
        open
        title="Tuition"
        isError
        onRetry={onRetry}
        onClose={() => {}}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Version history could not be loaded');
    expect(screen.queryByText('No history recorded yet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('identifies missing historic details without inventing an editor or time', () => {
    renderWithProviders(
      <AccountSettingVersionDialog
        open
        title="Tuition"
        onClose={() => {}}
        data={{ items: [{ id: 'legacy', versionNumber: 2, changeAction: 'unavailable' }] }}
      />
    );
    expect(
      screen.getByText('Changes and editor were not recorded for this older version.')
    ).toBeInTheDocument();
    expect(screen.getByText(/Editor not recorded · Time not recorded/)).toBeInTheDocument();
  });
});
