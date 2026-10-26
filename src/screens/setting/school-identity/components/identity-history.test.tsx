import type { ReactNode } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';

import { IdentityHistory } from './identity-history';

import type { IdentityRevision } from '../types';

const query = vi.hoisted(() => ({
  currentData: undefined as IdentityRevision[] | undefined,
  isLoading: false,
  isError: false,
  isFetching: false,
  refetch: vi.fn(),
}));
vi.mock('src/redux/InstituteSetup/schoolIdentityApi', () => ({
  useGetSchoolIdentityHistoryQuery: () => query,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title }: { children: ReactNode; title: string }) => (
    <section role="dialog" aria-label={title}>
      {children}
    </section>
  ),
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
const revision = (id: string, creationTime: string): IdentityRevision => ({
  id,
  creationTime,
  reason: `Saved ${id}`,
  creatorName: 'Test administrator',
  choices: { logo: { mode: 1 }, banner: { mode: 2 }, signature: null },
});
const theme = createTheme(defaultSettings);
const close = vi.fn();
const show = (context = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <IdentityHistory context={context} onClose={close} />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(query, {
    currentData: undefined,
    isLoading: false,
    isError: false,
    isFetching: false,
  });
});
afterEach(cleanup);

describe('School Identity revision history', () => {
  it('sorts snapshots newest first without mutating query data and marks only the newest', () => {
    query.currentData = [
      revision('older', '2026-10-14T10:00:00Z'),
      revision('newer', '2026-10-14T11:00:00Z'),
    ];
    show();
    expect(screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent)).toEqual([
      'Saved newer',
      'Saved older',
    ]);
    expect(query.currentData[0].id).toBe('older');
    expect(screen.getAllByText('Latest')).toHaveLength(1);
    expect(within(screen.getAllByRole('listitem')[0]).getByText('Latest')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Revision History information' })).toBeVisible();
  });

  it('uses friendly asset labels, omits redacted signatures and avoids implying a field diff', () => {
    query.currentData = [revision('test', '2026-10-14T10:00:00Z')];
    show();
    expect(screen.getByText('School logo')).toBeVisible();
    expect(screen.getByText('Letterhead')).toBeVisible();
    expect(screen.getByText('Custom asset')).toBeVisible();
    expect(screen.getByText('Do not display')).toBeVisible();
    expect(screen.queryByText('Principal’s signature')).not.toBeInTheDocument();
    expect(screen.queryByText('Before')).not.toBeInTheDocument();
  });

  it('distinguishes an unconfigured school default from an inherited override', () => {
    const entry = revision('inherited', '2026-10-14T10:00:00Z');
    entry.choices.logo.mode = 0;
    query.currentData = [entry];
    const view = show();
    expect(screen.getByText('No image configured')).toBeVisible();
    view.unmount();
    show({ boardId: 'board' });
    expect(screen.getByText('Inherited')).toBeVisible();
    expect(screen.queryByText('No image configured')).not.toBeInTheDocument();
  });

  it('handles missing actor, reason and invalid timestamps without inventing an author', () => {
    query.currentData = [{ ...revision('unknown', 'invalid'), reason: '', creatorName: ' ' }];
    show();
    expect(screen.getByText('Unknown user')).toBeVisible();
    expect(screen.getByText('School identity updated')).toBeVisible();
    expect(screen.getByText('Time not recorded')).toBeVisible();
    expect(screen.queryByText(/Invalid time|System import/)).not.toBeInTheDocument();
  });

  it('keeps loading, error with retry, and empty history distinct', () => {
    query.isLoading = true;
    const view = show();
    expect(screen.getByRole('status', { name: 'Loading identity history' })).toBeVisible();
    expect(screen.queryByText('No saved changes yet')).not.toBeInTheDocument();
    query.isLoading = false;
    query.isError = true;
    view.rerender(
      <ThemeProvider theme={theme}>
        <IdentityHistory context={{}} onClose={close} />
      </ThemeProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(query.refetch).toHaveBeenCalledOnce();
    query.isError = false;
    view.rerender(
      <ThemeProvider theme={theme}>
        <IdentityHistory context={{}} onClose={close} />
      </ThemeProvider>
    );
    expect(screen.getByText('No saved changes yet')).toBeVisible();
  });

  it('offers an explicit Close action', () => {
    show();
    fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
    expect(close).toHaveBeenCalledOnce();
  });
});
