'use client';

import type { FormikProps } from 'formik';

import { memo, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Tooltip, TextField, IconButton, Typography } from '@mui/material';

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
  const currentValue = Number(subject?.noOfLecture ?? 0);

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

  const handleDecrement = useCallback(() => {
    if (currentValue > 0) formik.setFieldValue(fieldName, currentValue - 1);
  }, [formik, fieldName, currentValue]);

  const handleIncrement = useCallback(() => {
    formik.setFieldValue(fieldName, currentValue + 1);
  }, [formik, fieldName, currentValue]);

  return (
    <ShakingTextField error={showError}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Decrease" arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleDecrement}
                disabled={isDisabled || currentValue <= 0}
                aria-label="Decrease lecture count"
                sx={{
                  width: 28,
                  height: 28,
                  border: '1px solid',
                  borderColor: showError ? 'error.main' : 'divider',
                  borderRadius: 1,
                  flexShrink: 0,
                  transition: 'background-color 150ms ease',
                  '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontSize: 16, lineHeight: 1, userSelect: 'none' }}
                >
                  −
                </Typography>
              </IconButton>
            </span>
          </Tooltip>

          <TextField
            type="number"
            size="small"
            name={fieldName}
            value={subject?.noOfLecture ?? ''}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            inputProps={{
              min: 0,
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

          <Tooltip title="Increase" arrow>
            <span>
              <IconButton
                size="small"
                onClick={handleIncrement}
                disabled={isDisabled}
                aria-label="Increase lecture count"
                sx={{
                  width: 28,
                  height: 28,
                  border: '1px solid',
                  borderColor: showError ? 'error.main' : 'divider',
                  borderRadius: 1,
                  flexShrink: 0,
                  transition: 'background-color 150ms ease',
                  '&:hover:not(:disabled)': { bgcolor: 'action.hover' },
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontSize: 16, lineHeight: 1, userSelect: 'none' }}
                >
                  +
                </Typography>
              </IconButton>
            </span>
          </Tooltip>
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
