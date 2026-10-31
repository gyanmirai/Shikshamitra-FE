import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import VersionDiffTable from './VersionDiffTable';

import type { PolicyVersion } from '../../hooks/useFinancePolicyVersion';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const version: PolicyVersion = {
  eventId: 'v2',
  versionNumber: 2,
  actor: 'Finance Admin',
  date: '2026-10-23T10:30:00Z',
  createdAt: '2026-10-23T10:30:00Z',
  action: 'Updated',
  status: 'Active',
  summary: 'Name updated',
  snapshotAfter: {
    PolicyName: 'Saved historical name',
    Description: 'Unchanged historical description',
    Status: 'Active',
    ConcurrencyStamp: 'internal-concurrency-value',
  },
  changedFields: [
    { field: 'PolicyName', oldValue: 'Previous name', newValue: 'Saved historical name' },
  ],
};

const view = (selected: PolicyVersion, policyType = 'concession') => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <VersionDiffTable
      selectedVersion={selected}
      valueContext={{ policyType }}
      collapsibleChanges
      showSavedDetails
    />
  </ThemeProvider>
);

describe('Policy version-history cards', () => {
  it.each(['concession', 'collection', 'refund', 'proration'])(
    'shows a complete saved snapshot independently from changes for %s policies',
    (policyType) => {
      render(view(version, policyType));
      expect(screen.getByRole('button', { name: 'Changes' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
      fireEvent.click(screen.getByRole('button', { name: 'Changes' }));
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
      expect(screen.getByText('Saved historical name')).toBeVisible();
      expect(screen.getByText('Unchanged historical description')).toBeVisible();
      expect(screen.queryByText('internal-concurrency-value')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Saved version details information' }));
      expect(screen.getByRole('button', { name: 'Saved version details' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    }
  );

  it('closes the saved snapshot on selection change and shows only that version on reopening', () => {
    const { rerender } = render(view(version));
    fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
    expect(screen.getByText('Unchanged historical description')).toBeVisible();
    rerender(
      view({
        ...version,
        eventId: 'v1',
        versionNumber: 1,
        changedFields: [],
        snapshotAfter: { PolicyName: 'First saved name', Description: 'First saved description' },
      })
    );
    expect(screen.getByRole('button', { name: 'Saved version details' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Saved version details' }));
    expect(screen.getByText('First saved description')).toBeVisible();
    expect(screen.queryByText('Unchanged historical description')).not.toBeInTheDocument();
  });

  it('does not invent a saved snapshot for histories that only record field changes', () => {
    render(view({ ...version, snapshotAfter: undefined }));
    expect(screen.getByRole('table', { name: 'Changes in version 2' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Saved version details' })).not.toBeInTheDocument();
  });
});
