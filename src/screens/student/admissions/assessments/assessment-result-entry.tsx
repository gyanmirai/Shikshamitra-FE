import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import CustomSelect from 'src/components/custom-select';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Stack, Alert, InputAdornment } from '@mui/material';
import NumericFormatCustom from 'src/components/custom-numeric-format';

import { validateAssessmentSubjectValues } from './assessment-subject-results';
import { AssessmentSubjectScoreFields } from './assessment-subject-score-fields';

import type { useAssessmentQuickActions } from './use-assessment-quick-actions';

export function AssessmentResultEntry({
  assessment,
  quick,
  disabled,
  formId,
  inlineSave = false,
}: {
  assessment: ManagedApplicationAssessment;
  quick: ReturnType<typeof useAssessmentQuickActions>;
  disabled: boolean;
  formId: string;
  inlineSave?: boolean;
}) {
  const { formik } = quick;
  if (assessment.policy.scoringMode === 'subjects' && !quick.profile)
    return (
      <Alert severity="warning">
        The class assessment profile is unavailable. Refresh before recording results.
      </Alert>
    );
  if (quick.profile) {
    return (
      <Box
        component="form"
        id={formId}
        noValidate
        onSubmit={(event) => {
          quick.prepareSubmit();
          formik.handleSubmit(event);
        }}
        sx={{ minWidth: 0 }}
      >
        <Stack spacing={1.5}>
          <AssessmentSubjectScoreFields
            profile={quick.profile}
            values={formik.values.subjectScores ?? {}}
            errors={
              formik.errors.subjectScores || formik.submitCount > 0
                ? validateAssessmentSubjectValues(
                    quick.profile,
                    formik.values.subjectScores,
                    quick.draftValidation
                  )
                : {}
            }
            disabled={disabled || quick.busy || !quick.canRecordResult}
            onChange={quick.changeSubject}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
            <LoadingButton
              type="button"
              size="small"
              variant="outlined"
              loading={quick.busy && !formik.isSubmitting}
              disabled={disabled || quick.busy || !quick.canSaveDraft}
              onClick={quick.saveDraft}
            >
              Save draft
            </LoadingButton>
            {inlineSave && (
              <LoadingButton
                type="submit"
                size="small"
                variant="contained"
                loading={formik.isSubmitting}
                disabled={disabled || quick.busy || !quick.canRecordResult}
              >
                Submit result
              </LoadingButton>
            )}
          </Stack>
        </Stack>
      </Box>
    );
  }
  return (
    <Box
      component="form"
      id={formId}
      noValidate
      onSubmit={formik.handleSubmit}
      sx={{ minWidth: 0 }}
    >
      <Stack
        direction={{ xs: inlineSave ? 'column' : 'row', sm: 'row' }}
        spacing={1}
        alignItems={inlineSave ? 'center' : 'flex-start'}
      >
        <Box sx={{ flex: 1, minWidth: 0, width: 1 }}>
          {assessment.policy.scoringEnabled ? (
            <NumericFormatCustom
              fullWidth
              size="small"
              prefix=""
              roundToWholeRupees={false}
              decimalScale={2}
              name="marks"
              label={inlineSave ? 'Marks' : `Marks / ${assessment.policy.totalMarks}`}
              inputProps={{ 'aria-label': `Marks / ${assessment.policy.totalMarks}` }}
              InputProps={
                inlineSave
                  ? {
                      endAdornment: (
                        <InputAdornment position="end">
                          / {assessment.policy.totalMarks}
                        </InputAdornment>
                      ),
                    }
                  : undefined
              }
              value={formik.values.marks}
              disabled={disabled || !quick.canRecordResult}
              onBlur={formik.handleBlur}
              onValueChange={({ floatValue }) => quick.changeResult('marks', floatValue ?? '')}
              error={Boolean(formik.touched.marks && formik.errors.marks)}
              helperText={formik.touched.marks ? formik.errors.marks : undefined}
            />
          ) : (
            <CustomSelect
              label="Result"
              value={formik.values.outcome}
              disabled={disabled || !quick.canRecordResult}
              options={[
                { value: 'passed', label: 'Passed' },
                { value: 'failed', label: 'Failed' },
              ]}
              onChange={(value) => quick.changeResult('outcome', String(value))}
              error={Boolean(formik.touched.outcome && formik.errors.outcome)}
              helperText={formik.touched.outcome ? formik.errors.outcome : undefined}
            />
          )}
        </Box>
        {inlineSave && (
          <LoadingButton
            type="submit"
            size="small"
            variant="contained"
            loading={formik.isSubmitting}
            aria-label={`Save result for attempt ${quick.attempt?.attemptNumber}`}
            disabled={disabled || !quick.canRecordResult}
            sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Save Result
          </LoadingButton>
        )}
      </Stack>
    </Box>
  );
}
