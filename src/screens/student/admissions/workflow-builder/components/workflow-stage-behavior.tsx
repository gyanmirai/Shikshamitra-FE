import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { useId } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Switch, Typography, FormControlLabel } from '@mui/material';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  stages?: AdmissionWorkflowStage[];
  readOnly: boolean;
  isLastStage?: boolean;
  children?: ReactNode;
};

const settingRowSx = {
  m: 0,
  width: 1,
  justifyContent: 'space-between',
  flexDirection: 'row-reverse',
  gap: 1,
} as const;

export function WorkflowStageBehavior({
  formik,
  metadata,
  stages = [],
  readOnly,
  isLastStage = false,
  children,
}: Props) {
  const endingHelpId = useId();
  const isDecision = formik.values.stageType === 7;
  const isEnding = isDecision && isLastStage;
  const managed = [1, 2, 4, 5].includes(formik.values.stageType);
  const showEntryStage =
    formik.values.isEntryStage ||
    !stages.some((stage) => stage.id !== formik.values.id && stage.isEntryStage);
  const setting = (
    field: 'isRequired' | 'allowManualSkip' | 'isEntryStage',
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
      sx={settingRowSx}
    />
  );

  return (
    <FormSectionCard title="Stage Behavior" aria-label="Stage Behavior" icon="mdi:cog-outline">
      <Stack spacing={1}>
        {setting(
          'isRequired',
          'Required Stage',
          'Applicants must complete this stage. Ordinary skip is unavailable; a separately authorized emergency override requires a reason.'
        )}
        {!formik.values.isRequired &&
          setting(
            'allowManualSkip',
            'Allow Authorized Skip',
            managed
              ? 'This configured process must meet its completion requirements and cannot use ordinary manual skip.'
              : 'Authorized staff can skip this optional stage using the existing workflow action.',
            managed
          )}
        {showEntryStage &&
          setting(
            'isEntryStage',
            'Entry Stage',
            'Applicants begin at this stage. The journey must have exactly one starting stage.',
            !metadata?.canBeEntryStage
          )}
        <Stack>
          <FormControlLabel
            label="End Of Journey"
            control={
              <Switch
                size="small"
                checked={isEnding}
                disabled
                slotProps={{ input: { 'aria-describedby': endingHelpId } }}
              />
            }
            sx={settingRowSx}
          />
          <Typography id={endingHelpId} variant="caption" color="text.secondary">
            {isDecision
              ? 'Only the last Admission decision ends the journey.'
              : 'Available only for Admission decision stages.'}
          </Typography>
        </Stack>
        {children}
      </Stack>
    </FormSectionCard>
  );
}
