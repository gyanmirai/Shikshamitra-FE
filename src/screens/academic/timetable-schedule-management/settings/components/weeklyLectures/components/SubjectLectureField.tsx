'use client';

import type { FormikProps } from 'formik';

import { memo, useCallback } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { LectureStepButton } from './LectureStepButton';
import {
  toWeeklyLectureCount,
  normalizeWeeklyLectureValue,
  preventInvalidWeeklyLectureKey,
  MAX_WEEKLY_LECTURES_PER_SUBJECT,
  MIN_WEEKLY_LECTURES_PER_SUBJECT,
} from '../weeklyLectureValue';

import type { ISubject, ISubjectFormValues } from '../type';

interface SubjectLectureFieldProps {
  index: number;
  formik: FormikProps<ISubjectFormValues>;
  disabled?: boolean;
  isEdit: boolean;
}

/**
 * Per-row weekly-lectures input.
 *
 * `React.memo` is justified: this field is rendered N times (one per subject)
 * inside a CustomizableTable that re-renders on every formik value change.
 * Without memo, every keystroke re-renders every row.
 *
 * `useCallback` for `onChange` / `onKeyDown` / stepper handlers is justified
 * because they are passed to memoized children and depend on stable `formik` ref.
 */
function SubjectLectureFieldImpl({ index, formik, disabled, isEdit }: SubjectLectureFieldProps) {
  const fieldName = `subjects[${index}].noOfLecture`;
  const subject: ISubject | undefined = formik.values.subjects[index];
  const touched = !!formik.touched.subjects?.[index]?.noOfLecture;
  const errorMsg = (formik.errors.subjects?.[index] as { noOfLecture?: string } | undefined)
    ?.noOfLecture;
  const showError = touched && !!errorMsg;
  const isDisabled = disabled && !isEdit;
  const inputValue = normalizeWeeklyLectureValue(subject?.noOfLecture);
  const currentValue = toWeeklyLectureCount(subject?.noOfLecture);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      formik.setFieldValue(fieldName, normalizeWeeklyLectureValue(e.target.value));
    },
    [formik, fieldName]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    preventInvalidWeeklyLectureKey(e);
  }, []);

  const handleDecrement = useCallback(() => {
    if (currentValue > 0) formik.setFieldValue(fieldName, currentValue - 1);
  }, [formik, fieldName, currentValue]);

  const handleIncrement = useCallback(() => {
    formik.setFieldValue(fieldName, Math.min(MAX_WEEKLY_LECTURES_PER_SUBJECT, currentValue + 1));
  }, [formik, fieldName, currentValue]);

  return (
    <ShakingTextField error={showError}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LectureStepButton
            direction="decrease"
            onClick={handleDecrement}
            disabled={isDisabled || currentValue <= MIN_WEEKLY_LECTURES_PER_SUBJECT}
            hasError={showError}
          />

          <TextField
            type="number"
            size="small"
            name={fieldName}
            value={inputValue}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            inputProps={{
              min: MIN_WEEKLY_LECTURES_PER_SUBJECT,
              max: MAX_WEEKLY_LECTURES_PER_SUBJECT,
              step: 1,
              inputMode: 'numeric',
              style: { textAlign: 'center', MozAppearance: 'textfield' },
              'aria-label': 'Weekly lectures count',
            }}
            disabled={isDisabled}
            error={showError}
            onKeyDown={handleKeyDown}
            sx={{
              width: '68px',
              '& .MuiInputBase-input': { px: 0.5 },
              '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                { WebkitAppearance: 'none' },
            }}
          />

          <LectureStepButton
            direction="increase"
            onClick={handleIncrement}
            disabled={isDisabled || currentValue >= MAX_WEEKLY_LECTURES_PER_SUBJECT}
            hasError={showError}
          />
        </Box>

        {showError && (
          <Typography variant="caption" color="error" sx={{ pl: 0.5 }}>
            {String(errorMsg)}
          </Typography>
        )}
      </Box>
    </ShakingTextField>
  );
}

export const SubjectLectureField = memo(SubjectLectureFieldImpl);
