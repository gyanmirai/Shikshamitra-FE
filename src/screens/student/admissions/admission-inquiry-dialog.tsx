'use client';

import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionInquirySource } from 'src/redux/student/admissions/admission-inquiries-api';

import { LoadingButton } from 'src/components/loading-button';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Alert, Stack, Button, MenuItem, TextField, DialogActions } from '@mui/material';

import AdmissionRuntimeField from './admission-runtime-field';
import { admissionInquirySourceOptions } from './admission-inquiry-model';
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
  const controller = useAdmissionInquiryDialog(onClose);
  const { formik, fields } = controller;
  const fieldErrors = formik.errors.fields as Record<string, string> | undefined;
  const touchedFields = formik.touched.fields as Record<string, boolean> | undefined;
  const validationMessages = collectValidationMessages(formik.errors);
  return (
    <CustomDialog open handleClose={onClose} title="New inquiry" maxWidth="md">
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <TextField
            select
            required
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
          <TextField
            select
            required
            label="Offering"
            name="offeringId"
            value={formik.values.offeringId}
            disabled={!formik.values.cycleId || controller.offeringsLoading}
            error={Boolean(formik.touched.offeringId && formik.errors.offeringId)}
            helperText={formik.touched.offeringId && formik.errors.offeringId}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          >
            {controller.offerings.map((offering) => (
              <MenuItem key={offering.id} value={offering.id}>
                {offering.code}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Source"
            value={formik.values.source}
            onChange={(event) =>
              formik.setFieldValue('source', Number(event.target.value) as AdmissionInquirySource)
            }
          >
            {admissionInquirySourceOptions.map((label, index) => (
              <MenuItem key={label} value={index}>
                {label}
              </MenuItem>
            ))}
          </TextField>
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
            onCreateSeparate={controller.createSeparateFamily}
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
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button variant="outlined" disabled={controller.busy} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          disabled={controller.busy || controller.formLoading}
          loading={controller.busy}
          onClick={() => formik.handleSubmit()}
        >
          Check duplicates and create
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
