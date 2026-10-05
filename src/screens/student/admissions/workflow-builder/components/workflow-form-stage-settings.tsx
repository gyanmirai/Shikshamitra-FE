import type { FormikProps } from 'formik';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomAccordion from 'src/components/custom-accordian';
import { Box, Paper, Stack, Switch, Typography } from '@mui/material';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  readOnly: boolean;
};

type SettingRowProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  readOnly: boolean;
  onChange: (checked: boolean) => void;
};

function SettingRow({
  label,
  description,
  checked,
  disabled = false,
  readOnly,
  onChange,
}: SettingRowProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        <Switch
          size="small"
          slotProps={{ input: { 'aria-label': label } }}
          checked={checked}
          disabled={readOnly || disabled}
          onChange={(_, value) => onChange(value)}
        />
        <Typography variant="body2" color="text.secondary" sx={{ width: 24 }}>
          {checked ? 'On' : 'Off'}
        </Typography>
      </Stack>
    </Stack>
  );
}

export function WorkflowFormStageSettings({ formik, metadata, readOnly }: Props) {
  const advanced = useBoolean();

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Stage settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Control how this stage fits into the applicant journey.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
        <Stack spacing={2} divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
          <Typography variant="subtitle1">Stage access</Typography>
          <SettingRow
            label="Required stage"
            description="Applicants must complete this stage before moving on."
            checked={formik.values.isRequired}
            readOnly={readOnly}
            onChange={(checked) => {
              formik.setFieldValue('isRequired', checked);
              if (checked) formik.setFieldValue('allowManualSkip', false);
            }}
          />
          <SettingRow
            label="Allow authorized skip"
            description="Available only for optional stages."
            checked={formik.values.isRequired ? false : formik.values.allowManualSkip}
            disabled={formik.values.isRequired}
            readOnly={readOnly}
            onChange={(checked) => formik.setFieldValue('allowManualSkip', checked)}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}>
        <Stack spacing={2} divider={<Box sx={{ borderTop: 1, borderColor: 'divider' }} />}>
          <Box>
            <Typography variant="subtitle1">Journey position</Typography>
            <Typography variant="body2" color="text.secondary">
              Define where this stage sits in the overall journey.
            </Typography>
          </Box>
          <SettingRow
            label="Entry stage"
            description="Applicants begin here."
            checked={formik.values.isEntryStage}
            disabled={!metadata?.canBeEntryStage}
            readOnly={readOnly}
            onChange={(checked) => formik.setFieldValue('isEntryStage', checked)}
          />
          <SettingRow
            label="End of journey"
            description="Completing this stage ends the applicant journey."
            checked={formik.values.isTerminalStage}
            readOnly={readOnly}
            onChange={(checked) => formik.setFieldValue('isTerminalStage', checked)}
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
        <CustomAccordion
          title="Advanced rules"
          expanded={advanced.value}
          onChange={advanced.onToggle}
          content={
            <Typography variant="body2" color="text.secondary">
              Conditional routing and transition rules are configured on the workflow map so every
              stage handoff remains visible.
            </Typography>
          }
        />
      </Paper>

      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="mdi:information-outline" width={18} sx={{ color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          Changes affect this workflow draft until it is published.
        </Typography>
      </Stack>
    </Stack>
  );
}
