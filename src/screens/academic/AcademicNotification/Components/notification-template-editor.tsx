import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type { AcademicNotificationEvent, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Close } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationEventLabel } from 'src/redux/academic-notifications/response-adapters';
import { Box, Stack, Alert, Button, Drawer, Divider, IconButton, Typography } from '@mui/material';

import { NotificationTemplateFields } from './notification-template-fields';
import { NotificationTemplatePreview } from './notification-template-preview';
import { NotificationTemplateActions } from './notification-template-actions';
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
                {form.values.channel === CommunicationChannelType.WhatsApp && (
                  <Alert severity="info">WhatsApp delivery requires provider approval for this version and language.</Alert>
                )}
                <NotificationTemplateFields event={event} form={form} locked={Boolean(template) || !canEdit}
                  disabled={busy} readOnly={!canEdit} scopeLabel={scopeLabel} />
                <Divider />
                {template ? (
                  <>
                    <NotificationTemplatePreview key={template.concurrencyStamp} identity={identity}
                      templateId={template.templateId} revisionId={template.revisionId} channel={template.channel} />
                    {form.dirty && <Typography variant="caption">Save your changes to preview the updated message.</Typography>}
                    <NotificationTemplateActions identity={identity} template={template} canManage={canEdit} canDelete={canDelete}
                      disabled={form.dirty} busy={busy} onBusy={setActionBusy} onSaved={applySavedTemplate}
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
