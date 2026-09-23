import type { Ref, FocusEventHandler } from 'react';

import { useId } from 'react';
import { Box, TextField } from '@mui/material';

import { lessonPlanTextFields } from '../lessonPlanTextValidation';

import type { LessonPlanTextField } from '../lessonPlanTextValidation';

type Props = {
  field: LessonPlanTextField;
  value: string;
  error?: string;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>;
  onChange: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export function LessonPlanTextInput({
  field,
  value,
  error,
  disabled,
  inputRef,
  onChange,
  onBlur,
}: Props) {
  const id = useId();
  const { label, maxLength, helper, placeholder } = lessonPlanTextFields[field];
  const multiline = field !== 'topic';
  return (
    <TextField
      id={id}
      name={field}
      placeholder={placeholder}
      size="small"
      label={field === 'topic' ? `${label} *` : label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      inputRef={inputRef}
      disabled={disabled}
      fullWidth
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      maxRows={multiline ? 8 : undefined}
      error={Boolean(error)}
      slotProps={{ htmlInput: { maxLength } }}
      helperText={
        <Box
          component="span"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'space-between' }}
        >
          <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
            {error || helper}
          </Box>
          <Box component="span" sx={{ whiteSpace: 'nowrap', ml: 'auto' }}>
            {value.length}/{maxLength}
          </Box>
        </Box>
      }
    />
  );
}
