'use client';

import type { FormikProps } from 'formik';

import { useCallback } from 'react';
import { Grid } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { IClassOption, ISubjectFormValues } from '../type';

interface WeeklyLectureClassPickerProps {
  formik: FormikProps<ISubjectFormValues>;
  allClass: IClassOption[];
  disabled: boolean;
  isEditLocked: boolean;
}

export function WeeklyLectureClassPicker({
  formik,
  allClass,
  disabled,
  isEditLocked,
}: WeeklyLectureClassPickerProps) {
  const handleChange = useCallback(
    (val: string | number | string[] | number[]) => {
      const strVal = val as string;
      formik.setFieldValue('classId', strVal);
      const found = allClass.find((c) => c.id === strVal);
      formik.setFieldValue('className', found?.name || strVal);
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('totalLectures', 0);
    },
    [formik, allClass]
  );

  const helperText =
    formik.touched.classId && typeof formik.errors.classId === 'string'
      ? formik.errors.classId
      : undefined;

  return (
    <Grid size={{ xs: 12 }}>
      <ShakingTextField error={!!(formik.touched.classId && formik.errors.classId)}>
        <CustomSelect
          options={allClass}
          value={formik.values.classId}
          onChange={handleChange}
          label="Class *"
          labelKey="name"
          valueKey="id"
          formControlProps={{ fullWidth: true }}
          error={formik.touched.classId && Boolean(formik.errors.classId)}
          helperText={helperText}
          disabled={disabled || isEditLocked}
        />
      </ShakingTextField>
    </Grid>
  );
}
