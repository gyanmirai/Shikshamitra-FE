import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Stack, Switch, Typography, FormControlLabel } from '@mui/material';
import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';
import { readAdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  readOnly: boolean;
};

export function WorkflowStageBehavior({ formik, metadata, readOnly }: Props) {
  const managedReview =
    formik.values.stageType === 6 &&
    readAdmissionReviewPolicy(formik.values.configurationJson)?.enabled === true;
  const managedInquiry =
    formik.values.stageType === 0 &&
    readAdmissionInquiryPolicy(formik.values.configurationJson)?.enabled === true;
  const managedPayment =
    formik.values.stageType === 4 &&
    readAdmissionPaymentPolicy(formik.values.configurationJson)?.enabled === true;
  const managedOffer =
    formik.values.stageType === 8 &&
    readAdmissionOfferPolicy(formik.values.configurationJson)?.enabled === true;
  const managedSeat =
    formik.values.stageType === 9 &&
    readAdmissionSeatPolicy(formik.values.configurationJson)?.enabled === true;
  const managed = managedReview || managedInquiry || managedPayment || managedOffer || managedSeat;
  const options = [
    { field: 'isRequired', label: 'Required stage', unavailable: false },
    { field: 'allowManualSkip', label: 'Allow authorized manual skip', unavailable: managed },
    {
      field: 'isEntryStage',
      label: 'Entry stage',
      unavailable: !metadata?.canBeEntryStage || managedInquiry,
    },
    {
      field: 'isTerminalStage',
      label: 'Terminal stage',
      unavailable: !metadata?.canBeTerminalStage,
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
              checked={field === 'allowManualSkip' && managed ? false : formik.values[field]}
              disabled={readOnly || unavailable}
              onChange={(_, value) => formik.setFieldValue(field, value)}
            />
          }
        />
      ))}
      {managedReview && (
        <Typography variant="body2" color="text.secondary">
          Managed Review requires a recorded decision and cannot be skipped.
        </Typography>
      )}
      {managedInquiry && (
        <Typography variant="body2" color="text.secondary">
          Managed Inquiry is the entry stage and requires a recorded outcome before it completes.
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
    </Stack>
  );
}
