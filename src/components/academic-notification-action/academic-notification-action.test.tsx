
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import { CommunicationChannelType, CommunicationCampaignStatus } from 'src/redux/communication/communicationTypes';

import { AcademicNotificationAction } from './index';

import type { AcademicNotificationActionContext } from './preview-dialog';

const mocked = vi.hoisted(() => ({ preview: vi.fn(), send: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocked.push }) }));
vi.mock('src/redux/academic-notifications/manual-api', () => ({
  usePreviewAcademicNotificationMutation: () => [mocked.preview],
  useSendAcademicNotificationMutation: () => [mocked.send],
}));

const context: AcademicNotificationActionContext = {
  identity: { tenantCacheKey: 'school', userCacheKey: 'staff' },
  canManageStudentContacts: false,
  source: { eventKey: 'Academic.Homework.Due', sourceType: 'Academic.Homework', sourceId: 'homework-id' },
  options: [
    { channel: CommunicationChannelType.InApp, configured: true },
    { channel: CommunicationChannelType.Email, configured: true },
  ],
};
const selected = [{ kind: 'Student', studentId: 'one-student' }];
const accepted = { operationId: 'a43c43cc-bbcf-43a5-9111-1260ba985605', status: CommunicationCampaignStatus.Queued };
const count = { channel: CommunicationChannelType.InApp, eligibleRecipientCount: 1, readyDeliveryCount: 1, exclusions: [] };
const primaryGuardianNotConfigured = 'Communication:Notification:PrimaryGuardianNotConfigured';
const savedStudent = 'd607ebaa-f037-4c35-a054-21fe06c64b0b';

function renderAction(actionContext = context, recipients = selected) {
  return renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicNotificationAction context={actionContext} recordLabel="Fraction practice" audienceLabel="Family notification for Sample Learner"
        selectedRecipients={recipients} onClose={vi.fn()} />
    </ThemeProvider>
  );
}

