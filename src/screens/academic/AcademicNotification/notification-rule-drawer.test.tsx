import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import { NotificationRuleDrawer } from './Components/notification-rule-drawer';

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), close: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/redux/academic-notifications/api', () => ({
  useSaveAcademicNotificationRuleMutation: () => [mocks.mutate, { isLoading: false }],
  useAcademicNotificationTemplateOptionsQuery: () => ({
    currentData: { items: [], totalCount: 0 },
    isError: false,
    isFetching: false,
  }),
}));

const id = 'Academic.Homework.Published';
const row: AcademicNotificationRuleRow = {
  id,
  name: 'Homework published',
  state: 'unconfigured',
  status: 'Unconfigured',
  trigger: 'On change',
  deliveryChannels: [],
  item: { eventKey: id, requestedScope: { academicYearId: 'year' }, effectiveRule: null, isInherited: false },
  event: {
    definition: {
      eventKey: id, category: 'Homework', sourceType: 'Academic.Homework', linkBuilderKey: 'Academic.Homework',
      schemaVersion: 1, triggerType: 0, deliveryProfile: 0, recipientSelectors: ['PrimaryGuardian', 'AdditionalGuardians', 'StudentAccount'],
      supportedChannels: [3], variables: [], materialChangeFields: [], allowsQuietHoursBypass: false,
    },
    availability: { isAvailable: true, reasonCode: null },
  },
};

function renderDrawer(value = row) {
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <NotificationRuleDrawer row={value} scopeLabel="Academic year"
        identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }} onClose={mocks.close} />
    </ThemeProvider>
  );
}

describe('Configure Academic notification rule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('includes the primary guardian by default and requires a published template before enabling', async () => {
    const user = userEvent.setup();
    renderDrawer();
    expect(screen.getByText('Primary guardian is included.')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Include student account' })).not.toBeChecked();
    await user.click(screen.getByRole('switch', { name: 'Enabled' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Select a published template in the fallback language for every recipient and channel.')).toBeVisible();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('keeps a draft after a stale save and omits a stamp when overriding an inherited rule', async () => {
    const user = userEvent.setup();
    const conflict = Object.assign(new Error('Rule changed'), { status: 409 });
    mocks.mutate.mockReturnValue({ unwrap: () => Promise.reject(conflict) });
    renderDrawer({
      ...row,
      item: {
        ...row.item,
        isInherited: true,
        effectiveRule: { id: 'parent', eventKey: id, scope: {}, enabled: false, revision: 2, concurrencyStamp: 'parent-stamp', configuration: null },
      },
    });
    await user.click(screen.getByRole('checkbox', { name: 'Include student account' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('This rule changed in another session. Your edits are still here.')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Include student account' })).toBeChecked();
    expect(mocks.mutate.mock.calls[0][0].command).toMatchObject({
      eventKey: id, scope: { academicYearId: 'year' }, enabled: false, guardianMode: 0, includeStudentAccount: true,
    });
    expect(mocks.mutate.mock.calls[0][0].command.concurrencyStamp).toBeUndefined();
    expect(mocks.close).not.toHaveBeenCalled();
  });
});
