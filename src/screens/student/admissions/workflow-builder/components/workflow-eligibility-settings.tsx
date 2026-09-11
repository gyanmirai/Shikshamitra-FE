import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

import { getEligibilityConfigurationError } from 'src/redux/student/admissions/admission-eligibility-validation';
import {
  Alert,
  Paper,
  Radio,
  Stack,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  DEFAULT_ELIGIBILITY_POLICY,
  readAdmissionEligibilityPolicy,
  writeAdmissionEligibilityPolicy,
} from 'src/redux/student/admissions/admission-eligibility-policy';

import { EligibilityCriteriaList } from './eligibility-criteria-list';
import { EligibilityExceptionSettings } from './eligibility-exception-settings';

export function WorkflowEligibilitySettings({
  formik,
  forms,
  stages,
  readOnly,
  available,
}: {
  formik: FormikProps<AdmissionWorkflowStage>;
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  available: boolean;
}) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionEligibilityPolicy(json);
  const error = getEligibilityConfigurationError(json);
  const unreadable = Boolean(error && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionEligibilityPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionEligibilityPolicy(json, {
        ...(policy ?? DEFAULT_ELIGIBILITY_POLICY),
        ...change,
      })
    );
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Eligibility setup</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose what the school checks and how staff handle exceptions.
          </Typography>
        </Stack>
        {!available && (
          <Alert severity="info">
            Eligibility evaluation is not available in this environment yet.
          </Alert>
        )}
        {unreadable && <Alert severity="error">{error}</Alert>}
        <RadioGroup
          aria-label="Eligibility process"
          value={policy?.enabled ? 'managed' : 'basic'}
          onChange={(_, value) => update({ enabled: value === 'managed' })}
        >
          <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
            <FormControlLabel
              value="basic"
              disabled={disabled}
              control={<Radio size="small" />}
              label="Basic completion (existing process)"
            />
            <Typography variant="body2" color="text.secondary">
              Keep the current workflow completion controls.
            </Typography>
          </Paper>
          <Paper
            variant="outlined"
            sx={{ p: 1, borderColor: policy?.enabled ? 'primary.main' : 'divider' }}
          >
            <FormControlLabel
              value="managed"
              disabled={disabled}
              control={<Radio size="small" />}
              label="Check eligibility rules"
            />
            <Typography variant="body2" color="text.secondary">
              Evaluate saved information, explain each result, and record approved exceptions.
            </Typography>
          </Paper>
        </RadioGroup>
        {policy?.enabled && (
          <>
            <EligibilityCriteriaList
              criteria={policy.criteria}
              onChange={(criteria) => update({ criteria })}
              forms={forms}
              stages={stages}
              stageOrder={formik.values.displayOrder}
              readOnly={disabled}
            />
            <EligibilityExceptionSettings policy={policy} disabled={disabled} onChange={update} />
            <Alert severity="info">
              Save information → Check eligibility → Resolve missing information or review an
              exception → Continue admission. Failed checks do not automatically reject the
              application.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
          </>
        )}
      </Stack>
    </Paper>
  );
}
