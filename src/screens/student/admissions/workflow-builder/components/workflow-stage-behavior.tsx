import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';
import {
  Stack,
  Switch,
  Accordion,
  Typography,
  AccordionDetails,
  FormControlLabel,
  AccordionSummary,
} from '@mui/material';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  readOnly: boolean;
};

export function WorkflowStageBehavior({ formik, metadata, readOnly }: Props) {
  const managedReview =
    formik.values.stageType === 6 &&
    readAdmissionReviewPolicy(formik.values.configurationJson)?.enabled === true;
  const managedPayment =
    formik.values.stageType === 4 &&
    readAdmissionPaymentPolicy(formik.values.configurationJson)?.enabled === true;
  const managedOffer =
    formik.values.stageType === 8 &&
    readAdmissionOfferPolicy(formik.values.configurationJson)?.enabled === true;
  const managedSeat =
    formik.values.stageType === 9 &&
    readAdmissionSeatPolicy(formik.values.configurationJson)?.enabled === true;
  const managed = managedReview || managedPayment || managedOffer || managedSeat;
  const options = [
    { field: 'isRequired', label: 'Required — cannot be skipped', unavailable: false },
    {
      field: 'allowManualSkip',
      label: 'Allow authorized manual skip',
      unavailable: managed || formik.values.isRequired,
    },
  ] as const;

  return (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Stage behavior
      </Typography>
      {options.map(({ field, label, unavailable }) => (
        <FormControlLabel
          key={field}
          label={label}
          control={
            <Switch
              size="small"
              checked={
                field === 'allowManualSkip' && (managed || formik.values.isRequired)
                  ? false
                  : formik.values[field]
              }
              disabled={readOnly || unavailable}
              onChange={(_, value) => {
                formik.setFieldValue(field, value);
                if (field === 'isRequired' && value) {
                  formik.setFieldValue('allowManualSkip', false);
                }
              }}
            />
          }
        />
      ))}
      {formik.values.isRequired && (
        <Typography variant="body2" color="text.secondary">
          Required stages cannot use normal skip. A separately authorized emergency override must
          include a reason.
        </Typography>
      )}
      {managedReview && (
        <Typography variant="body2" color="text.secondary">
          Managed Review requires a recorded decision and cannot be skipped.
        </Typography>
      )}
      {managedPayment && (
        <Typography variant="body2" color="text.secondary">
          Managed Payment requires settlement or an authorized waiver and cannot be skipped.
        </Typography>
      )}
      {managedOffer && (
        <Typography variant="body2" color="text.secondary">
          Managed Offer requires a configured response outcome and cannot be skipped.
        </Typography>
      )}
      {managedSeat && (
        <Typography variant="body2" color="text.secondary">
          Managed Seat requires a configured capacity outcome and cannot be skipped.
        </Typography>
      )}
      <Accordion disableGutters elevation={0} sx={{ mt: 1.5, border: 1, borderColor: 'divider' }}>
        <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
          <Typography variant="subtitle2">Journey position (advanced)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack>
            <FormControlLabel
              label="Applicants start here"
              control={
                <Switch
                  size="small"
                  checked={formik.values.isEntryStage}
                  disabled={readOnly || !metadata?.canBeEntryStage}
                  onChange={(_, value) => formik.setFieldValue('isEntryStage', value)}
                />
              }
            />
            <FormControlLabel
              label="Admission journey ends here"
              control={
                <Switch
                  size="small"
                  checked={formik.values.isTerminalStage}
                  disabled={readOnly}
                  onChange={(_, value) => formik.setFieldValue('isTerminalStage', value)}
                />
              }
            />
            <Typography variant="body2" color="text.secondary">
              Most schools need one starting stage and one or more ending stages. Change these only
              when building a branched journey.
            </Typography>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
