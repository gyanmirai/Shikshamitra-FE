import type { AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';
import type { AcademicNotificationTemplate } from 'src/redux/academic-notifications/template-types';
import type { WhatsAppApprovalContext } from 'src/redux/academic-notifications/whatsapp-approval-api';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Alert, Button, Skeleton, TextField, Typography } from '@mui/material';
import {
  WhatsAppApprovalStatus,
  useLinkAcademicWhatsAppTemplateMutation,
  useUpdateAcademicWhatsAppApprovalMutation,
} from 'src/redux/academic-notifications/whatsapp-approval-api';

import { templateActionError } from '../use-notification-template-form';

const statusText: Record<WhatsAppApprovalStatus, string> = {
  [WhatsAppApprovalStatus.Draft]: 'Linked · draft',
  [WhatsAppApprovalStatus.PendingApproval]: 'Awaiting provider approval',
  [WhatsAppApprovalStatus.Approved]: 'Approved by provider',
  [WhatsAppApprovalStatus.Rejected]: 'Rejected by provider',
  [WhatsAppApprovalStatus.Paused]: 'Paused by provider',
  [WhatsAppApprovalStatus.Disabled]: 'Disabled by provider',
};

export function NotificationWhatsAppApproval({
  identity, template, context, isFetching, isError, reload, canManage, disabled, busy, onBusy,
}: {
  identity: AcademicNotificationCacheIdentity;
  template: AcademicNotificationTemplate;
  context?: WhatsAppApprovalContext;
  isFetching: boolean;
  isError: boolean;
  reload: () => Promise<void>;
  canManage: boolean;
  disabled: boolean;
  busy: boolean;
  onBusy: (busy: boolean) => void;
}) {
  const [selected, setSelected] = useState<'link' | 'submit' | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [link] = useLinkAcademicWhatsAppTemplateMutation();
  const [update] = useUpdateAcademicWhatsAppApprovalMutation();
  const binding = context?.binding;
  const locked = disabled || busy || isFetching || !canManage;
  const validName = /^[a-z0-9_]{1,160}$/.test(name);

  function select(action: 'link' | 'submit' | null) {
    setError('');
    setSelected(action);
  }

  async function run(action: 'link' | 'submit' | 'sync') {
    if (locked || isError || !context?.providerSettingId) return;
    if (action === 'link' ? !validName || Boolean(binding) : !binding || !context.bindingMatchesProvider) return;
    setError('');
    onBusy(true);
    try {
      if (action === 'link') {
        await link({ ...identity, command: {
          templateId: template.templateId, revisionId: template.revisionId,
          providerSettingId: context.providerSettingId, providerTemplateName: name,
        } }).unwrap();
      } else {
        await update({ ...identity, action, bindingId: binding!.id }).unwrap();
      }
      select(null);
      await reload();
    } catch (failure) {
      setError(templateActionError(failure, 'WhatsApp approval could not be updated. Try again.'));
    } finally {
      onBusy(false);
    }
  }

  const confirmLabel = selected === 'link' ? 'Link template' : 'Submit for approval';
  const showBinding = Boolean(context?.providerSettingId) && !isError;
  return (
    <FormSectionCard title="WhatsApp Approval">
      {isError && <Alert severity="error" action={<Button size="small" onClick={reload}>Retry</Button>}>
        WhatsApp approval status could not be read.
      </Alert>}
      {!isError && isFetching && !context && <Skeleton variant="text" aria-label="Loading WhatsApp approval" />}
      {!isError && context && !context.providerSettingId && (
        <Alert severity="info">Set up WhatsApp in Communication Provider Settings.</Alert>
      )}
      {showBinding && !binding && (
        <Stack gap={1} alignItems="flex-start">
          <Typography variant="body2">This version needs a WhatsApp template link.</Typography>
          {canManage && <Button variant="outlined" size="small" disabled={locked} onClick={() => select('link')}>
            Link WhatsApp template
          </Button>}
        </Stack>
      )}
      {showBinding && binding && !context?.bindingMatchesProvider && (
        <Alert severity="warning">The WhatsApp provider setup changed. Ask a provider administrator to review this link.</Alert>
      )}
      {showBinding && binding && context?.bindingMatchesProvider && (
        <Stack gap={1} alignItems="flex-start">
          <Label color={binding.providerStatus === WhatsAppApprovalStatus.Approved ? 'success' : 'default'}>
            {statusText[binding.providerStatus] ?? 'Approval status unavailable'}
          </Label>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {binding.providerTemplateName} · {binding.languageCode}
          </Typography>
          {canManage && <Stack direction="row" gap={1} flexWrap="wrap">
            {binding.providerStatus === WhatsAppApprovalStatus.Draft && <Button size="small" variant="outlined"
              disabled={locked} onClick={() => select('submit')}>Submit for approval</Button>}
            <Button size="small" variant="outlined" disabled={locked} onClick={() => run('sync')}>Refresh status</Button>
          </Stack>}
        </Stack>
      )}
      {error && !selected && <Alert severity="error">{error}</Alert>}
      {selected && (
        <ConfirmDialog open title={selected === 'link' ? 'Link WhatsApp Template' : 'Submit for WhatsApp Approval'}
          onClose={() => { if (!busy) select(null); }} disableCancel={busy} disableEscapeKeyDown={busy} disableBackdropClick={busy}
          content={<Stack gap={1.5}>
            {selected === 'link' ? <TextField fullWidth size="small" label="Meta template name" required
              value={name} disabled={busy} onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }}
              error={Boolean(name && !validName)} helperText="Use lowercase letters, numbers, and underscores."
              slotProps={{ htmlInput: { maxLength: 160 } }} />
              : <Typography>Submit version {template.revision} to Meta for WhatsApp approval.</Typography>}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>}
          action={<Button variant="contained" loading={busy} disabled={locked || (selected === 'link' && !validName)}
            onClick={() => run(selected)}>{confirmLabel}</Button>} />
      )}
    </FormSectionCard>
  );
}
