import type { RootState } from 'src/redux/store';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type { AcademicNotificationEvent, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useId, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Close } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { communicationPermissions } from 'src/constants/comminication-menu';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationEventLabel } from 'src/redux/academic-notifications/response-adapters';
import { Box, Stack, Alert, Button, Drawer, Divider, IconButton, Typography } from '@mui/material';
import { WhatsAppApprovalStatus, useAcademicWhatsAppApprovalQuery } from 'src/redux/academic-notifications/whatsapp-approval-api';

import { NotificationTemplateFields } from './notification-template-fields';
import { NotificationTemplatePreview } from './notification-template-preview';
import { NotificationTemplateActions } from './notification-template-actions';
import { NotificationWhatsAppApproval } from './notification-whatsapp-approval';
import { templateActionError, useNotificationTemplateForm } from '../use-notification-template-form';
import { templateRevisionStatus, NotificationTemplateVersions } from './notification-template-versions';

export function NotificationTemplateEditor({
  event, initialTemplate, identity, academicMediumId, scopeLabel, canManage, canDelete, onClose,
}: {
  event: AcademicNotificationEvent;
  initialTemplate?: AcademicNotificationTemplate;
  identity: AcademicNotificationCacheIdentity;
  academicMediumId: string | null;
  scopeLabel: string;
  canManage: boolean;
  canDelete: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const router = useRouter();
  const [actionBusy, setActionBusy] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const { form, template, applySavedTemplate } = useNotificationTemplateForm({
    event, initialTemplate, identity, academicMediumId,
  });
  useFormikErrorFocus(form);
  const busy = form.isSubmitting || actionBusy;
  const canEdit = canManage && !template?.isRetired;
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewProvider = hasGrantedPermission(permissions, communicationPermissions.settings.providerSettings);
  const canManageProvider = canEdit && hasGrantedPermission(permissions, communicationPermissions.settings.manageProviderSettings);
  const whatsapp = form.values.channel === CommunicationChannelType.WhatsApp;
  const publishedWhatsApp = whatsapp && template?.isPublished === true && !template.isRetired;
  const approval = useAcademicWhatsAppApprovalQuery({
    ...identity, templateId: template?.templateId ?? '', revisionId: template?.revisionId ?? '',
  }, { skip: !publishedWhatsApp || !canViewProvider, refetchOnMountOrArgChange: true });
  const binding = approval.currentData?.binding;
  const approved = !approval.isFetching && !approval.isError && approval.currentData?.bindingMatchesProvider === true &&
    binding?.providerStatus === WhatsAppApprovalStatus.Approved && Boolean(binding.providerTemplateId && binding.lastSyncedAt);
  const testDisabled = whatsapp && (!publishedWhatsApp || (canViewProvider && !approved));
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty, {
    guardContextChanges: true, blockNavigation: busy, onNavigationApproved: onClose, push: router.push,
  });
  const requestClose = () => requestNavigation(() => {});

  return (
    <>
      <Drawer anchor="right" open onClose={requestClose} disableEscapeKeyDown={busy} slotProps={{ paper: {
        role: 'dialog', 'aria-modal': true, 'aria-labelledby': titleId,
        sx: { width: { xs: '100%', sm: 608 } },
      } }}>
        <Box component="form" noValidate onSubmit={form.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}
            sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Stack gap={0.5}>
              <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
                <Typography variant="h6" id={titleId}>{initialTemplate ? 'Notification template' : 'New notification template'}</Typography>
                {template && <Label>{templateRevisionStatus(template)} · Version {template.revision}</Label>}
              </Stack>
              <Typography variant="body2">{notificationEventLabel(event)}</Typography>
            </Stack>
            <IconButton aria-label="Close template editor" onClick={requestClose} disabled={busy}><Close /></IconButton>
          </Stack>
          <Scrollbar sx={{ flex: 1, minHeight: 0, px: 2, py: 2 }}>
            <FormBusyRegion busy={busy} showOverlay={false}>
              <Stack gap={2}>
                {typeof form.status === 'string' && <Alert severity="error">{form.status}</Alert>}
                <NotificationTemplateFields event={event} form={form} locked={Boolean(template) || !canEdit}
                  disabled={busy} readOnly={!canEdit} scopeLabel={scopeLabel} />
                {whatsapp && !publishedWhatsApp && <Alert severity="info">Publish this version before linking it for WhatsApp approval.</Alert>}
                {publishedWhatsApp && !canViewProvider && (
                  <Alert severity="info">Ask a staff member with Provider Settings access to check WhatsApp approval for this version.</Alert>
                )}
                {template && publishedWhatsApp && canViewProvider && (
                  <NotificationWhatsAppApproval key={template.revisionId} identity={identity} template={template}
                    context={approval.currentData} isFetching={approval.isFetching} isError={approval.isError}
                    reload={async () => { await approval.refetch(); }}
                    canManage={canManageProvider} disabled={form.dirty} busy={busy} onBusy={setActionBusy} />
                )}
                <Divider />
                {template ? (
                  <>
                    <NotificationTemplatePreview key={template.concurrencyStamp} identity={identity}
                      templateId={template.templateId} revisionId={template.revisionId} channel={template.channel} />
                    {form.dirty && <Typography variant="caption">Save your changes to preview the updated message.</Typography>}
                    <NotificationTemplateActions identity={identity} template={template} canManage={canEdit} canDelete={canDelete}
                      disabled={form.dirty} testDisabled={testDisabled} busy={busy} onBusy={setActionBusy} onSaved={applySavedTemplate}
                      onDeleted={onClose} onError={(error, fallback) => form.setStatus(templateActionError(error, fallback))} />
                    <Button size="small" variant="outlined" aria-expanded={showVersions} sx={{ alignSelf: 'flex-start' }}
                      disabled={busy} onClick={() => setShowVersions(!showVersions)}>
                      {showVersions ? 'Hide version history' : 'Version history'}
                    </Button>
                    {showVersions && <NotificationTemplateVersions identity={identity} templateId={template.templateId} />}
                  </>
                ) : (
                  <Typography variant="caption">Save the draft to load a sample preview.</Typography>
                )}
              </Stack>
            </FormBusyRegion>
          </Scrollbar>
          <Stack direction="row" gap={1} justifyContent="flex-end"
            sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Button size="small" color="inherit" variant="outlined" disabled={busy} onClick={requestClose}>Close</Button>
            {canEdit && <SubmitButton buttonText={template?.isPublished ? 'Save new draft' : 'Save draft'}
              disabled={!form.dirty || busy} loading={form.isSubmitting} />}
          </Stack>
        </Box>
      </Drawer>
      {confirmation}
    </>
  );
}
