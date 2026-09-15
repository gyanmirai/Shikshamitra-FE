import type { FormEventHandler, FocusEventHandler, ChangeEventHandler } from 'react';

import { Box, TextField } from '@mui/material';

interface Props {
  prompt: string;
  error?: string;
  touched?: boolean;
  onBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  placeholder?: string;
}

export function AiReportPromptForm({
  prompt,
  error,
  touched,
  onBlur,
  onChange,
  onSubmit,
  placeholder = 'Example: Nursery subjects with primary teachers and progress below 70%',
}: Props) {
  return (
    <Box id="shikshamitra-ai-report-form" component="form" onSubmit={onSubmit}>
      <TextField
        id="ai-report-prompt"
        fullWidth
        multiline
        minRows={5}
        maxRows={10}
        size="small"
        name="prompt"
        label="What report would you like?"
        placeholder={placeholder}
        value={prompt}
        onChange={onChange}
        onBlur={onBlur}
        error={touched && Boolean(error)}
        helperText={
          (touched && error) || 'Include classes, columns, comparisons, sorting, or output format.'
        }
        inputProps={{ maxLength: 2000 }}
      />
    </Box>
  );
}
