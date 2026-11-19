
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
  source: { eventKey: 'Academic.Homework.Due', sourceType: 'Academic.Homework', sourceId: 'homework-id' },
  options: [
    { channel: CommunicationChannelType.InApp, configured: true },
    { channel: CommunicationChannelType.Email, configured: true },
  ],
};
const selected = [{ kind: 'Student', studentId: 'one-student' }];
const accepted = { operationId: 'a43c43cc-bbcf-43a5-9111-1260ba985605', status: CommunicationCampaignStatus.Queued };
const count = { channel: CommunicationChannelType.InApp, eligibleRecipientCount: 1, readyDeliveryCount: 1, exclusions: [] };

function renderAction() {
  return renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicNotificationAction context={context} recordLabel="Fraction practice" audienceLabel="Family notification for Sample Learner"
        selectedRecipients={selected} onClose={vi.fn()} />
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
