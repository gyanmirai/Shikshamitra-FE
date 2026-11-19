import type { AcademicNotificationSource } from 'src/redux/academic-notifications/delivery-types';
import type { AcademicNotificationRecipient } from 'src/redux/academic-notifications/manual-types';
import type { AcademicNotificationChannel, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { FormSectionCard } from 'src/components/form-section-card';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { operationStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';
import { notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';
import { Alert, Stack, Button, Checkbox, Typography, DialogActions, FormControlLabel } from '@mui/material';

import { AcademicNotificationReviewDetails } from './review-details';
import { useReviewedNotificationSend } from './use-reviewed-notification-send';

type ChannelOption = { channel: AcademicNotificationChannel; configured: boolean };

export interface AcademicNotificationActionContext {
  identity: AcademicNotificationCacheIdentity;
  source: AcademicNotificationSource;
  options: ChannelOption[];
}

export function AcademicNotificationPreviewDialog({ context, recordLabel, audienceLabel, selectedRecipients, onClose }: {
  context: AcademicNotificationActionContext;
  recordLabel: string;
  audienceLabel: string;
  selectedRecipients: AcademicNotificationRecipient[];
  onClose: () => void;
}) {
  const router = useRouter();
  const { source, identity, options } = context;
  const sender = useReviewedNotificationSend(identity);
  const { review, operation, phase, problem, stale, uncertain } = sender;
  const busy = phase !== 'idle';
  const form = useFormik<{ channels: AcademicNotificationChannel[] }>({
    initialValues: { channels: [CommunicationChannelType.InApp] },
    validationSchema: Yup.object({
      channels: Yup.array().required().of(Yup.number().oneOf(options.filter((o) => o.configured).map((o) => o.channel)))
        .test('required-in-app', 'In-app delivery is required.', (channels) => Boolean(channels?.includes(CommunicationChannelType.InApp))),
    }),
    onSubmit: ({ channels }) => sender.loadPreview({ ...source, selectedRecipients, channels }),
  });
  useFormikErrorFocus(form);
  const { confirmation, requestNavigation } = useUnsavedNavigation(!operation && (form.dirty || uncertain), {
    guardContextChanges: true, blockNavigation: busy, onNavigationApproved: onClose, push: router.push,
    description: uncertain ? 'The last confirmation may have been accepted. Keep this review open to retry the same send.' : undefined,
  });
  const canConfirm = Boolean(review?.reviewToken && !stale && !busy);
  const history = operation && `${academicPaths.notification}?view=history&${new URLSearchParams({ operation: operation.operationId })}`;

  function changeChannel(channel: AcademicNotificationChannel, checked: boolean) {
    const { channels } = form.values;
    form.setFieldValue('channels', checked ? [...channels, channel] : channels.filter((value) => value !== channel));
    sender.resetReview();
  }

  return (
    <>
      <CustomDialog open title="Send Notification" titleInfo="Review who can receive this notification before confirming."
        maxWidth="sm" disableClose={busy} guardUnsavedChanges={false}
        handleClose={() => requestNavigation(() => {})} formProps={{ noValidate: true, onSubmit: (event) => {
          event.preventDefault();
          form.submitForm();
        } }}>
        <DialogScrollContent>
          <Stack gap={2}>
            <Stack gap={0.5} sx={{ overflowWrap: 'anywhere' }}>
              <Typography variant="subtitle2">{recordLabel}</Typography>
              <Typography variant="body2" color="text.secondary">{audienceLabel}</Typography>
            </Stack>
            {problem && <Alert severity="error">{problem}</Alert>}
            {operation ? (
              <Alert severity="info" role="status">{operationStatusLabels[operation.status] ?? 'Send request accepted'}</Alert>
            ) : (
              <>
                <FormSectionCard title="Delivery Channels" icon={GlobalIcons.sendNotification}
                  descriptionTooltip="The preview checks channel access, recipient preferences, and matching published templates.">
                  <Stack gap={0.25} role="group" aria-label="Delivery channels">
                    {options.map(({ channel, configured }) => (
                      <FormControlLabel key={channel}
                        label={`${notificationChannelLabels[channel]}${channel === CommunicationChannelType.InApp ? ' (required)' : !configured ? ' (unavailable)' : ''}`}
                        control={<Checkbox size="small" name="channels" checked={form.values.channels.includes(channel)}
                          disabled={busy || uncertain || !configured || channel === CommunicationChannelType.InApp}
                          onChange={(_, checked) => changeChannel(channel, checked)} />} />
                    ))}
                  </Stack>
                  {typeof form.errors.channels === 'string' && <Alert severity="error">{form.errors.channels}</Alert>}
                </FormSectionCard>
                {review && <AcademicNotificationReviewDetails review={review} stale={stale} />}
              </>
            )}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" color="inherit" disabled={busy} startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => requestNavigation(() => {})}>Close</Button>
          {operation && history ? (
            <Button size="small" variant="contained" component={Link} href={history} prefetch={false}
              startIcon={<Iconify icon={GlobalIcons.usage} />} onClick={onClose}>Delivery History</Button>
          ) : (
            <>
              {!uncertain && (
                <Button size="small" variant="outlined" type="submit" disabled={busy} loading={phase === 'previewing'}
                  startIcon={<Iconify icon={GlobalIcons.eye} />}>{review ? 'Refresh preview' : 'Preview recipients'}</Button>
              )}
              {review?.reviewToken && (
                <Button size="small" variant="contained" type="button" disabled={!canConfirm} loading={phase === 'sending'}
                  startIcon={<Iconify icon={GlobalIcons.sendNotification} />} onClick={() => sender.confirm()}>
                  {uncertain ? 'Retry confirmation' : review.requiresApproval ? 'Request approval' : 'Confirm send'}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
