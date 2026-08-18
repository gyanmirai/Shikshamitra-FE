import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Grid, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

import type { BulkOfferingValues } from './bulk-admission-offering-model';

type Props = {
  formik: FormikProps<BulkOfferingValues>;
  hierarchy: AcademicOrganizationOption[];
  standards: Standards[];
  loading: boolean;
  change: (field: keyof BulkOfferingValues, value: unknown) => void;
};

export function BulkAdmissionHierarchyFields({
  formik,
  hierarchy,
  standards,
  loading,
  change,
}: Props) {
  const { values, errors, touched } = formik;
  const options = getAdmissionHierarchyOptions(hierarchy, values.boardId, values.mediumId);
  const visibleStandards = standards.filter(
    (item) => item.educationMediumStageId === values.stageId
  );

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={options.boards}
          label="Board *"
          labelKey="name"
          valueKey="id"
          value={values.boardId}
          isLoading={loading}
          onChange={(id) => {
            change('boardId', id);
            change('mediumId', '');
            change('stageId', '');
            change('standardIds', []);
          }}
          error={touched.boardId && Boolean(errors.boardId)}
          helperText={touched.boardId ? errors.boardId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={options.mediums}
          label="Medium *"
          labelKey="name"
          valueKey="id"
          value={values.mediumId}
          disabled={!values.boardId}
          onChange={(id) => {
            change('mediumId', id);
            change('stageId', '');
            change('standardIds', []);
          }}
          error={touched.mediumId && Boolean(errors.mediumId)}
          helperText={touched.mediumId ? errors.mediumId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={options.stages}
          label="Stage *"
          labelKey="name"
          valueKey="id"
          value={values.stageId}
          disabled={!values.mediumId}
          onChange={(id) => {
            change('stageId', id);
            change('standardIds', []);
          }}
          error={touched.stageId && Boolean(errors.stageId)}
          helperText={touched.stageId ? errors.stageId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          multiple
          options={visibleStandards}
          label="Standards *"
          labelKey="name"
          valueKey="id"
          value={values.standardIds}
          disabled={!values.stageId}
          onChange={(ids) => change('standardIds', ids)}
          error={touched.standardIds && Boolean(errors.standardIds)}
          helperText={touched.standardIds ? String(errors.standardIds ?? '') : undefined}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          fullWidth
          size="small"
          label="Code prefix *"
          {...formik.getFieldProps('codePrefix')}
          onChange={(event) => change('codePrefix', event.target.value)}
          error={touched.codePrefix && Boolean(errors.codePrefix)}
          helperText={
            touched.codePrefix ? errors.codePrefix : 'Codes are generated as PREFIX-STANDARD.'
          }
        />
      </Grid>
    </Grid>
  );
}
