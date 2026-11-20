import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import { Box, Grid, Alert, Stack, Button } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';

import { useRolloverPreview } from './useRolloverPreview';
import { RolloverPreviewResult } from './RolloverPreviewResult';
import { CirculationDateField } from '../../../circulation/CirculationDateField';

export function RolloverPanel({ academicYearId }: { academicYearId?: string }) {
  const draft = useRolloverPreview(academicYearId);
  const { formik, yearsQuery } = draft;
  const targetError = formik.touched.targetAcademicYearId
    ? formik.errors.targetAcademicYearId
    : undefined;
  return (
    <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, p: 1 }}>
      <FormBusyRegion
        busy={draft.busy}
        showOverlay={false}
        label="Reviewing academic year rollover"
      >
        <Stack spacing={2}>
          <FormSectionCard title="Compare academic years" icon={GlobalIcons.calendar}>
            <Stack spacing={2}>
              {yearsQuery.isError && (
                <Alert
                  severity="error"
                  action={
                    <Button size="small" onClick={() => yearsQuery.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Could not load academic years.
                </Alert>
              )}
              {!yearsQuery.isError &&
                !yearsQuery.isFetching &&
                yearsQuery.currentData &&
                !draft.sourceChoices.length && (
                  <Alert severity="info">
                    Rollover review needs two academic years available in your scope.
                  </Alert>
                )}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomSelect
                    name="sourceAcademicYearId"
                    label="Source academic year"
                    required
                    size="small"
                    fullWidth
                    value={draft.sourceYearId}
                    options={draft.sourceChoices}
                    labelKey="name"
                    valueKey="id"
                    disabled={draft.busy || !draft.sourceChoices.length}
                    isLoading={yearsQuery.isFetching}
                    onChange={(value) =>
                      formik.setValues({
                        sourceAcademicYearId: String(value),
                        targetAcademicYearId: '',
                        schoolDate: '',
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomSelect
                    name="targetAcademicYearId"
                    label="Target academic year"
                    required
                    size="small"
                    fullWidth
                    value={draft.targetYear?.id || ''}
                    options={draft.targetChoices}
                    labelKey="name"
                    valueKey="id"
                    disabled={draft.busy || !draft.targetChoices.length}
                    onChange={(value) =>
                      formik.setValues({
                        ...formik.values,
                        targetAcademicYearId: String(value),
                        schoolDate: '',
                      })
                    }
                    onBlur={() => formik.setFieldTouched('targetAcademicYearId', true)}
                    error={Boolean(targetError)}
                    helperText={targetError}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CirculationDateField
                    name="schoolDate"
                    label="Review date"
                    required={false}
                    value={parseDateOnly(formik.values.schoolDate)}
                    disabled={draft.busy || !draft.targetYear}
                    onChange={(day) => formik.setFieldValue('schoolDate', toDateOnly(day))}
                    onBlur={() => formik.setFieldTouched('schoolDate', true)}
                    error={formik.touched.schoolDate ? formik.errors.schoolDate : undefined}
                    helperText="Leave blank to use the target year’s first day."
                  />
                </Grid>
              </Grid>
              <Button
                color="inherit"
                size="small"
                variant="contained"
                sx={{ alignSelf: 'flex-end' }}
                disabled={draft.busy || !draft.targetYear}
                onClick={draft.runPreview}
                startIcon={<Iconify icon={GlobalIcons.eye} />}
              >
                Preview rollover
              </Button>
            </Stack>
          </FormSectionCard>
          {draft.error && <Alert severity="error">{draft.error}</Alert>}
          {draft.result && <RolloverPreviewResult result={draft.result} />}
        </Stack>
      </FormBusyRegion>
    </Box>
  );
}
