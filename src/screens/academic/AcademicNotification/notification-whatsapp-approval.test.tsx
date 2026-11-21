import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type { WhatsAppApprovalContext } from 'src/redux/academic-notifications/whatsapp-approval-api';

import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { defaultSettings } from 'src/components/settings/config-settings';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { WhatsAppApprovalStatus } from 'src/redux/academic-notifications/whatsapp-approval-api';

import { NotificationWhatsAppApproval } from './Components/notification-whatsapp-approval';

const template: AcademicNotificationTemplate = {
  eventKey: 'Academic.Homework.Published', templateId: 'template', revisionId: 'revision',
  templateName: 'Homework notice', recipientKind: 'Guardian', languageCode: 'en', academicMediumId: null,
  channel: CommunicationChannelType.WhatsApp, revision: 1, subject: '', body: 'Homework notice',
  schemaVersion: 1, contentHash: 'hash', isPublished: true, isRetired: false, isCurrent: true,
  concurrencyStamp: 'revision-stamp', headerConcurrencyStamp: 'template-stamp',
  publishedAt: '2026-11-20T09:30:00Z', publishedByUserId: 'staff', isDeleted: false,
};

const approved: WhatsAppApprovalContext = {
  providerSettingId: 'provider',
  bindingMatchesProvider: true,
  binding: {
    id: 'binding', templateId: template.templateId, revisionId: template.revisionId, providerSettingId: 'provider',
    providerTemplateName: 'homework_notice', languageCode: 'en_US', providerTemplateId: '3001',
    providerStatus: WhatsAppApprovalStatus.Approved, lastSyncedAt: '2026-11-20T10:00:00Z',
  },
};

function renderApproval(context: WhatsAppApprovalContext, canManage: boolean) {
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <NotificationWhatsAppApproval template={template} context={context} isFetching={false} isError={false} reload={async () => {}}
        identity={{ tenantCacheKey: 'school', userCacheKey: 'staff' }}
        canManage={canManage} disabled={false} busy={false} onBusy={() => {}} />
    </ThemeProvider>
  );
}

describe('WhatsApp approval for a published template', () => {
  it('shows provider state without write actions when staff only have view rights', () => {
    renderApproval(approved, false);
    expect(screen.getByText('Approved by provider')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Refresh status' })).not.toBeInTheDocument();
  });

  it('explains that a changed provider account requires review and hides the old approval', () => {
    renderApproval({ ...approved, bindingMatchesProvider: false }, true);
    expect(screen.getByRole('alert')).toHaveTextContent('The WhatsApp provider setup changed.');
    expect(screen.queryByText('Approved by provider')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Refresh status' })).not.toBeInTheDocument();
  });
});
