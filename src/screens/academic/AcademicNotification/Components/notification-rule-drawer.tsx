import type { AcademicNotificationRuleRow } from 'src/redux/academic-notifications/response-adapters';
import type { AcademicNotificationCatalogue, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import { useId } from 'react';
import { useRouter } from 'next/navigation';
import { Close } from '@mui/icons-material';
import { Label } from 'src/components/label';
import SubmitButton from 'src/components/submit-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { Box, Alert, Stack, Button, Drawer, IconButton, Typography } from '@mui/material';
import { useAcademicNotificationTemplateOptionsQuery } from 'src/redux/academic-notifications/api';
import { isDailyDigest, weeklySummaryEvent, progressMilestoneEvent } from 'src/redux/academic-notifications/response-adapters';

import { NotificationRuleFields } from './notification-rule-fields';
import { NotificationRuleTiming } from './notification-rule-timing';
import { useNotificationRuleForm } from '../use-notification-rule-form';

interface Props {
  row: AcademicNotificationRuleRow;
  identity: AcademicNotificationCacheIdentity;
  scopeLabel: string;
  templatesHref: string;
  channelConfiguration: AcademicNotificationCatalogue['channels'];
  onClose: () => void;
}

export function NotificationRuleDrawer({ row, identity, scopeLabel, templatesHref, channelConfiguration, onClose }: Props) {
  const titleId = useId();
  const router = useRouter();
  const templateQuery = useAcademicNotificationTemplateOptionsQuery({
    ...identity,
    eventKey: row.id,
    academicMediumId: row.item.requestedScope.mediumId,
  }, { refetchOnMountOrArgChange: true });
  const templates = templateQuery.currentData?.items ?? [];
  const optionsAvailable = Boolean(templateQuery.currentData);
  const { form, busy } = useNotificationRuleForm({
    row, identity, options: templates, optionsAvailable,
    onSaved: onClose,
  });
  const { requestNavigation, confirmation } = useUnsavedNavigation(form.dirty, {
    guardContextChanges: true,
    blockNavigation: busy,
    onNavigationApproved: onClose,
    push: router.push,
  });
  const requestClose = () => requestNavigation(() => {});
  const schedule = row.event.definition.triggerType === 1
    ? row.id === weeklySummaryEvent ? 'weekly' : isDailyDigest(row.id) ? 'digest' : 'reminder'
    : undefined;

  return (
    <>
      <Drawer anchor="right" open onClose={requestClose} disableEscapeKeyDown={busy} slotProps={{ paper: {
        role: 'dialog', 'aria-modal': true, 'aria-labelledby': titleId,
        sx: { width: { xs: '100%', sm: 520 } },
      } }}>
        <Box component="form" noValidate onSubmit={form.handleSubmit}
          sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}
            sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
            <Stack gap={0.5}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography id={titleId} variant="h6">Configure Rule</Typography>
                <Label color={row.state === 'enabled' ? 'success' : 'default'}>{row.status}</Label>
              </Stack>
              <Typography variant="body2">{row.name} · {scopeLabel}</Typography>
            </Stack>
            <IconButton aria-label="Close rule editor" onClick={requestClose} disabled={busy}><Close /></IconButton>
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, py: 2 }}>
            <FormBusyRegion busy={busy} showOverlay={false}>
              <Stack gap={2}>
                {typeof form.status === 'string' && <Alert severity="error">{form.status}</Alert>}
                <NotificationRuleFields row={row} form={form} templates={templates}
                  channelConfiguration={channelConfiguration}
                  optionsAvailable={optionsAvailable} isLoading={!optionsAvailable && templateQuery.isFetching}
                  isError={templateQuery.isError} retry={templateQuery.refetch}
                  onOpenTemplates={() => requestNavigation(() => router.push(templatesHref, { scroll: false }))} />
                <NotificationRuleTiming form={form} schedule={schedule} configuresMilestone={row.id === progressMilestoneEvent}
                  allowsQuietHoursBypass={row.event.definition.allowsQuietHoursBypass} />
              </Stack>
            </FormBusyRegion>
          </Box>
          <Stack direction="row" gap={1} justifyContent="flex-end"
            sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={requestClose}>Cancel</Button>
            <SubmitButton disabled={!form.dirty || busy} loading={busy} />
          </Stack>
        </Box>
      </Drawer>
      {confirmation}
    </>
  );
}
