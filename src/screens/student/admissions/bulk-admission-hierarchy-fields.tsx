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
  const visibleStandards = values.stageId
    ? standards.filter((item) => item.educationMediumStageId === values.stageId)
    : standards;

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
            change('stageId', '');
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
      <Grid size={{ xs: 12, sm: 4 }}>
        <CustomSelect
          multiple
          options={visibleStandards}
          label="Class *"
          labelKey="name"
          valueKey="id"
          value={values.standardIds}
          disabled={!values.mediumId}
          onChange={(ids) => {
            const selection = selectBulkClasses(
              (Array.isArray(ids) ? ids : [ids]).map(String),
              standards
            );
            change('stageId', selection.stageId);
            change('standardIds', selection.standardIds);
          }}
          error={
            (touched.standardIds && Boolean(errors.standardIds)) ||
            (touched.stageId && Boolean(errors.stageId))
          }
          helperText={
            touched.standardIds || touched.stageId
              ? String(errors.standardIds ?? errors.stageId ?? '')
              : values.stageId
                ? 'Clear selected classes to see all classes again.'
                : undefined
          }
        />
      </Grid>
    </Grid>
  );
}
