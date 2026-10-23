import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ConcessionTypeVersionHistoryDrawer from './ConcessionTypeVersionHistoryDrawer';

const getHistory = vi.fn();
const retry = vi.fn();
vi.mock('src/redux/finance/concessionType', () => ({
  useGetConcessionTypeVersionHistoryQuery: (...args: unknown[]) => getHistory(...args),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const renderDrawer = (drawer: ReactElement) =>
  render(<ThemeProvider theme={createTheme(defaultSettings)}>{drawer}</ThemeProvider>);
const props = {
  open: true,
  concessionTypeId: 'type-1',
  concessionTypeName: 'Sibling Discount',
  onClose: vi.fn(),
  onBackToDetails: vi.fn(),
};
const items = [
  {
    id: 'v1',
    versionNumber: 1,
    changeAction: 'created',
    changeTime: '2026-09-30T10:48:00+05:30',
    actorName: null,
    changedFields: [],
  },
  {
    id: 'v2',
    versionNumber: 2,
    changeAction: 'updated',
    changeTime: '2026-10-02T14:03:00+05:30',
    actorName: 'Admin',
    changedFields: [
      { fieldName: 'Name', originalValue: '"Sibling"', newValue: '"Sibling Discount"' },
      { fieldName: 'DiscountType', originalValue: '1', newValue: null },
    ],
  },
];

describe('Concession Type version history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getHistory.mockReturnValue({
      currentData: { data: { totalCount: items.length, items } },
      isFetching: false,
      isError: false,
      refetch: retry,
    });
  });

  it('selects the newest version and shows recorded Before/After values', () => {
    renderDrawer(<ConcessionTypeVersionHistoryDrawer {...props} />);
    expect(screen.getByRole('dialog', { name: 'Concession Type Version History' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'View version 2' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    const table = screen.getByRole('table', { name: 'Changes in version 2' });
    expect(table).toHaveTextContent('Before');
    expect(table).toHaveTextContent('After');
    expect(table).toHaveTextContent('Sibling');
    expect(table).toHaveTextContent('Legacy discount type');
    expect(table).toHaveTextContent('Flat amount');
    fireEvent.click(screen.getByRole('button', { name: 'View version 1' }));
    expect(screen.getByText('Initial concession type record.')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to details' }));
    expect(props.onBackToDetails).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('filters versions and clears an unmatched search', () => {
    renderDrawer(<ConcessionTypeVersionHistoryDrawer {...props} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search versions' }), {
      target: { value: 'missing' },
    });
    expect(screen.getByText('No versions match your search.')).toBeVisible();
    expect(screen.getByRole('table', { name: 'Changes in version 2' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('button', { name: 'View version 2' })).toBeVisible();
  });

  it('keeps stale data hidden on errors and supports retry', () => {
    getHistory.mockReturnValue({
      currentData: undefined,
      isFetching: false,
      isError: true,
      refetch: retry,
    });
    renderDrawer(<ConcessionTypeVersionHistoryDrawer {...props} />);
    expect(screen.getByText('Unable to load concession type version history.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the empty history state without invented versions', () => {
    getHistory.mockReturnValue({
      currentData: { data: { totalCount: 0, items: [] } },
      isFetching: false,
      isError: false,
    });
    renderDrawer(<ConcessionTypeVersionHistoryDrawer {...props} />);
    expect(
      screen.getByText('No version history is available for this concession type.')
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: /View version/ })).not.toBeInTheDocument();
  });
});
