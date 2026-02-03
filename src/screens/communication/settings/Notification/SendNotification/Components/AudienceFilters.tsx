'use client';

import type { FormikProps } from 'formik';
import type { Division, Standards } from 'src/types/school';

import React, { memo } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { INotificationSendSchema } from './type';

interface AudienceFiltersProps {
  formik: FormikProps<INotificationSendSchema>;
  rolesData: any;
  isRolesLoading: boolean;
  allClass: Standards[];
  allDivision: Division[];
  onClassChange: (val: unknown) => void;
}

/**
 * Component: AudienceFilters
 * Responsibilities:
 * - Rendering Role, Class, and Division selection fields
 * - Displaying validation errors for each field
 */
const AudienceFilters = ({
  formik,
  rolesData,
  isRolesLoading,
  allClass,
  allDivision,
  onClassChange,
}: AudienceFiltersProps) => {
  const isStudentRole = formik.values.audience?.role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad';

  return (
    <>
      {/* Role */}
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField
          error={formik.touched.audience?.role && Boolean(formik.errors.audience?.role)}
        >
          <Autocomplete
            disabled={isRolesLoading}
            options={rolesData?.items || []}
            value={
              rolesData?.items?.find((item: any) => item.id === formik.values.audience?.role) ||
              null
            }
            fullWidth
            getOptionLabel={(option: any) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Role *"
                size="small"
                fullWidth
                error={formik.touched.audience?.role && Boolean(formik.errors.audience?.role)}
                helperText={formik.touched.audience?.role && formik.errors.audience?.role}
              />
            )}
            onChange={(e, value) => {
              formik.setFieldValue('audience.role', value?.id);
            }}
            onBlur={() => formik.setFieldTouched('audience.role', true)}
          />
        </ShakingTextField>
      </Grid>

      {/* Class & Division (Visible only for Students) */}
      {isStudentRole && (
        <>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={formik.touched.audience?.classes && Boolean(formik.errors.audience?.classes)}
            >
              <CustomSelect
                options={allClass}
                label="Class *"
                multiple
                value={formik.values.audience?.classes || []}
                onChange={onClassChange}
                onBlur={() => formik.setFieldTouched('audience.classes', true)}
                error={formik.touched.audience?.classes && Boolean(formik.errors.audience?.classes)}
                helperText={
                  (formik.touched.audience?.classes && formik.errors.audience?.classes) as string
                }
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={
                formik.touched.audience?.divisions && Boolean(formik.errors.audience?.divisions)
              }
            >
              {!(formik.values.audience?.classes as string[]).includes('all') &&
                (formik.values.audience?.classes as string[])?.length === 1 && (
                  <CustomSelect
                    options={allDivision}
                    label="Division *"
                    value={formik.values.audience?.divisions || []}
                    onChange={(val) => formik.setFieldValue('audience.divisions', val)}
                    onBlur={() => formik.setFieldTouched('audience.divisions', true)}
                    error={
                      formik.touched.audience?.divisions &&
                      Boolean(formik.errors.audience?.divisions)
                    }
                    helperText={
                      (formik.touched.audience?.divisions &&
                        formik.errors.audience?.divisions) as string
                    }
                    labelKey="name"
                    valueKey="id"
                    multiple={
                      !(formik.values.audience?.classes as string[]).includes('all') ||
                      (formik.values.audience?.classes?.length ?? 0) > 1
                    }
                    formControlProps={{ fullWidth: true }}
                    disabled={formik.values.audience?.classes?.length === 0}
                  />
                )}
            </ShakingTextField>
          </Grid>
        </>
      )}
    </>
  );
};

/**
 * Memoization Justification:
 * Pure UI component that receives many stable props like class and division lists.
 * Prevents re-renders unless the actual data or form state changes.
 */
export default memo(AudienceFilters);
