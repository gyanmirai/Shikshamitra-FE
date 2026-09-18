'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionInquirySource } from 'src/redux/student/admissions/admission-inquiries-api';

import { useRouter } from 'next/navigation';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import AdmissionRuntimeField from './admission-runtime-field';
import {
  admissionInquirySourceOptions,
  admissionInquiryLanguageOptions,
} from './admission-inquiry-model';
import { useAdmissionInquiryDialog } from './use-admission-inquiry-dialog';
import { AdmissionInquiryDuplicateMatches } from './admission-inquiry-duplicate-matches';

type Props = {
  open: boolean;
  onClose: () => void;
  cycles?: AdmissionCycle[];
  cyclesLoading?: boolean;
  cyclesError?: boolean;
};

type ContentProps = Omit<Props, 'open'>;

export default function AdmissionInquiryDialog({ open, ...props }: Props) {
  if (!open) return null;
  return <AdmissionInquiryDialogContent {...props} />;
}

function AdmissionInquiryDialogContent({
  onClose,
  cycles = [],
  cyclesLoading = false,
  cyclesError = false,
}: ContentProps) {
  const router = useRouter();
  const controller = useAdmissionInquiryDialog(onClose);
  const { formik, fields } = controller;
  const fieldErrors = formik.errors.fields as Record<string, string> | undefined;
  const touchedFields = formik.touched.fields as Record<string, boolean> | undefined;
  const validationMessages = collectValidationMessages(formik.errors);
  return (
    <CustomDialog open handleClose={onClose} title="New inquiry" maxWidth="md">
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Select the admission interest, then capture the applicant and primary guardian details.
            Duplicate records are checked before the inquiry is created.
          </Typography>
          <ShakingTextField error={Boolean(formik.touched.cycleId && formik.errors.cycleId)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Admission cycle"
              name="cycleId"
              value={formik.values.cycleId}
              disabled={cyclesLoading || cyclesError}
              error={Boolean((formik.touched.cycleId && formik.errors.cycleId) || cyclesError)}
              helperText={
                cyclesError
                  ? 'Unable to load admission cycles. Close and reopen this dialog to retry.'
                  : cyclesLoading
                    ? 'Loading admission cycles…'
                    : formik.touched.cycleId && formik.errors.cycleId
              }
              onBlur={formik.handleBlur}
              onChange={(event) => {
                formik.setFieldValue('cycleId', event.target.value);
                formik.setFieldValue('offeringId', '');
              }}
            >
              {cycles
                .filter((cycle) => cycle.status !== 3)
                .map((cycle) => (
                  <MenuItem key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </MenuItem>
                ))}
            </TextField>
          </ShakingTextField>
          <ShakingTextField error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              label="Offering"
              name="offeringId"
              value={formik.values.offeringId}
              disabled={
                !formik.values.cycleId ||
                controller.offeringsLoading ||
                controller.offeringsError ||
                controller.offerings.length === 0
              }
              error={Boolean(
                controller.offeringsError || (formik.touched.offeringId && formik.errors.offeringId)
              )}
              helperText={
                controller.offeringsError
                  ? 'Offering choices could not be loaded.'
                  : controller.offeringsLoading
                    ? 'Loading open offerings…'
                    : formik.values.cycleId && controller.offerings.length === 0
                      ? 'No open offerings are available for this cycle.'
                      : formik.touched.offeringId && formik.errors.offeringId
              }
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            >
              {controller.offerings.map((offering) => (
                <MenuItem key={offering.id} value={offering.id}>
                  {offering.code}
                </MenuItem>
              ))}
            </TextField>
          </ShakingTextField>
          {controller.offeringsError && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<Iconify icon="mdi:refresh" />}
                  onClick={() => controller.retryOfferings()}
                >
                  Retry
                </Button>
              }
            >
              Unable to load offerings for the selected admission cycle.
            </Alert>
          )}
          <ShakingTextField error={Boolean(formik.touched.source && formik.errors.source)}>
            <TextField
              select
              fullWidth
              required
              size="small"
              name="source"
              label="Source"
              value={formik.values.source}
              disabled={controller.workflowLoading}
              error={Boolean(formik.touched.source && formik.errors.source)}
              helperText={formik.touched.source && formik.errors.source}
              onBlur={formik.handleBlur}
              onChange={(event) =>
                formik.setFieldValue('source', Number(event.target.value) as AdmissionInquirySource)
              }
            >
              {admissionInquirySourceOptions.map((label, index) =>
                controller.allowedSources.includes(index) ? (
                  <MenuItem key={label} value={index}>
                    {label}
                  </MenuItem>
                ) : null
              )}
            </TextField>
          </ShakingTextField>
          <ShakingTextField
            error={Boolean(formik.touched.sourceDetail && formik.errors.sourceDetail)}
          >
            <TextField
              fullWidth
              required={controller.sourceDetailRequired}
              size="small"
              name="sourceDetail"
              label="Source details"
              value={formik.values.sourceDetail}
              error={Boolean(formik.touched.sourceDetail && formik.errors.sourceDetail)}
              helperText={
                (formik.touched.sourceDetail && formik.errors.sourceDetail) ||
                'For example, campaign name, referral name, or other source information.'
              }
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              slotProps={{ htmlInput: { maxLength: 128 } }}
            />
          </ShakingTextField>
          <TextField
            select
            fullWidth
            required
            size="small"
            name="preferredLanguageCode"
            label="Family communication language"
            value={formik.values.preferredLanguageCode}
            helperText="Messages and automatic acknowledgements use this language when a matching template exists."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          >
            {admissionInquiryLanguageOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {controller.canAutoAcknowledge && (
            <FormControlLabel
              label="Send acknowledgement automatically after saving"
              control={
                <Switch
                  checked={formik.values.sendAcknowledgement}
                  onChange={(_, checked) => formik.setFieldValue('sendAcknowledgement', checked)}
                />
              }
            />
          )}
          {fields.map((field) => (
            <AdmissionRuntimeField
              key={field.code}
              field={field}
              value={formik.values.fields[field.code] ?? ''}
              disabled={controller.formLoading || field.readOnly}
              error={
                formik.submitCount > 0 || touchedFields?.[field.code]
                  ? fieldErrors?.[field.code]
                  : undefined
              }
              formValues={formik.values.fields}
              onBlur={() =>
                formik.setTouched({
                  ...formik.touched,
                  fields: { ...touchedFields, [field.code]: true },
                })
              }
              onChange={(value) =>
                formik.setValues((current) => ({
                  ...current,
                  fields: { ...current.fields, [field.code]: value },
                }))
              }
            />
          ))}
          <AdmissionInquiryDuplicateMatches
            matches={controller.matches}
            busy={controller.busy}
            onUseExisting={controller.useExistingFamily}
            onOpenExisting={(inquiryId) => {
              onClose();
              router.push(`${studentPaths.enrollment.inquiries}?inquiryId=${inquiryId}`);
            }}
            onCreateSeparate={controller.createSeparateFamily}
            overrideReason={controller.duplicateOverrideReason}
            onOverrideReasonChange={controller.setDuplicateOverrideReason}
          />
          {controller.requestError && <Alert severity="error">{controller.requestError}</Alert>}
          {formik.submitCount > 0 && validationMessages.length > 0 && (
            <Alert severity="error">
              {validationMessages.map((message) => (
                <div key={message}>{message}</div>
              ))}
            </Alert>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={controller.busy}
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          disabled={
            controller.busy ||
            controller.formLoading ||
            controller.workflowLoading ||
            controller.offeringsLoading ||
            controller.offeringsError
          }
          loading={controller.busy}
          startIcon={<Iconify icon="mdi:account-plus-outline" />}
          onClick={() => formik.handleSubmit()}
        >
          Create inquiry
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}

function collectValidationMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return [...new Set(Object.values(value).flatMap(collectValidationMessages))];
}
