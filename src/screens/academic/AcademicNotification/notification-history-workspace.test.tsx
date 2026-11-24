import { useState } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';

import { NotificationHistoryWorkspace } from './notification-history-workspace';

const state = vi.hoisted(() => ({
  params: '',
  operationFailed: false,
  operationData: undefined as unknown,
  retry: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(state.params),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('src/redux/academic-notifications/delivery-api', () => ({
  useAcademicNotificationOperationQuery: () => ({
    isError: state.operationFailed, currentData: state.operationData, refetch: state.retry,
  }),
  useAcademicNotificationRecentDeliveriesQuery: () => ({
    currentData: { items: [], nextCursor: 'next-page' },
    refetch: state.retry,
  }),
}));

const catalogue = { isFetching: false, isError: false, refetch: state.retry };

function History({ catalogueFailed = false }: { catalogueFailed?: boolean }) {
  const [actions, setActions] = useState<HTMLDivElement | null>(null);
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <div ref={setActions} data-testid="workspace-actions" />
      <NotificationHistoryWorkspace
        identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }}
        canManage
        actionTarget={actions}
        catalogue={{ ...catalogue, isError: catalogueFailed }}
      />
    </ThemeProvider>
  );
}

beforeEach(() => {
  state.params = 'view=history';
  state.operationFailed = false;
  state.operationData = undefined;
});

it('keeps approvals in the workspace action row and cursor navigation in the table', () => {
  renderWithProviders(<History />);

  expect(within(screen.getByTestId('workspace-actions'))
    .getByRole('link', { name: 'Pending Approvals' })).toBeVisible();
  expect(within(screen.getByTestId('academic-notification-recent-deliveries'))
    .getByRole('link', { name: 'Older deliveries' })).toHaveAttribute(
      'href', '/academic/notification?view=history&historyCursor=next-page'
    );
});

it('keeps a return link to the approval queue when a linked operation fails to load', () => {
  state.params = 'view=history&historyMode=approvals&operation=11111111-1111-1111-1111-111111111111';
  state.operationFailed = true;
  renderWithProviders(<History />);

  expect(screen.getByRole('link', { name: 'Pending Approvals' }))
    .toHaveAttribute('href', '/academic/notification?view=history&historyMode=approvals');
  expect(screen.getByRole('alert')).toHaveTextContent('This delivery operation could not be loaded.');
});

it('offers retry when a successful response contains no delivery operation', () => {
  state.params = 'view=history&operation=11111111-1111-1111-1111-111111111111';
  state.operationData = { items: [] };
  renderWithProviders(<History />);

  expect(screen.getByRole('alert')).toHaveTextContent('This delivery operation could not be loaded.');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
});

it('reports a catalogue failure while leaving the recent delivery table available', () => {
  renderWithProviders(<History catalogueFailed />);

  expect(screen.getByRole('combobox', { name: 'Notification event' })).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('Notification event options could not be loaded.');
  expect(screen.getByRole('table', { name: 'Recent Academic notifications table' })).toBeVisible();
});
