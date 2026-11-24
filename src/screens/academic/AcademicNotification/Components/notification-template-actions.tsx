import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';

import { useState } from 'react';
import { RouterLink } from 'src/routes/components';
import { Alert, Stack, Button } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { academicPaths } from 'src/constants/academic-menu';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { webPushOwner, readPushDevice, isCurrentPushOwner } from 'src/hooks/notifications/web-push-device';
import {
  usePublishAcademicNotificationTemplateMutation,
  useTestSendAcademicNotificationTemplateMutation,
  useDeleteAcademicNotificationTemplateDraftMutation,
  useRestoreAcademicNotificationTemplateDefaultMutation,
} from 'src/redux/academic-notifications/template-api';

type TemplateAction = 'publish' | 'restore' | 'delete' | 'test';

const actionLabels: Record<TemplateAction, string> = {
  publish: 'Publish draft',
  restore: 'Restore default as draft',
  delete: 'Delete draft',
  test: 'Queue test send',
};

export function NotificationTemplateActions({
  identity, template, canManage, canDelete, disabled, testDisabled, busy, onBusy, onSaved, onDeleted, onError,
}: {
  identity: AcademicNotificationCacheIdentity;
  template: AcademicNotificationTemplate;
  canManage: boolean;
  canDelete: boolean;
  disabled: boolean;
  testDisabled: boolean;
  busy: boolean;
  onBusy: (value: boolean) => void;
  onSaved: (template: AcademicNotificationTemplate) => void;
  onDeleted: () => void;
  onError: (error: unknown, fallback: string) => void;
}) {
  const [selected, setSelected] = useState<TemplateAction | null>(null);
  const [testDeviceId, setTestDeviceId] = useState<string | null>(null);
  const [publish] = usePublishAcademicNotificationTemplateMutation();
  const [restore] = useRestoreAcademicNotificationTemplateDefaultMutation();
  const [remove] = useDeleteAcademicNotificationTemplateDraftMutation();
  const [testSend, { data: latestTest }] = useTestSendAcademicNotificationTemplateMutation();
  const { templateId, revisionId, concurrencyStamp, headerConcurrencyStamp } = template;
  const currentDraft = template.isCurrent && !template.isPublished && !template.isRetired;
  const isWebPush = template.channel === CommunicationChannelType.WebPush;
  const testBlocked = testDisabled || (isWebPush && !testDeviceId);
  const descriptions: Record<TemplateAction, string> = {
    publish: `Publish version ${template.revision} of ${template.templateName}. It will replace the previous published version of this template.`,
    restore: `Create a new draft of ${template.templateName} using the default wording for this variant.`,
    delete: `Delete draft version ${template.revision} of ${template.templateName}?`,
    test: isWebPush && !testDeviceId
      ? 'Enable browser notifications from the bell in this browser, then reopen this test.'
      : `Queue version ${template.revision} with sample data ${isWebPush ? 'to this browser for your signed-in account' : 'to the configured test destination for this channel'}.`,
  };

  function readTestDeviceId() {
    const owner = webPushOwner(identity.tenantCacheKey, identity.userCacheKey);
    if (!owner || !isCurrentPushOwner(owner)) return null;
    const device = readPushDevice();
    return device?.owner === owner ? device.id : null;
  }

  async function run() {
    if (!selected || busy || disabled || (selected === 'test' && testBlocked)) return;
    onBusy(true);
    const request = { ...identity, templateId, command: { revisionId, concurrencyStamp } };
    try {
      switch (selected) {
        case 'publish':
          onSaved(await publish(request).unwrap());
          shikshaMitraToast.success({ message: 'Template published.' });
          break;
        case 'restore':
          onSaved(await restore({ ...identity, templateId, command: { headerConcurrencyStamp } }).unwrap());
          shikshaMitraToast.success({ message: 'Default wording saved as a new draft.' });
          break;
        case 'delete':
          await remove(request).unwrap();
          onDeleted();
          shikshaMitraToast.success({ message: 'Template draft deleted.' });
          break;
        case 'test':
          if (isWebPush && readTestDeviceId() !== testDeviceId) {
            throw new Error('The browser subscription changed. Reopen the test to confirm this browser.');
          }
          await testSend(isWebPush && testDeviceId
            ? { ...request, command: { ...request.command, webPushSubscriptionId: testDeviceId } }
            : request).unwrap();
          break;
        default:
          break;
      }
    } catch (error) {
      onError(error, 'The template action could not be completed.');
    } finally {
      setSelected(null);
      onBusy(false);
    }
  }

  return (
    <>
      <Stack direction="row" gap={1} flexWrap="wrap">
        {canManage && currentDraft && (
          <Button size="small" variant="outlined" disabled={disabled || busy} onClick={() => setSelected('publish')}>
            Publish draft
          </Button>
        )}
        {canManage && template.isPublished && template.isCurrent && !template.isRetired && (
          <Button size="small" disabled={disabled || busy} onClick={() => setSelected('restore')}>Restore default as draft</Button>
        )}
        {canManage && !template.isRetired && (
          <Button size="small" disabled={disabled || busy || testDisabled} onClick={() => {
            setTestDeviceId(isWebPush ? readTestDeviceId() : null);
            setSelected('test');
          }}>Send test</Button>
        )}
        {canDelete && currentDraft && (
          <Button size="small" color="error" disabled={disabled || busy} onClick={() => setSelected('delete')}>Delete draft</Button>
        )}
      </Stack>
      {latestTest?.isSynthetic && (
        <Alert severity="info" role="status" action={<Button size="small" color="inherit" component={RouterLink}
          href={`${academicPaths.notification}?view=history&operation=${encodeURIComponent(latestTest.operationId)}`}>
          Delivery History
        </Button>}>
          Template test queued.
        </Alert>
      )}
      {selected && (
        <ConfirmDialog open title={actionLabels[selected]} content={descriptions[selected]}
          onClose={() => { if (!busy) setSelected(null); }}
          disableCancel={busy} disableEscapeKeyDown={busy} disableBackdropClick={busy}
          action={<Button variant="contained" color={selected === 'delete' ? 'error' : 'primary'}
            loading={busy} disabled={selected === 'test' && testBlocked} onClick={() => run()}>{actionLabels[selected]}</Button>} />
      )}
    </>
  );
}
