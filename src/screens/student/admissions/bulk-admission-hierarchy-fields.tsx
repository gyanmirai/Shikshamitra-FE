import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { selectBulkClasses } from './bulk-admission-offering-model';
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

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 4 }}>
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
            change('standardIds', []);
          }}
          error={touched.boardId && Boolean(errors.boardId)}
          helperText={touched.boardId ? errors.boardId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          options={options.mediums}
          label="Medium *"
          labelKey="name"
          valueKey="id"
          value={values.mediumId}
          isLoading={loading}
          disabled={!values.boardId || loading}
          onChange={(id) => {
            change('mediumId', id);
            change('standardIds', []);
          }}
          error={touched.mediumId && Boolean(errors.mediumId)}
          helperText={touched.mediumId ? errors.mediumId : undefined}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          multiple
          options={standards}
          label="Class *"
          labelKey="name"
          valueKey="id"
          value={values.standardIds}
          isLoading={loading}
          disabled={!values.mediumId || loading}
          onChange={(ids) => {
            const selection = selectBulkClasses(
              (Array.isArray(ids) ? ids : [ids]).map(String),
              standards
            );
            change('standardIds', selection.standardIds);
          }}
          error={touched.standardIds && Boolean(errors.standardIds)}
          helperText={touched.standardIds ? String(errors.standardIds ?? '') : undefined}
        />
      </Grid>
    </Grid>
  );
}
