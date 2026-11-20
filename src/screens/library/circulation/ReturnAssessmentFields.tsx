import type { FormikProps } from 'formik';
import type { LibraryReturnLookup } from 'src/redux/library/circulation-types';
import type { LibraryReturnAssessmentCategory } from 'src/redux/library/return-assessment-api';

import { useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetReturnAssessmentCategoriesQuery } from 'src/redux/library/return-assessment-api';

import { hasReturnCharge } from './return-form';
import { ReturnAssessmentInputs } from './ReturnAssessmentInputs';

import type { ReturnValues } from './return-form';

export function ReturnAssessmentFields({
  formik,
  lookup,
  disabled,
}: {
  formik: FormikProps<ReturnValues>;
  lookup: LibraryReturnLookup;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState<LibraryReturnAssessmentCategory | null>(null);
  const [search] = useLazyGetReturnAssessmentCategoriesQuery();
  const year = formik.values.assessmentAcademicYearId || '';
  const allowedYear = lookup.schoolContext?.academicYears.some((item) => item.id === year);
  const required = hasReturnCharge(formik.values.chargeCategory);
  const fetchOptions = async (query: string, page: number) => {
    if (!allowedYear) return { data: [], hasMore: false };
    const result = await search({
      academicYearId: year,
      search: query,
      page,
      pageSize: 20,
    }).unwrap();
    return { data: result.items, hasMore: page * 20 < result.totalCount };
  };
  return (
    <FormSectionCard
      title="Optional Return Assessment"
      icon={GlobalIcons.receiptIcon}
      descriptionTooltip="This creates an unposted Library assessment. Collection, waiver and receipts remain Finance workflows; physical return can proceed without an assessment."
    >
      <Stack spacing={2}>
        <Alert severity="info">
          An assessment records a separate obligation. It does not collect money, waive a balance or
          clear an existing charge.
        </Alert>
        <ShakingTextField
          error={Boolean(
            formik.touched.assessmentAcademicYearId && formik.errors.assessmentAcademicYearId
          )}
        >
          <CustomSelect
            label="Assessment academic year"
            name="assessmentAcademicYearId"
            required={required}
            fullWidth
            size="small"
            value={year}
            options={lookup.schoolContext?.academicYears || []}
            labelKey="name"
            valueKey="id"
            disabled={disabled}
            onChange={(value) =>
              formik.setValues({
                ...formik.values,
                assessmentAcademicYearId: String(value),
                chargeCategory: 'none',
                amount: '',
              })
            }
            onBlur={() => formik.setFieldTouched('assessmentAcademicYearId', true)}
            error={Boolean(
              formik.touched.assessmentAcademicYearId && formik.errors.assessmentAcademicYearId
            )}
            helperText={
              (formik.touched.assessmentAcademicYearId && formik.errors.assessmentAcademicYearId) ||
              'Choose a year to find assessment categories. Leave the category empty to return without an assessment.'
            }
          />
        </ShakingTextField>
        <ShakingTextField
          error={Boolean(formik.touched.chargeCategory && formik.errors.chargeCategory)}
        >
          <PaginatedSearchSelect<LibraryReturnAssessmentCategory>
            key={year}
            label="Assessment category"
            name="chargeCategory"
            size="small"
            fullWidth
            value={selected?.id === formik.values.chargeCategory ? selected : null}
            disabled={disabled || !allowedYear}
            fetchOptions={fetchOptions}
            filterOptions={(options) => options}
            getOptionLabel={(option) => option.name}
            getOptionKey={(option) => option.id}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_, value) => {
              setSelected(value);
              formik.setValues({
                ...formik.values,
                chargeCategory: value?.id || 'none',
                amount: value ? String(value.amount) : '',
              });
            }}
            onBlur={() => formik.setFieldTouched('chargeCategory', true)}
            error={Boolean(formik.touched.chargeCategory && formik.errors.chargeCategory)}
            helperText={formik.touched.chargeCategory && formik.errors.chargeCategory}
          />
        </ShakingTextField>
        {required && (
          <ReturnAssessmentInputs
            formik={formik}
            disabled={disabled}
            fixed={Boolean(selected?.isFixed)}
            requiresYearReason={year !== lookup.loan.academicYearId}
          />
        )}
      </Stack>
    </FormSectionCard>
  );
}
