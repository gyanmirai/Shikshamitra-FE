import type { AdmissionAssessmentSubjectPolicy } from 'src/redux/student/admissions/admission-assessment-policy';
import type { AdmissionAssessmentSubjectOption } from 'src/redux/student/admissions/admission-assessment-catalog-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Stack, TextField, IconButton, Typography } from '@mui/material';
import { getAssessmentSubjectNameError } from 'src/redux/student/admissions/admission-assessment-policy';

import { WorkflowAssessmentMarksField } from './workflow-assessment-marks-field';

import type { AssessmentFieldValidation } from '../hooks/use-assessment-field-validation';

export function WorkflowAssessmentSubjectFields({
  subject,
  fieldKey,
  index,
  available,
  disabled,
  catalogUnavailable,
  perSubjectPass,
  validation,
  onChange,
  onRemove,
}: {
  subject: AdmissionAssessmentSubjectPolicy;
  fieldKey: string;
  index: number;
  available: AdmissionAssessmentSubjectOption[];
  disabled: boolean;
  catalogUnavailable: boolean;
  perSubjectPass: boolean;
  validation: AssessmentFieldValidation;
  onChange: (changes: Partial<AdmissionAssessmentSubjectPolicy>) => void;
  onRemove: () => void;
}) {
  const nameError = validation.showError(`${fieldKey}:name`)
    ? getAssessmentSubjectNameError(subject.name)
    : undefined;
  const unavailable = Boolean(
    subject.subjectId &&
    !catalogUnavailable &&
    !available.some((option) => option.id === subject.subjectId)
  );
  return (
    <Box sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ xs: 12, sm: perSubjectPass ? 5 : 7 }}>
          {subject.subjectId ? (
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {subject.name}
              </Typography>
              {nameError && (
                <Typography variant="caption" color="error.main">
                  {nameError}
                </Typography>
              )}
              <Typography variant="caption" color={unavailable ? 'error.main' : 'text.secondary'}>
                {unavailable
                  ? 'Unavailable for This Medium. Remove or Replace This Subject.'
                  : 'School Subject'}
              </Typography>
            </Stack>
          ) : (
            <ShakingTextField error={Boolean(nameError)}>
              <TextField
                fullWidth
                size="small"
                required
                label="Custom Subject Name"
                disabled={disabled}
                value={subject.name}
                onChange={(event) => onChange({ name: event.target.value })}
                onBlur={() => validation.onBlur(`${fieldKey}:name`)}
                error={Boolean(nameError)}
                helperText={nameError}
                slotProps={{ htmlInput: { maxLength: 128 } }}
              />
            </ShakingTextField>
          )}
        </Grid>
        <Grid size={{ xs: perSubjectPass ? 5 : 10, sm: perSubjectPass ? 3 : 4 }}>
          <WorkflowAssessmentMarksField
            label="Maximum Marks"
            fieldKey={`${fieldKey}:totalMarks`}
            ariaLabel={`Maximum marks — ${subject.name || `subject ${index + 1}`}`}
            value={subject.totalMarks}
            max={10000}
            positive
            disabled={disabled}
            validation={validation}
            onChange={(value) => onChange({ totalMarks: value ?? 0 })}
          />
        </Grid>
        {perSubjectPass && (
          <Grid size={{ xs: 5, sm: 3 }}>
            <WorkflowAssessmentMarksField
              label="Passing Marks"
              fieldKey={`${fieldKey}:passingMarks`}
              ariaLabel={`Passing marks — ${subject.name || `subject ${index + 1}`}`}
              value={subject.passingMarks}
              max={subject.totalMarks}
              disabled={disabled || subject.totalMarks <= 0}
              validation={validation}
              onChange={(value) => onChange({ passingMarks: value })}
            />
          </Grid>
        )}
        <Grid size={{ xs: 2, sm: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CustomTooltip title={`Remove ${subject.name || 'subject'}`}>
            <span>
              <IconButton
                size="small"
                sx={{ width: 44, height: 44 }}
                aria-label={`Remove ${subject.name || `subject ${index + 1}`}`}
                disabled={disabled}
                onClick={onRemove}
              >
                <Iconify icon={GlobalIcons.delete} />
              </IconButton>
            </span>
          </CustomTooltip>
        </Grid>
      </Grid>
    </Box>
  );
}
