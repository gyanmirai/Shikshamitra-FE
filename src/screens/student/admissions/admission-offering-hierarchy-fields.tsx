import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Grid, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

import type { AdmissionOfferingFormValues } from './admission-offering-model';

type Props = {
  formik: FormikProps<AdmissionOfferingFormValues>;
  hierarchy: AcademicOrganizationOption[];
  standards: Standards[];
  hierarchyLoading: boolean;
  standardsLoading: boolean;
  identityLocked: boolean;
};

const fieldError = (
  formik: FormikProps<AdmissionOfferingFormValues>,
  field: keyof AdmissionOfferingFormValues
) => (formik.touched[field] ? String(formik.errors[field] ?? '') : undefined);

export function AdmissionOfferingHierarchyFields({
  formik,
  hierarchy,
  standards,
  hierarchyLoading,
  standardsLoading,
  identityLocked,
}: Props) {
  const { boards, mediums, stages } = getAdmissionHierarchyOptions(
    hierarchy,
    formik.values.boardId,
    formik.values.mediumId
  );
  const visibleStandards = standards.filter(
    (standard) => standard.educationMediumStageId === formik.values.stageId
  );

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
        <Typography variant="subtitle2">Academic hierarchy</Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={boards}
          label="Board *"
          labelKey="name"
          valueKey="id"
          value={formik.values.boardId}
          isLoading={hierarchyLoading}
          disabled={identityLocked}
          error={Boolean(fieldError(formik, 'boardId'))}
          helperText={fieldError(formik, 'boardId')}
          onChange={(value) => {
            formik.setFieldValue('boardId', value);
            formik.setFieldValue('mediumId', '');
            formik.setFieldValue('stageId', '');
            formik.setFieldValue('standardId', '');
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={mediums}
          label="Medium *"
          labelKey="name"
          valueKey="id"
          value={formik.values.mediumId}
          disabled={identityLocked || !formik.values.boardId}
          error={Boolean(fieldError(formik, 'mediumId'))}
          helperText={fieldError(formik, 'mediumId')}
          onChange={(value) => {
            formik.setFieldValue('mediumId', value);
            formik.setFieldValue('stageId', '');
            formik.setFieldValue('standardId', '');
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={stages}
          label="Stage *"
          labelKey="name"
          valueKey="id"
          value={formik.values.stageId}
          disabled={identityLocked || !formik.values.mediumId}
          error={Boolean(fieldError(formik, 'stageId'))}
          helperText={fieldError(formik, 'stageId')}
          onChange={(value) => {
            formik.setFieldValue('stageId', value);
            formik.setFieldValue('standardId', '');
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={visibleStandards}
          label="Standard *"
          labelKey="name"
          valueKey="id"
          value={formik.values.standardId}
          isLoading={standardsLoading}
          disabled={identityLocked || !formik.values.stageId}
          error={Boolean(fieldError(formik, 'standardId'))}
          helperText={fieldError(formik, 'standardId')}
          onChange={(value) => formik.setFieldValue('standardId', value)}
        />
      </Grid>
    </Grid>
  );
}
