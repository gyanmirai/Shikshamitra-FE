import type { AcademicNotificationSource } from 'src/redux/academic-notifications/delivery-types';
import type { AcademicNotificationRecipient } from 'src/redux/academic-notifications/manual-types';
import type { AcademicNotificationChannel, AcademicNotificationCacheIdentity } from 'src/redux/academic-notifications/types';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { studentPaths } from 'src/constants/student-menu';
import { academicPaths } from 'src/constants/academic-menu';
import { FormSectionCard } from 'src/components/form-section-card';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { CommunicationChannelType } from 'src/redux/communication/communicationTypes';
import { notificationChannelLabels } from 'src/redux/academic-notifications/response-adapters';
import { Alert, Stack, Button, Checkbox, Typography, DialogActions, FormControlLabel } from '@mui/material';
import { notificationRecordId, operationStatusLabels } from 'src/redux/academic-notifications/delivery-adapters';

import { AcademicNotificationReviewDetails } from './review-details';
import { useReviewedNotificationSend } from './use-reviewed-notification-send';

type ChannelOption = { channel: AcademicNotificationChannel; configured: boolean };
const primaryGuardianNotConfigured = 'Communication:Notification:PrimaryGuardianNotConfigured';

export interface AcademicNotificationActionContext {
  identity: AcademicNotificationCacheIdentity;
  source: AcademicNotificationSource;
  options: ChannelOption[];
  canManageStudentContacts: boolean;
}

export interface AcademicNotificationActionProps {
  context: AcademicNotificationActionContext;
  recordLabel: string;
  audienceLabel: string;
  selectedRecipients: AcademicNotificationRecipient[];
  onClose: () => void;
  choices?: {
    primaryGuardianNotConfigured?: boolean;
    audience: {
      key: string;
      label: string;
      defaultSelected?: boolean;
      recipient: AcademicNotificationRecipient;
      relationship?: string;
    }[];
    templates: { value: string; label: string }[];
  };
}

type ComposeValues = { channels: AcademicNotificationChannel[]; audience: string[]; templateId: string };

