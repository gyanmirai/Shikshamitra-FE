import type { FormEventHandler, FocusEventHandler, ChangeEventHandler } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { Box, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

interface Props {
  prompt: string;
  error?: string;
  touched?: boolean;
  onBlur: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  placeholder?: string;
  description?: string;
}

export function AiReportPromptForm({
  prompt,
  error,
  touched,
  onBlur,
  onChange,
  onSubmit,
  placeholder = 'Example: Nursery subjects with primary teachers and progress below 70%',
  description = 'Describe the report you need using data available within your permitted scope.',
}: Props) {
  const showError = Boolean(touched && error);

  return (
    <Box id="shikshamitra-ai-report-form" component="form" onSubmit={onSubmit} noValidate>
      <FormSectionCard
        title="Report Request"
        icon={GlobalIcons.documentIcon}
        descriptionTooltip={description}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      >
        <ShakingTextField error={showError}>
          <TextField
            id="ai-report-prompt"
            fullWidth
            required
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
            error={showError}
            helperText={
              (touched && error) ||
              'Include classes, columns, comparisons, sorting, or output format.'
            }
            inputProps={{ maxLength: 2000 }}
          />
        </ShakingTextField>
      </FormSectionCard>
    </Box>
  );
}
