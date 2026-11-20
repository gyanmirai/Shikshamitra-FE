import type { FormikProps } from 'formik';
import type { LibraryNamedOption, LibraryPolicyOptions } from 'src/redux/library/policy-types';

import { Grid, Alert } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { FormSectionCard } from 'src/components/form-section-card';

import type { PolicyValues } from './policy-form';

export function PolicyScope({
  formik,
  options,
}: {
  formik: FormikProps<PolicyValues>;
  options: LibraryPolicyOptions;
}) {
  const { values } = formik;
  const fields: {
    name: 'bookCategoryId' | 'sectionId' | 'educationMediumStageId' | 'standardId';
    label: string;
    options: LibraryNamedOption[];
  }[] = [
    { name: 'bookCategoryId', label: 'Book category', options: options.bookCategories },
    { name: 'sectionId', label: 'Library section', options: options.sections },
    ...(values.role === 0
      ? [
          {
            name: 'educationMediumStageId' as const,
            label: 'Education stage',
            options: options.stages,
          },
          {
            name: 'standardId' as const,
            label: 'Class',
            options: options.standards
              .filter(
                (item) =>
                  !values.educationMediumStageId || item.parentId === values.educationMediumStageId
              )
              .map((item) => ({ ...item, name: `${item.name} / ${item.parentName}` })),
          },
        ]
      : []),
  ];
  return (
    <FormSectionCard
      title="Application Scope"
      icon={GlobalIcons.assigned}
      descriptionTooltip="More specific matching policies take precedence. For example, a Class 8 fiction policy overrides a general student policy for those books."
    >
      {!options.canManageGlobalPolicies && !values.educationMediumStageId && !values.standardId && (
        <Alert severity="info">
          Choose a stage or class within your assigned scope. Tenant-wide policy changes require
          broader scope.
        </Alert>
      )}
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
            <CustomSelect
              label={field.label}
              value={values[field.name]}
              options={[{ id: '', name: 'All' }, ...field.options]}
              labelKey="name"
              valueKey="id"
              fullWidth
              size="small"
              isSearch
              disabled={formik.isSubmitting}
              onChange={(value) => {
                formik.setFieldValue(field.name, value);
                if (field.name === 'educationMediumStageId') formik.setFieldValue('standardId', '');
              }}
            />
          </Grid>
        ))}
      </Grid>
    </FormSectionCard>
  );
}
