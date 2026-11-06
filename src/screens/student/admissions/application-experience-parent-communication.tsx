'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import {
  Box,
  Chip,
  Stack,
  Button,
  Drawer,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  useGetCommunicationTemplatesQuery,
  useAddCommunicationTemplateMutation,
  useUpdateCommunicationTemplateMutation,
} from 'src/redux/communication/notification/notificationTemplateApi';

import { useAdmissionCloseGuard } from './use-admission-close-guard';

type LifecycleEvent = { key: string; label: string; templateLabel: string; description: string };
type CommunicationTemplate = {
  id: string;
  templateName: string;
  category: string;
  subject: string;
  body: string;
  languageCode: string;
  channels: number[];
  variables: string[];
  hashtags: string[];
  approvalStatus: number;
  isActive: boolean;
  targetRole?: string | null;
};

const CATEGORY = 'Admissions lifecycle';
const PREFIX = 'Admissions · ';
// templateLabel retains the existing storage name and default subject.
export const ADMISSION_PARENT_MESSAGE_EVENTS: LifecycleEvent[] = [
  {
    key: 'inquiry-acknowledgement',
    label: 'Inquiry Acknowledgement',
    templateLabel: 'Inquiry acknowledgement',
    description: 'Sent after a family submits an inquiry.',
  },
  {
    key: 'application-received',
    label: 'Application Received',
    templateLabel: 'Application received',
    description: 'Confirms that the application was received.',
  },
  {
    key: 'missing-documents',
    label: 'Missing Documents',
    templateLabel: 'Missing documents',
    description: 'Requests documents still needed for review.',
  },
  {
    key: 'exam-scheduled',
    label: 'Exam Scheduled',
    templateLabel: 'Exam scheduled',
    description: 'Shares the entrance assessment schedule.',
  },
  {
    key: 'hall-ticket-ready',
    label: 'Hall Ticket Ready',
    templateLabel: 'Hall ticket ready',
    description: 'Notifies the family that the hall ticket is available.',
  },
  {
    key: 'result-published',
    label: 'Result Published',
    templateLabel: 'Result published',
    description: 'Tells the family that an assessment result is available.',
  },
  {
    key: 'offer-issued',
    label: 'Offer Issued',
    templateLabel: 'Offer issued',
    description: 'Shares the admission offer and next action.',
  },
  {
    key: 'payment-reminder',
    label: 'Payment Reminder',
    templateLabel: 'Payment reminder',
    description: 'Reminds the family about an admission payment.',
  },
  {
    key: 'admission-finalized',
    label: 'Admission Finalized',
    templateLabel: 'Admission finalized',
    description: 'Confirms the final admission handoff.',
  },
];

const DEFAULT_BODY: Record<string, string> = {
  'inquiry-acknowledgement':
    'Hello {{parentName}}, we received your inquiry for {{studentName}}. Our admission team will contact you shortly.',
  'application-received':
    'Hello {{parentName}}, application {{applicationNumber}} for {{studentName}} has been received.',
  'missing-documents':
    'Hello {{parentName}}, documents are still required for application {{applicationNumber}}. Please review the applicant portal.',
  'exam-scheduled':
    'Hello {{parentName}}, the entrance assessment for {{studentName}} is scheduled on {{assessmentDate}}.',
  'hall-ticket-ready':
    'Hello {{parentName}}, the hall ticket for {{studentName}} is ready in the applicant portal.',
  'result-published':
    'Hello {{parentName}}, the entrance assessment result for {{studentName}} is now available.',
  'offer-issued':
    'Hello {{parentName}}, an admission offer has been issued for {{studentName}}. Please review it before {{offerExpiryDate}}.',
  'payment-reminder':
    'Hello {{parentName}}, payment for application {{applicationNumber}} is pending. Please complete it by {{paymentDueDate}}.',
  'admission-finalized':
    'Hello {{parentName}}, admission for {{studentName}} is finalized. Welcome to our school community.',
};

type Values = { subject: string; body: string; channels: number[]; isActive: boolean };
const schema = Yup.object({
  subject: Yup.string().trim().max(256).required('Subject is required'),
  body: Yup.string().trim().required('Message is required'),
  channels: Yup.array().of(Yup.number()).min(1, 'Choose at least one channel'),
});

