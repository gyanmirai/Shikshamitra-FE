import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { AdmissionCampusSelect } from './admission-campus-select';
import { useAdmissionCampusOptions } from './use-admission-campus-options';
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
  const fetchCampuses = useAdmissionCampusOptions();
  const { values, errors, touched } = formik;
  const options = getAdmissionHierarchyOptions(hierarchy, values.boardId, values.mediumId);
  const visibleStandards = standards.filter(
    (item) => item.educationMediumStageId === values.stageId
  );

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <AdmissionCampusSelect
          label="Campus (optional)"
          valueId={values.campusId ?? null}
          fetchOptions={fetchCampuses}
          onChange={(id) => change('campusId', id)}
          helperText="Select a campus when these intakes are campus-specific."
        />
      </Grid>
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
          label="School level *"
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
      <Grid size={12}>
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
    </Grid>
  );
}
