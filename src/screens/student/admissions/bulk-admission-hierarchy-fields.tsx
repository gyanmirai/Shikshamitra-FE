import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';
import type { AcademicOrganizationOption } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';

import { Grid, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { admissionTrackLabels } from './admission-offering-model';
import { selectBulkClasses } from './bulk-admission-offering-model';
import { getAdmissionHierarchyOptions } from './admission-hierarchy-options';

import type { BulkOfferingValues } from './bulk-admission-offering-model';
import type { BulkOfferingFieldIssues } from './bulk-admission-offering-validation';

type Props = {
  formik: FormikProps<BulkOfferingValues>;
  hierarchy: AcademicOrganizationOption[];
  standards: Standards[];
  loading: boolean;
  change: (updates: Partial<BulkOfferingValues>) => void;
  fieldIssues?: BulkOfferingFieldIssues;
  configuredClassIds?: string[];
  classesLoading?: boolean;
  classesError?: boolean;
  classesDisabled?: boolean;
  retryClasses?: () => void;
};

export function BulkAdmissionHierarchyFields({
  formik,
  hierarchy,
  standards,
  loading,
  change,
  fieldIssues = {},
  configuredClassIds = [],
  classesLoading = false,
  classesError = false,
  classesDisabled = false,
  retryClasses,
}: Props) {
  const { values, errors, touched } = formik;
  const options = getAdmissionHierarchyOptions(hierarchy, values.boardId, values.mediumId);
  const allConfigured =
    standards.length > 0 && standards.every((standard) => configuredClassIds.includes(standard.id));
  const classError = Boolean(
    classesError || (touched.standardIds && errors.standardIds) || fieldIssues.standardIds?.blocking
  );
  const classHelp = classesError
    ? 'Offering classes could not be checked. Retry to select classes.'
    : classesLoading
      ? 'Checking existing offerings…'
      : allConfigured
        ? `All classes already have ${admissionTrackLabels[values.track]} offerings for this admission cycle.`
        : touched.standardIds && errors.standardIds
          ? String(errors.standardIds)
          : fieldIssues.standardIds?.message;

  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <ShakingTextField error={Boolean(touched.boardId && errors.boardId)}>
          <CustomSelect
            options={options.boards}
            label="Board *"
            name="boardId"
            labelId="bulk-board-label"
            SelectDisplayProps={{ 'aria-labelledby': 'bulk-board-label' }}
            size="small"
            labelKey="name"
            valueKey="id"
            value={values.boardId}
            isLoading={loading}
            onChange={(id) => {
              change({ boardId: String(id), mediumId: '', standardIds: [] });
            }}
            error={touched.boardId && Boolean(errors.boardId)}
            helperText={touched.boardId ? errors.boardId : undefined}
            onBlur={() => formik.setFieldTouched('boardId', true)}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <ShakingTextField error={Boolean(touched.mediumId && errors.mediumId)}>
          <CustomSelect
            options={options.mediums}
            label="Medium *"
            name="mediumId"
            labelId="bulk-medium-label"
            SelectDisplayProps={{ 'aria-labelledby': 'bulk-medium-label' }}
            size="small"
            labelKey="name"
            valueKey="id"
            value={values.mediumId}
            isLoading={loading}
            disabled={!values.boardId || loading}
            onChange={(id) => {
              change({ mediumId: String(id), standardIds: [] });
            }}
            error={touched.mediumId && Boolean(errors.mediumId)}
            helperText={touched.mediumId ? errors.mediumId : undefined}
            onBlur={() => formik.setFieldTouched('mediumId', true)}
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <ShakingTextField error={classError}>
          <CustomSelect
            multiple
            options={standards}
            label="Class *"
            name="standardIds"
            labelId="bulk-class-label"
            SelectDisplayProps={{ 'aria-labelledby': 'bulk-class-label' }}
            size="small"
            labelKey="name"
            valueKey="id"
            value={values.standardIds}
            isLoading={loading}
            disabled={
              !values.mediumId || loading || classesLoading || classesError || classesDisabled
            }
            disabledValues={configuredClassIds}
            disabledLabel="Offering already exists"
            onChange={(ids) => {
              const selection = selectBulkClasses(
                (Array.isArray(ids) ? ids : [ids])
                  .map(String)
                  .filter((id) => !configuredClassIds.includes(id)),
                standards
              );
              change(selection);
            }}
            error={classError}
            helperText={classHelp}
            helperTextProps={{ sx: { whiteSpace: 'pre-line' } }}
            onBlur={() => formik.setFieldTouched('standardIds', true)}
          />
        </ShakingTextField>
        {classesError && retryClasses && (
          <Button size="small" onClick={retryClasses} sx={{ mt: 0.5 }}>
            Retry class check
          </Button>
        )}
      </Grid>
    </Grid>
  );
}