export function ApplicationExperienceParentCommunication() {
  const [selected, setSelected] = useState<LifecycleEvent | null>(null);
  const query = useGetCommunicationTemplatesQuery({
    category: CATEGORY,
    skipCount: 0,
    maxResultCount: 100,
  }) as {
    data?: { items?: CommunicationTemplate[] };
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => void;
  };
  const [addTemplate, addState] = useAddCommunicationTemplateMutation();
  const [updateTemplate, updateState] = useUpdateCommunicationTemplateMutation();
  const byEvent = useMemo(
    () =>
      new Map(
        (query.data?.items ?? []).map((template) => [template.templateName, template] as const)
      ),
    [query.data?.items]
  );
  const existing = selected ? byEvent.get(`${PREFIX}${selected.templateLabel}`) : undefined;
  const formik = useFormik<Values>({
    enableReinitialize: true,
    initialValues: {
      subject: existing?.subject ?? selected?.templateLabel ?? '',
      body: existing?.body ?? (selected ? DEFAULT_BODY[selected.key] : ''),
      channels: existing?.channels?.length ? existing.channels : [2, 3],
      isActive: existing?.isActive ?? true,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      if (!selected) return;
      const data = {
        templateName: `${PREFIX}${selected.templateLabel}`,
        targetRole: 'Parent',
        category: CATEGORY,
        subject: values.subject.trim(),
        body: values.body.trim(),
        languageCode: 'en',
        channels: values.channels,
        variables: Array.from(values.body.matchAll(/{{\s*([\w.]+)\s*}}/g), (match) => match[1]),
        hashtags: ['admissions', selected.key],
        approvalStatus: existing?.approvalStatus ?? 0,
        isActive: values.isActive,
      };
      try {
        if (existing) await updateTemplate({ id: existing.id, data }).unwrap();
        else await addTemplate(data).unwrap();
        shikshaMitraToast.success({ message: 'Parent message saved in Communication' });
        setSelected(null);
      } catch (error) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Unable to save this parent message.',
        });
      }
    },
  });
  const saving = addState.isLoading || updateState.isLoading;
  const guard = useAdmissionCloseGuard(formik.dirty, saving, Boolean(selected));
  const close = () => guard.requestNavigation(() => setSelected(null));

  return (
    <Box sx={{ minHeight: 0, overflow: 'auto', pb: 1 }}>
      <Stack spacing={1}>
        {ADMISSION_PARENT_MESSAGE_EVENTS.map((event) => {
          const template = byEvent.get(`${PREFIX}${event.templateLabel}`);
          return (
            <Box
              key={event.key}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                display: 'flex',
                gap: 1.5,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">{event.label}</Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={template?.isActive ? 'success' : 'default'}
                    label={
                      template ? (template.isActive ? 'Configured' : 'Paused') : 'Not Configured'
                    }
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {event.description}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                sx={{ minHeight: { xs: 44, sm: 36 } }}
                disabled={query.isLoading || query.isFetching}
                onClick={() => setSelected(event)}
              >
                {template ? 'Edit Message' : 'Configure'}
              </Button>
            </Box>
          );
        })}
      </Stack>

      {query.isLoading && (
        <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 180 }}>
          <CircularProgress size={28} aria-label="Loading Parent Messages" />
        </Box>
      )}
      {query.isError && (
        <Box sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" onClick={query.refetch}>
            Retry Loading Messages
          </Button>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={Boolean(selected)}
        onClose={close}
        PaperProps={{ sx: { width: { xs: 1, sm: 480 }, maxWidth: 1 } }}
      >
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ height: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">{selected?.label}</Typography>
                <InfoTooltipIcon
                  label="Parent message information"
                  title="Configure the template used by Communication for this admission event. Submitting saves the template."
                />
              </Stack>
            </Box>
            <IconButton
              aria-label="Close Message Editor"
              onClick={close}
              disabled={saving}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <Iconify icon="mdi:close" />
            </IconButton>
          </Box>
          <Stack spacing={2} sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <FormSectionCard
              title="Message Content"
              icon="mdi:message-text-outline"
              descriptionTooltip="Set the subject, message and delivery channels. Variables are filled when Communication sends the message."
            >
              <ShakingTextField error={Boolean(formik.touched.subject && formik.errors.subject)}>
                <TextField
                  fullWidth
                  size="small"
                  label="Subject"
                  required
                  {...formik.getFieldProps('subject')}
                  error={Boolean(formik.touched.subject && formik.errors.subject)}
                  helperText={formik.touched.subject && formik.errors.subject}
                />
              </ShakingTextField>
              <ShakingTextField error={Boolean(formik.touched.body && formik.errors.body)}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={8}
                  label="Message"
                  required
                  {...formik.getFieldProps('body')}
                  error={Boolean(formik.touched.body && formik.errors.body)}
                  helperText={
                    (formik.touched.body && formik.errors.body) ||
                    'Use variables such as {{parentName}}, {{studentName}}, and {{applicationNumber}}.'
                  }
                />
              </ShakingTextField>
              <Box>
                <Typography variant="subtitle2">Delivery Channels</Typography>
                <Stack direction="row" flexWrap="wrap">
                  {[
                    { value: 0, label: 'WhatsApp' },
                    { value: 1, label: 'SMS' },
                    { value: 2, label: 'Email' },
                    { value: 3, label: 'In-App' },
                  ].map((channel) => (
                    <FormControlLabel
                      key={channel.value}
                      label={channel.label}
                      control={
                        <Checkbox
                          checked={formik.values.channels.includes(channel.value)}
                          onChange={(_, checked) =>
                            formik.setFieldValue(
                              'channels',
                              checked
                                ? [...formik.values.channels, channel.value]
                                : formik.values.channels.filter((value) => value !== channel.value)
                            )
                          }
                        />
                      }
                    />
                  ))}
                </Stack>
                {formik.touched.channels && formik.errors.channels && (
                  <Typography variant="caption" color="error">
                    {String(formik.errors.channels)}
                  </Typography>
                )}
              </Box>
              <FormControlLabel
                label="Use This Message"
                control={
                  <Checkbox
                    checked={formik.values.isActive}
                    onChange={(_, checked) => formik.setFieldValue('isActive', checked)}
                  />
                }
              />
            </FormSectionCard>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={close}
              disabled={saving}
              startIcon={<Iconify icon="mdi:close" />}
              sx={{ minHeight: { xs: 44, sm: 36 } }}
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              type="submit"
              variant="contained"
              disabled={saving}
              loading={saving}
              startIcon={<Iconify icon="mdi:check" />}
              sx={{ minHeight: { xs: 44, sm: 36 } }}
            >
              Submit
            </LoadingButton>
          </Stack>
        </Box>
      </Drawer>
      {guard.confirmation}
    </Box>
  );
}
