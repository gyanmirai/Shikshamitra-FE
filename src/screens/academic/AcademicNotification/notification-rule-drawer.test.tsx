import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';

import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
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
        channelConfiguration={[{ channel: 3, isConfigured: true }]}
        templatesHref="/academic/notification?view=templates&templateEvent=Academic.Homework.Published&templateScope=school"
        identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }} onClose={mocks.close} />
    </ThemeProvider>
  );
}

describe('Configure Academic notification rule', () => {
  beforeEach(() => vi.clearAllMocks());

  it('explains why an unavailable event cannot be enabled', () => {
    const detail = 'A withdrawal notice needs the list of families who could see the published homework.';
    renderDrawer({
      ...row,
      event: {
        ...row.event,
        availability: { isAvailable: false, reasonCode: 'Communication:Notification:SourceUnavailable' },
        availabilityDetail: detail,
      },
    });
    expect(screen.getByRole('alert')).toHaveTextContent(detail);
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeDisabled();
  });

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

  it.each(['Academic.Homework.Submitted', 'Academic.Progress.BehindSchedule'])(
    'edits the daily digest cutoff for %s without a school-days offset',
    async (digestId) => {
      const user = userEvent.setup();
      mocks.mutate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
      renderDrawer({
        ...row,
        id: digestId,
        item: { ...row.item, eventKey: digestId },
        event: {
          ...row.event,
          definition: {
            ...row.event.definition, eventKey: digestId, triggerType: 1, deliveryProfile: 3,
            recipientSelectors: ['AssignedTeacher'],
          },
        },
      });

      await user.click(screen.getByRole('button', { name: 'Expand Timing and Language' }));
      const time = screen.getByLabelText(/Daily digest time/);
      expect(screen.queryByLabelText(/School days before/)).toBeNull();
      fireEvent.change(time, { target: { value: '14:35' } });
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      expect(mocks.mutate.mock.calls[0][0].command).toMatchObject({
        staffAudienceSelectors: ['AssignedTeacher'], timing: { reminderLocalTime: '14:35' },
      });
    }
  );

  it('saves the weekly summary day and school-local time', async () => {
    const user = userEvent.setup();
    const eventKey = 'Academic.Summary.Weekly';
    mocks.mutate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    renderDrawer({
      ...row,
      id: eventKey,
      item: { ...row.item, eventKey },
      event: {
        ...row.event,
        definition: {
          ...row.event.definition, eventKey, triggerType: 1, deliveryProfile: 3,
          recipientSelectors: ['PrimaryGuardian', 'ClassTeacher'],
        },
      },
    });
    await user.click(screen.getByRole('button', { name: 'Expand Timing and Language' }));
    const day = screen.getByRole('combobox', { name: /Day of the week/ });
    expect(day).toHaveTextContent('Friday');
    expect(screen.queryByLabelText(/School days before/)).not.toBeInTheDocument();
    await user.click(day);
    await user.click(screen.getByRole('option', { name: 'Wednesday' }));
    fireEvent.change(screen.getByLabelText(/Weekly summary time/), { target: { value: '16:10' } });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mocks.mutate.mock.calls[0][0].command.timing).toMatchObject({
      weeklySummaryDay: 3, reminderLocalTime: '16:10',
    });
  });

  it('saves the explicit percentage for a progress milestone digest', async () => {
    const user = userEvent.setup();
    const eventKey = 'Academic.Progress.MilestoneReached';
    mocks.mutate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    renderDrawer({
      ...row,
      id: eventKey,
      item: { ...row.item, eventKey },
      event: {
        ...row.event,
        definition: {
          ...row.event.definition, eventKey, triggerType: 1, deliveryProfile: 3,
          recipientSelectors: ['AssignedTeacher', 'ClassTeacher'],
        },
      },
    });
    await user.click(screen.getByRole('button', { name: 'Expand Timing and Language' }));
    const percent = screen.getByRole('spinbutton', { name: /Milestone percentage/ });
    expect(screen.getByLabelText(/Daily digest time/)).toBeVisible();
    expect(percent).toHaveValue(null);
    fireEvent.change(percent, { target: { value: '0' } });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Enter a whole percentage from 1 to 100.')).toBeVisible();
    expect(mocks.mutate).not.toHaveBeenCalled();
    fireEvent.change(percent, { target: { value: '65' } });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mocks.mutate.mock.calls[0][0].command.timing).toMatchObject({ progressMilestonePercentage: 65 });
  });

  it('adds a delayed reviewer to the assigned substitute reminder', async () => {
    const user = userEvent.setup();
    const reminderId = 'Academic.Substitution.AcknowledgementDue';
    mocks.mutate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
    renderDrawer({
      ...row,
      id: reminderId,
      item: { ...row.item, eventKey: reminderId },
      event: {
        ...row.event,
        definition: {
          ...row.event.definition, eventKey: reminderId, triggerType: 1,
          recipientSelectors: ['SubstituteTeacher', 'ConfiguredReviewer'],
        },
      },
    });
    expect(screen.getByText('The assigned substitute receives the reminder.')).toBeVisible();
    expect(screen.queryByLabelText(/Escalate after/)).toBeNull();
    await user.click(screen.getByRole('checkbox', { name: 'Notify the configured reviewer' }));
    const delay = screen.getByLabelText(/Escalate after/);
    expect(delay).toHaveValue(30);
    fireEvent.change(delay, { target: { value: '0' } });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Enter a delay from 1 to 10080 minutes.')).toBeVisible();
    expect(mocks.mutate).not.toHaveBeenCalled();
    fireEvent.change(delay, { target: { value: '45' } });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mocks.mutate.mock.calls[0][0].command).toMatchObject({
      staffAudienceSelectors: ['SubstituteTeacher', 'ConfiguredReviewer'],
      timing: { reviewerEscalationMinutes: 45 },
    });
  });
});
