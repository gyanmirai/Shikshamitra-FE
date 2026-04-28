'use client';

import type { FormikProps } from 'formik';

import { memo, useCallback } from 'react';
import { TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ISubject, ISubjectFormValues } from '../type';

interface SubjectLectureFieldProps {
  index: number;
  formik: FormikProps<ISubjectFormValues>;
  disabled?: boolean;
  isEdit: boolean;
}

const BLOCKED_KEYS = new Set(['e', 'E', '+', '-', '.']);

/**
 * Per-row weekly-lectures input.
 *
 * `React.memo` is justified: this field is rendered N times (one per subject)
 * inside a CustomizableTable that re-renders on every formik value change.
 * Without memo, every keystroke re-renders every row.
 *
 * `useCallback` for `onChange` / `onKeyDown` is justified because they are
 * passed to a memoized MUI TextField and depend on stable `formik` ref.
 */
function SubjectLectureFieldImpl({ index, formik, disabled, isEdit }: SubjectLectureFieldProps) {
  const fieldName = `subjects[${index}].noOfLecture`;
  const subject: ISubject | undefined = formik.values.subjects[index];
  const touched = !!formik.touched.subjects?.[index]?.noOfLecture;
  const errorMsg = (formik.errors.subjects?.[index] as { noOfLecture?: string } | undefined)
    ?.noOfLecture;
  const showError = touched && !!errorMsg;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      formik.setFieldValue(fieldName, e.target.value);
    },
    [formik, fieldName]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (BLOCKED_KEYS.has(e.key)) {
      e.preventDefault();
    }
  }, []);

  return (
    <ShakingTextField error={showError}>
      <TextField
        type="number"
        size="small"
        label="Weekly Lectures *"
        name={fieldName}
        value={subject?.noOfLecture ?? ''}
        onChange={handleChange}
        onBlur={formik.handleBlur}
        inputProps={{ min: 0 }}
        disabled={disabled && !isEdit}
        error={showError}
        helperText={showError ? String(errorMsg) : ''}
        onKeyDown={handleKeyDown}
        sx={{ minWidth: '100px', width: '100%', mb: 1.5 }}
      />
    </ShakingTextField>
  );
}

export const SubjectLectureField = memo(SubjectLectureFieldImpl);
