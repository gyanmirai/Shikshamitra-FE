import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { Grid, Stack, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { RUBRIC_WORK_TYPE_OPTIONS } from '../constants';
import { RubricFormSection } from './RubricFormSection';

import type { RubricConfigFormValues } from '../types';

const getFormikError = (formik: FormikProps<RubricConfigFormValues>, path: string): string =>
  getIn(formik.touched, path) ? getIn(formik.errors, path) || '' : '';
const hasFormikError = (formik: FormikProps<RubricConfigFormValues>, path: string) =>
  Boolean(getFormikError(formik, path));

export const RubricBasicInformation = ({
  formik,
}: {
  formik: FormikProps<RubricConfigFormValues>;
}) => (
  <Stack spacing={1.5}>
    <RubricFormSection
      icon="solar:document-text-bold-duotone"
      title="Template Identity"
      caption="Name the rubric and define where teachers can use it."
    >
      <Grid container spacing={1.25}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            name="title"
            label="Rubric Name *"
            value={formik.values.title}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={hasFormikError(formik, 'title')}
            helperText={getFormikError(formik, 'title') || ''}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomSelect
            label="Applies To *"
            options={RUBRIC_WORK_TYPE_OPTIONS}
            labelKey="label"
            valueKey="value"
            value={formik.values.appliesToWorkType}
            onBlur={() => formik.setFieldTouched('appliesToWorkType', true)}
            onChange={(value) => formik.setFieldValue('appliesToWorkType', value)}
            error={hasFormikError(formik, 'appliesToWorkType')}
            helperText={getFormikError(formik, 'appliesToWorkType')}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            name="description"
            label="Description"
            multiline
            rows={2}
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </Grid>
      </Grid>
    </RubricFormSection>

    <RubricFormSection
      icon="solar:user-speak-bold-duotone"
      title="Guidance"
      caption="Optional instructions that appear with the rubric during evaluation."
    >
      <Grid container spacing={1.25}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            name="evaluationInstructions"
            label="Teacher Evaluation Instructions"
            multiline
            rows={3}
            value={formik.values.evaluationInstructions}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            size="small"
            name="studentInstructions"
            label="Student-Facing Instructions"
            multiline
            rows={3}
            value={formik.values.studentInstructions}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            size="small"
            name="tags"
            label="Tags"
            placeholder="project, creativity, grade 8"
            value={formik.values.tags}
            onChange={formik.handleChange}
            helperText="Separate tags with commas."
          />
        </Grid>
      </Grid>
    </RubricFormSection>
  </Stack>
);