describe('Reviewed Academic notification', () => {
  beforeEach(() => {
    mocked.preview.mockReset().mockImplementation(() => ({ unwrap: async () => ({
      reviewToken: 'server-review', expiresAt: new Date(Date.now() + 600000).toISOString(), eligibleRecipientCount: 1,
      requiresApproval: false,
      channels: [count, {
        channel: CommunicationChannelType.Email, eligibleRecipientCount: 0, readyDeliveryCount: 0,
        exclusions: [{ code: 'EmailMissing', count: 1 }],
      }],
      samples: [], blockingIssues: [],
    }) }));
    mocked.send.mockReset().mockImplementation(() => ({ unwrap: async () => accepted }));
    mocked.push.mockClear();
  });

  it.each([true, false])('gives main-contact guidance for one student with Records edit access %s', async (allowed) => {
    const user = userEvent.setup();
    mocked.preview.mockImplementationOnce(() => ({ unwrap: async () => ({
      reviewToken: null, expiresAt: null, eligibleRecipientCount: 0, requiresApproval: false,
      channels: [{ ...count, eligibleRecipientCount: 0, readyDeliveryCount: 0, exclusions: [{ code: primaryGuardianNotConfigured, count: 1 }] }],
      samples: [], blockingIssues: [],
    }) }));
    const actionContext = { ...context, canManageStudentContacts: allowed };
    renderAction(actionContext, [{ kind: 'Student', studentId: savedStudent }]);
    expect(screen.queryByRole('button', { name: 'Open student record' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Email' }));
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    expect(await screen.findByText(/Choose a main contact in Parents & Contact/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Confirm send' })).not.toBeInTheDocument();
    if (!allowed) {
      expect(screen.queryByRole('button', { name: 'Open student record' })).not.toBeInTheDocument();
      expect(screen.getByText(/Ask someone who can manage student contacts/)).toBeVisible();
      return;
    }
    await user.click(screen.getByRole('button', { name: 'Open student record' }));
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(mocked.push).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Open student record' }));
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(mocked.push).toHaveBeenCalledWith(`/student/profile?student=${savedStudent}`);
  });

  it('shows the unresolved main contact before a Student Academic 360 preview', () => {
    const studentContext = { ...context, canManageStudentContacts: true, source: {
      ...context.source, eventKey: 'Academic.Student360.GuardianMessage',
      sourceType: 'Academic.Student360', sourceId: savedStudent,
    } };
    const choices = {
      primaryGuardianNotConfigured: true,
      audience: [{ key: 'father', label: 'Father', relationship: 'father',
        recipient: { kind: 'Student', studentId: savedStudent } }],
      templates: [{ value: 'published-template', label: 'Family academic update' }],
    };
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AcademicNotificationAction context={studentContext} recordLabel="Send academic message" audienceLabel="Selected student"
          selectedRecipients={[]} choices={choices} onClose={vi.fn()} />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'Open student record' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Father' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Preview recipients' })).toBeDisabled();
    expect(mocked.preview).not.toHaveBeenCalled();
  });

  it('keeps an aggregated missing-contact exclusion from linking to an arbitrary student', async () => {
    const user = userEvent.setup();
    mocked.preview.mockImplementationOnce(() => ({ unwrap: async () => ({
      reviewToken: null, expiresAt: null, eligibleRecipientCount: 0, requiresApproval: false,
      channels: [{ ...count, eligibleRecipientCount: 0, readyDeliveryCount: 0, exclusions: [{ code: primaryGuardianNotConfigured, count: 1 }] }],
      samples: [], blockingIssues: [],
    }) }));
    renderAction({ ...context, canManageStudentContacts: true }, [
      { kind: 'Student', studentId: savedStudent },
      { kind: 'Student', studentId: '81e98608-96f7-4562-9844-b35f4501454f' },
    ]);
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    expect(await screen.findByText(/Choose a main contact in Parents & Contact/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Open student record' })).not.toBeInTheDocument();
  });

  it('requires review for the explicit student and persists only one confirmation from repeated clicks', async () => {
    const user = userEvent.setup();
    renderAction();
    expect(screen.queryByRole('button', { name: 'Confirm send' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Email' }));
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    expect(await screen.findByText('Email missing · 1 excluded')).toBeVisible();
    expect(mocked.preview).toHaveBeenCalledWith({
      ...context.identity, input: { ...context.source, selectedRecipients: selected, channels: [3, 2] },
    });

    let resolveSend: ((value: typeof accepted) => void) | undefined;
    mocked.send.mockImplementationOnce(() => ({
      unwrap: () => new Promise<typeof accepted>((resolve) => { resolveSend = resolve; }),
    }));
    const confirm = screen.getByRole('button', { name: 'Confirm send' });
    act(() => { fireEvent.click(confirm); fireEvent.click(confirm); });
    expect(mocked.send).toHaveBeenCalledTimes(1);
    expect(mocked.send).toHaveBeenCalledWith({
      ...context.identity, input: { reviewToken: 'server-review', idempotencyKey: 'server-review' },
    });
    await act(async () => { resolveSend?.(accepted); });
    expect(await screen.findByText('Queued', { exact: true })).toBeVisible();
    expect(screen.queryByText('Delivered', { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Delivery History' })).toHaveAttribute(
      'href', `/academic/notification?view=history&operation=${accepted.operationId}`
    );
  });

  it('defaults to the primary guardian and sends only explicitly selected family relationships', async () => {
    const user = userEvent.setup();
    const studentContext = {
      ...context, source: { ...context.source, eventKey: 'Academic.Student360.GuardianMessage', sourceType: 'Academic.Student360' },
    };
    const child = { kind: 'Student', studentId: 'one-student' };
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <AcademicNotificationAction context={studentContext} recordLabel="Send academic message" audienceLabel="Selected student"
          selectedRecipients={[]} choices={{
            audience: [
              { key: 'mother', label: 'Primary guardian (mother)', defaultSelected: true, recipient: child, relationship: 'mother' },
              { key: 'father', label: 'Father', recipient: child, relationship: 'father' },
              { key: 'self', label: 'Student account', recipient: child, relationship: 'self' },
            ],
            templates: [{ value: 'published-template', label: 'Family academic update' }],
          }} onClose={vi.fn()} />
      </ThemeProvider>
    );

    expect(screen.getByRole('checkbox', { name: 'Primary guardian (mother)' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Student account' })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    expect(mocked.preview).toHaveBeenLastCalledWith({
      ...context.identity, input: { ...studentContext.source, channels: [3], selectedRecipients: [child], selectedFamilyRelationships: ['mother'] },
    });
    await screen.findByRole('button', { name: 'Confirm send' });

    await user.click(screen.getByRole('checkbox', { name: 'Primary guardian (mother)' }));
    await user.click(screen.getByRole('checkbox', { name: 'Father' }));
    await user.click(screen.getByRole('checkbox', { name: 'Student account' }));
    expect(screen.queryByRole('button', { name: 'Confirm send' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Preferred template' }));
    await user.click(screen.getByRole('option', { name: 'Family academic update' }));
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    expect(mocked.preview).toHaveBeenLastCalledWith({
      ...context.identity, input: {
        ...studentContext.source, channels: [3], selectedRecipients: [child],
        selectedFamilyRelationships: ['father', 'self'], templateId: 'published-template',
      },
    });
  });

  it('retains the previous review when the server requires a refresh and invalidates it when channels change', async () => {
    mocked.send.mockImplementationOnce(() => ({
      unwrap: async () => {
        throw Object.assign(new Error('Review changed'), {
          status: 409, data: { error: { code: 'Communication:Notification:ReviewChanged' } },
        });
      },
    }));
    const user = userEvent.setup();
    renderAction();
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm send' }));
    expect(await screen.findByText('Previous Review')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Confirm send' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Refresh preview' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Confirm send' })).toBeEnabled());
    await user.click(screen.getByRole('checkbox', { name: 'Email' }));
    expect(screen.queryByRole('button', { name: 'Confirm send' })).not.toBeInTheDocument();
  });

  it('retries a confirmation with the same key after a lost response', async () => {
    mocked.send.mockImplementationOnce(() => ({
      unwrap: async () => {
        throw Object.assign(new Error('Network response lost'), { status: 'FETCH_ERROR' });
      },
    }));
    const user = userEvent.setup();
    renderAction();
    await user.click(screen.getByRole('button', { name: 'Preview recipients' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm send' }));
    const retry = await screen.findByRole('button', { name: 'Retry confirmation' });
    expect(screen.queryByRole('button', { name: 'Refresh preview' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Email' })).toBeDisabled();
    await user.click(retry);
    expect(await screen.findByText('Queued', { exact: true })).toBeVisible();
    expect(mocked.send.mock.calls[1]).toEqual(mocked.send.mock.calls[0]);
  });
});
