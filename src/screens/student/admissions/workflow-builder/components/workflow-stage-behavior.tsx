import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import CustomAccordion from 'src/components/custom-accordian';
import { Stack, Switch, FormControlLabel } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readAdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import { readAdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  readOnly: boolean;
  advanced?: boolean;
};

export function WorkflowStageBehavior({ formik, metadata, readOnly, advanced = false }: Props) {
  const managed =
    (formik.values.stageType === 6 &&
      readAdmissionReviewPolicy(formik.values.configurationJson)?.enabled === true) ||
    (formik.values.stageType === 4 &&
      readAdmissionPaymentPolicy(formik.values.configurationJson)?.enabled === true) ||
    (formik.values.stageType === 8 &&
      readAdmissionOfferPolicy(formik.values.configurationJson)?.enabled === true) ||
    (formik.values.stageType === 9 &&
      readAdmissionSeatPolicy(formik.values.configurationJson)?.enabled === true);
  const setting = (
    field: 'isRequired' | 'allowManualSkip' | 'isEntryStage' | 'isTerminalStage',
    label: string,
    help: string,
    disabled = false
  ) => (
    <FormControlLabel
      label={label}
      control={
        <Switch
          size="small"
          slotProps={{ input: { 'aria-label': label, 'aria-description': help } }}
          checked={
            field === 'allowManualSkip' && (managed || formik.values.isRequired)
              ? false
              : formik.values[field]
          }
          disabled={readOnly || disabled}
          onChange={(_, checked) => {
            formik.setFieldValue(field, checked);
            if (field === 'isRequired' && checked) formik.setFieldValue('allowManualSkip', false);
          }}
        />
      }
      sx={{ m: 0, width: 1, justifyContent: 'space-between', flexDirection: 'row-reverse', gap: 1 }}
    />
  );

  return advanced ? (
    <CustomAccordion
      title="Advanced settings"
      content={
        <Stack spacing={1}>
          {setting(
            'isEntryStage',
            'Entry stage',
            'Applicants begin at this stage. The journey must have exactly one starting stage.',
            !metadata?.canBeEntryStage
          )}
          {setting(
            'isTerminalStage',
            'End of journey',
            'Completing this stage ends the configured journey. Admission finalization and Student Onboarding remain separate actions.'
          )}
        </Stack>
      }
    />
  ) : (
    <FormSectionCard title="Stage behavior" icon="mdi:cog-outline">
      <Stack spacing={1}>
        {setting(
          'isRequired',
          'Required stage',
          'Applicants must complete this stage. Ordinary skip is unavailable; a separately authorized emergency override requires a reason.'
        )}
        {!formik.values.isRequired &&
          setting(
            'allowManualSkip',
            'Allow authorized skip',
            managed
              ? 'This configured process must meet its completion requirements and cannot use ordinary manual skip.'
              : 'Authorized staff can skip this optional stage using the existing workflow action.',
            managed
          )}
      </Stack>
    </FormSectionCard>
  );
}
