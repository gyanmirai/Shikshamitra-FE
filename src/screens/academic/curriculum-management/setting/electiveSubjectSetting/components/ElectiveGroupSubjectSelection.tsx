import type { FormikProps } from 'formik';

import { Alert } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import type { ElectiveSubjectFormValues } from './initialValues';

interface ElectiveGroupSubjectSelectionProps {
  formik: FormikProps<ElectiveSubjectFormValues>;
  subjects: Array<{ id: string; name: string }>;
  isLoading: boolean;
  isLocked: boolean;
}

export function ElectiveGroupSubjectSelection({
  formik,
  subjects,
  isLoading,
  isLocked,
}: ElectiveGroupSubjectSelectionProps) {
  return (
    <>
      {isLocked && (
        <Alert severity="info" variant="outlined" icon={<Iconify icon="lucide:lock" />}>
          Subject selection is locked because this elective group is already used in academic
          records. You can still update all other group details. Create a new elective group to use
          a different subject combination.
        </Alert>
      )}

      <ShakingTextField error={Boolean(formik.touched.subjectIds && formik.errors.subjectIds)}>
        <ResponsiveMultiSelect
          label="Select subjects *"
          options={subjects}
          isLoading={isLoading}
          disabled={isLocked}
          value={formik.values.subjectIds}
          getOptionLabel={(option: { name: string }) => option.name}
          getOptionValue={(option: { id: string }) => option.id}
          onChange={(selected: string[]) => formik.setFieldValue('subjectIds', selected)}
          error={Boolean(formik.touched.subjectIds && formik.errors.subjectIds)}
          helperText={
            Array.isArray(formik.errors.subjectIds)
              ? formik.errors.subjectIds.join(', ')
              : (formik.touched.subjectIds && formik.errors.subjectIds) || undefined
          }
        />
      </ShakingTextField>
    </>
  );
}