export function AcademicNotificationPreviewDialog({
  context, recordLabel, audienceLabel, selectedRecipients, onClose, choices,
}: AcademicNotificationActionProps) {
  const router = useRouter();
  const { source, identity, options } = context;
  const sender = useReviewedNotificationSend(identity);
  const { review, operation, phase, problem, stale, uncertain } = sender;
  const busy = phase !== 'idle';
  const form = useFormik<ComposeValues>({
    initialValues: {
      channels: [CommunicationChannelType.InApp],
      audience: choices?.audience.filter((item) => item.defaultSelected).map((item) => item.key) ?? [],
      templateId: '',
    },
    validationSchema: Yup.object({
      channels: Yup.array().required().of(Yup.number().oneOf(options.filter((o) => o.configured).map((o) => o.channel)))
        .test('required-in-app', 'In-app delivery is required.', (channels) => Boolean(channels?.includes(CommunicationChannelType.InApp))),
      ...(choices && {
        audience: Yup.array().of(Yup.string().oneOf(choices.audience.map((item) => item.key)))
          .min(1, 'Choose at least one recipient.').required(),
        templateId: Yup.string().oneOf(['', ...choices.templates.map(({ value }) => value)]),
      }),
    }),
    onSubmit: ({ channels, audience, templateId }) => {
      if (!choices) return sender.loadPreview({ ...source, selectedRecipients, channels });
      const picked = choices.audience.filter((item) => audience.includes(item.key));
      const family = picked.flatMap((item) => item.relationship ? [item.relationship] : []);
      const recipients = picked.filter((item) => !item.relationship).map((item) => item.recipient);
      const child = picked.find((item) => item.relationship)?.recipient;
      if (child) recipients.push(child);
      return sender.loadPreview({
        ...source, selectedRecipients: recipients, channels,
        ...(family.length > 0 && { selectedFamilyRelationships: family }),
        ...(templateId && { templateId }),
      });
    },
  });
  useFormikErrorFocus(form);
  const { confirmation, requestNavigation } = useUnsavedNavigation(!operation && (form.dirty || uncertain), {
    guardContextChanges: true, blockNavigation: busy, onNavigationApproved: onClose, push: router.push,
    description: uncertain ? 'The last confirmation may have been accepted. Keep this review open to retry the same send.' : undefined,
  });
  const canConfirm = Boolean(review?.reviewToken && !stale && !busy);
  const canChoose = !busy && !uncertain;
  const history = operation && `${academicPaths.notification}?view=history&${new URLSearchParams({ operation: operation.operationId })}`;
  const missingPrimaryGuardian = choices?.primaryGuardianNotConfigured || (
    review && !stale && (
      review.blockingIssues.includes(primaryGuardianNotConfigured) ||
      review.channels.some(({ exclusions }) => exclusions.some(({ code }) => code === primaryGuardianNotConfigured))
    )
  );
  const selectedStudent = selectedRecipients.length === 1 && selectedRecipients[0].kind === 'Student'
    ? selectedRecipients[0].studentId : undefined;
  const studentId = notificationRecordId((source.sourceType === 'Academic.Student360' ? source.sourceId : selectedStudent) ?? null);
  const contactsHref = context.canManageStudentContacts && studentId
    ? `${studentPaths.records.studentList}?${new URLSearchParams({ student: studentId })}` : undefined;

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
                {missingPrimaryGuardian && (
                  <Alert severity="warning">
                    <Stack alignItems="flex-start" gap={0.5}>
                      <Typography variant="body2">
                        Choose a main contact in Parents &amp; Contact to set the primary guardian for notifications.
                      </Typography>
                      {contactsHref ? (
                        <Button type="button" size="small" disabled={!canChoose}
                          onClick={() => requestNavigation(() => router.push(contactsHref))}>
                          Open student record
                        </Button>
                      ) : !context.canManageStudentContacts && (
                        <Typography variant="body2">Ask someone who can manage student contacts to update the record.</Typography>
                      )}
                    </Stack>
                  </Alert>
                )}
                {choices && (
                  <FormSectionCard title="Recipients" icon={GlobalIcons.sendNotification}>
                    <Stack gap={0.25} role="group" aria-label="Recipients">
                      {choices.audience.length === 0 && (
                        <Alert severity="warning">This student has no eligible recipients for this notification.</Alert>
                      )}
                      {choices.audience.map((item) => (
                        <FormControlLabel key={item.key} label={item.label} control={
                          <Checkbox size="small" name="audience" value={item.key} disabled={!canChoose}
                            checked={form.values.audience.includes(item.key)} onChange={(_, checked) => {
                              const current = form.values.audience;
                              form.setFieldValue('audience', checked ? [...current, item.key] : current.filter((key) => key !== item.key));
                              sender.resetReview();
                            }} />
                        } />
                      ))}
                    </Stack>
                  </FormSectionCard>
                )}
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
                {choices && (
                  <FormSectionCard title="Template" icon={GlobalIcons.sendNotification}
                    descriptionTooltip="The preferred template is used where it matches the recipient, channel, and language. Other variants use the applicable published template.">
                    <CustomSelect name="templateId" label="Preferred template" size="small" fullWidth
                      disabled={!canChoose || choices.templates.length === 0}
                      helperText={choices.templates.length === 0 ? 'No published templates are available for this event.' : undefined}
                      options={[{ value: '', label: 'Use matching published templates' }, ...choices.templates]}
                      value={form.values.templateId} onChange={(value) => {
                        if (typeof value === 'string') form.setFieldValue('templateId', value);
                        sender.resetReview();
                      }} />
                  </FormSectionCard>
                )}
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
                <Button size="small" variant="outlined" type="submit" disabled={busy || Boolean(choices && (!form.values.audience.length || !choices.templates.length))} loading={phase === 'previewing'}
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
