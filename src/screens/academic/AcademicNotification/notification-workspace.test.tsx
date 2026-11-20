import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import Workspace from './index';

const state = vi.hoisted(() => ({
  params: '',
  push: vi.fn(),
  retry: vi.fn(),
  reads: { isFetching: false, error: undefined as unknown, currentData: null as unknown },
  permissions: { canView: true, canManage: false },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/academic/notification',
  useSearchParams: () => new URLSearchParams(state.params),
  useRouter: () => ({ push: state.push }),
}));
vi.mock('./use-notification-workspace-scope', () => ({
  useNotificationWorkspaceScope: () => ({
    ...state.permissions,
    permissionsInitialized: true,
    identity: { userCacheKey: 'user', tenantCacheKey: 'school' },
    contextLabel: '2026 / CBSE / English',
    options: [{ value: 'medium', label: 'English medium', scope: { mediumId: 'medium' } }],
    isLoading: false,
  }),
}));

const subject = {
  definition: { eventKey: 'Academic.Subject.Published', category: 'Subject', triggerType: 0, supportedChannels: [3] },
  availability: { isAvailable: false, reasonCode: 'Communication:Notification:SourceUnavailable' },
  availabilityDetail: 'This notice requires a published subject workflow.',
};
const homework = {
  definition: { eventKey: 'Academic.Homework.Published', category: 'Homework', triggerType: 0, supportedChannels: [3] },
  availability: { isAvailable: true, reasonCode: null },
};
const rules = {
  totalCount: 2,
  items: [
    { eventKey: subject.definition.eventKey, requestedScope: {}, effectiveRule: { enabled: false }, isInherited: true },
    { eventKey: homework.definition.eventKey, requestedScope: {}, effectiveRule: null, isInherited: false },
  ],
};
vi.mock('src/redux/academic-notifications/api', () => ({
  useAcademicNotificationCatalogueQuery: () => ({
    currentData: { events: [subject, homework], channels: [{ channel: 3, isConfigured: true }] },
    refetch: state.retry,
  }),
  useAcademicNotificationRulesQuery: () => ({ ...state.reads, refetch: state.retry }),
}));

function render() {
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Workspace />
    </ThemeProvider>
  );
}

describe('Academic notification rules workspace', () => {
  beforeEach(() => {
    state.params = '';
    state.push.mockClear();
    state.retry.mockClear();
    state.reads = { currentData: rules, error: undefined, isFetching: false };
    state.permissions = { canView: true, canManage: false };
  });

  it('uses the catalogue for legacy curriculum links and shows persisted disabled inheritance', () => {
    state.params = 'tab=curriculumManagement';
    render();
    const table = screen.getByRole('table', { name: 'Academic notification rules table' });
    expect(table).toBeVisible();
    expect(screen.getByText('Subject published')).toBeVisible();
    expect(screen.queryByText('Homework published')).not.toBeInTheDocument();
    expect(screen.getByText('Disabled · inherited')).toBeVisible();
    expect(screen.getByText('Event integration unavailable')).toBeVisible();
    expect(screen.getByText(subject.availabilityDetail)).toBeVisible();
    expect(within(table).queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Configure Subject published' })).not.toBeInTheDocument();
  });

  it('falls back to all rules for invalid filters', () => {
    state.params = 'category=unknown&status=unknown&view=unknown';
    render();
    expect(screen.getByText('Subject published')).toBeVisible();
    expect(screen.getByText('Homework published')).toBeVisible();
  });

  it('distinguishes filtered empty results from an empty rule list', () => {
    state.params = 'category=calendar';
    render();
    expect(screen.getByText('No notification rules match these filters.')).toBeVisible();
  });

  it('shows an empty rule list for an authorized scope with no rules', () => {
    state.reads.currentData = { totalCount: 0, items: [] };
    render();
    expect(screen.getByText('No notification rules are available for this scope.')).toBeVisible();
  });

  it('keeps the table visible while the rules load without showing an empty list', () => {
    state.reads = { isFetching: true, currentData: undefined, error: undefined };
    render();
    expect(screen.getByRole('table', { name: 'Academic notification rules table' })).toBeVisible();
    expect(screen.queryByText('No notification rules are available for this scope.')).not.toBeInTheDocument();
  });

  it('offers a retry when the rule read fails', () => {
    state.reads = { isFetching: false, currentData: undefined, error: { status: 503 } };
    render();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
    expect(screen.queryByText('No notification rules are available for this scope.')).not.toBeInTheDocument();
  });

  it('does not expose cached rules after view permission is removed', () => {
    state.permissions.canView = false;
    render();
    expect(screen.queryByText('Subject published')).not.toBeInTheDocument();
    expect(screen.getByText('You do not have access to Academic notification rules.')).toBeVisible();
  });
});
