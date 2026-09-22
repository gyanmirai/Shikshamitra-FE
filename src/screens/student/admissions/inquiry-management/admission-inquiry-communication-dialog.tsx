'use client';

import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useCreateAdmissionInquiryCommunicationMutation } from 'src/redux/student/admissions/admission-inquiries-api';
import {
  Alert,
  Stack,
  Button,
  Switch,
  Checkbox,
  MenuItem,
  TextField,
  FormGroup,
  Typography,
  DialogActions,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import {
  getInquiryCommunicationTemplate,
  inquiryCommunicationTemplateOptions,
  type InquiryCommunicationTemplateId,
} from './inquiry-communication-templates';

type Props = {
  inquiry: AdmissionInquiry | null;
  canSend: boolean;
  onClose: () => void;
};

type FormValues = {
  templateId: InquiryCommunicationTemplateId | '';
  title: string;
  subject: string;
  body: string;
  channels: number[];
  importanceLevel: number;
  requiresAcknowledgement: boolean;
  publishImmediately: boolean;
};

const CHANNELS = [
  { value: 0, label: 'WhatsApp' },
  { value: 1, label: 'SMS' },
  { value: 2, label: 'Email' },
] as const;

export const admissionInquiryCommunicationSchema = Yup.object({
  title: Yup.string().trim().required('Enter a communication title').max(256),
  subject: Yup.string()
    .trim()
    .max(256)
    .test(
      'email-subject',
      'Enter a subject when Email is selected',
      function validateSubject(value) {
        const channels = (this.parent.channels ?? []) as number[];
        return !channels.includes(2) || Boolean(value?.trim());
      }
    ),
  body: Yup.string().trim().required('Enter a message').max(4000),
  channels: Yup.array()
    .of(Yup.number().oneOf([0, 1, 2]).required())
    .min(1, 'Choose at least one delivery channel'),
  importanceLevel: Yup.number().oneOf([0, 1, 2]).required(),
  requiresAcknowledgement: Yup.boolean().required(),
  publishImmediately: Yup.boolean().required(),
});

export function AdmissionInquiryCommunicationDialog({ inquiry, canSend, onClose }: Props) {
  const [createCommunication, createState] = useCreateAdmissionInquiryCommunicationMutation();
  const formik = useFormik<FormValues>({
    initialValues: {
      templateId: '',
      title: inquiry ? `Admission follow-up – ${inquiry.applicantName}` : '',
      subject: '',
      body: '',
      channels: [1],
      importanceLevel: 0,
      requiresAcknowledgement: false,
      publishImmediately: canSend,
    },
    enableReinitialize: true,
    validationSchema: admissionInquiryCommunicationSchema,
    onSubmit: async (values) => {
      if (!inquiry) return;
      try {
        const result = await createCommunication({
          id: inquiry.id,
          body: {
            title: values.title.trim(),
            subject: values.subject.trim() || null,
            body: values.body.trim(),
            channels: values.channels as (0 | 1 | 2)[],
            importanceLevel: values.importanceLevel as 0 | 1 | 2,
            requiresAcknowledgement: values.requiresAcknowledgement,
            publishImmediately: canSend && values.publishImmediately,
          },
        }).unwrap();
        if (result.deliveryErrorCode) {
          shikshaMitraToast.warning({ message: result.message });
        } else {
          shikshaMitraToast.success({ message: result.message });
        }
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        shikshaMitraToast.error({
          message:
            problem.detail ||
            'Unable to create this communication. Check the recipient and channel settings.',
        });
      }
    },
  });

  if (!inquiry) return null;

  const channelsTouched = Boolean(formik.touched.channels);
  const channelsError = channelsTouched
    ? (formik.errors.channels as string | undefined)
    : undefined;

  const toggleChannel = (channel: number) => {
    const selected = formik.values.channels.includes(channel);
    formik.setFieldValue(
      'channels',
      selected
        ? formik.values.channels.filter((item) => item !== channel)
        : [...formik.values.channels, channel]
    );
    formik.setFieldTouched('channels', true, false);
  };

  return (
    <CustomDialog
      open
      maxWidth="sm"
      title="Compose inquiry communication"
      handleClose={onClose}
      disableClose={createState.isLoading}
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()} sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Alert severity="info" variant="outlined">
            Sending uses the Communication module&apos;s approved providers, consent rules, approval
            policy, delivery tracking, and retry controls.
          </Alert>

          <Stack spacing={0.25}>
            <Typography variant="subtitle2">Recipient</Typography>
            <Typography variant="body2" color="text.secondary">
              {inquiry.applicantName} · {inquiry.normalizedPhone}
              {inquiry.email ? ` · ${inquiry.email}` : ''}
            </Typography>
          </Stack>

          <TextField
            select
            fullWidth
            size="small"
            name="templateId"
            label="Start from a template"
            value={formik.values.templateId}
            helperText={`Uses ${inquiry.preferredLanguageCode || 'en'} when available; otherwise English.`}
            onChange={(event) => {
              const templateId = event.target.value as InquiryCommunicationTemplateId;
              const template = getInquiryCommunicationTemplate(templateId, inquiry);
              formik.setValues((current) => ({
                ...current,
                templateId,
                title: template.title,
                subject: template.subject,
                body: template.body,
              }));
            }}
          >
            {inquiryCommunicationTemplateOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <ShakingTextField error={Boolean(formik.touched.title && formik.errors.title)}>
            <TextField
              fullWidth
              required
              size="small"
              name="title"
              label="Communication title"
              value={formik.values.title}
              error={Boolean(formik.touched.title && formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </ShakingTextField>

          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Delivery channels</Typography>
            <FormGroup row>
              {CHANNELS.map((channel) => {
                const disabled = channel.value === 2 && !inquiry.email;
                return (
                  <FormControlLabel
                    key={channel.value}
                    label={channel.label}
                    disabled={disabled}
                    control={
                      <Checkbox
                        size="small"
                        checked={formik.values.channels.includes(channel.value)}
                        onChange={() => toggleChannel(channel.value)}
                      />
                    }
                  />
                );
              })}
            </FormGroup>
            {channelsError ? (
              <FormHelperText error>{channelsError}</FormHelperText>
            ) : !inquiry.email ? (
              <FormHelperText>
                Email is unavailable because this inquiry has no email address.
              </FormHelperText>
            ) : null}
          </Stack>

          {formik.values.channels.includes(2) && (
            <ShakingTextField error={Boolean(formik.touched.subject && formik.errors.subject)}>
              <TextField
                fullWidth
                required
                size="small"
                name="subject"
                label="Email subject"
                value={formik.values.subject}
                error={Boolean(formik.touched.subject && formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
            </ShakingTextField>
          )}

          <ShakingTextField error={Boolean(formik.touched.body && formik.errors.body)}>
            <TextField
              fullWidth
              required
              multiline
              minRows={5}
              name="body"
              label="Message"
              value={formik.values.body}
              error={Boolean(formik.touched.body && formik.errors.body)}
              helperText={
                (formik.touched.body && formik.errors.body) || `${formik.values.body.length}/4000`
              }
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </ShakingTextField>

          <TextField
            select
            fullWidth
            size="small"
            name="importanceLevel"
            label="Importance"
            value={formik.values.importanceLevel}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          >
            <MenuItem value={0}>Normal</MenuItem>
            <MenuItem value={1}>Urgent</MenuItem>
            <MenuItem value={2}>Critical</MenuItem>
          </TextField>

          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={formik.values.requiresAcknowledgement}
                  onChange={(_, checked) => {
                    formik.setFieldValue('requiresAcknowledgement', checked);
                  }}
                />
              }
              label="Require acknowledgement"
            />
            {canSend ? (
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={formik.values.publishImmediately}
                    onChange={(_, checked) => {
                      formik.setFieldValue('publishImmediately', checked);
                    }}
                  />
                }
                label="Send now"
              />
            ) : (
              <Typography variant="caption" color="text.secondary">
                This will be saved as a draft because you do not have Communication Send permission.
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={createState.isLoading}
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          loading={createState.isLoading}
          startIcon={
            <Iconify
              icon={
                canSend && formik.values.publishImmediately
                  ? 'mdi:send-outline'
                  : 'mdi:content-save-outline'
              }
            />
          }
          onClick={() => formik.handleSubmit()}
        >
          {canSend && formik.values.publishImmediately ? 'Send now' : 'Create draft'}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
