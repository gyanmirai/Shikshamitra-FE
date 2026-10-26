import type { FormikProps } from 'formik';

import { Box, TextField } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

export function ReportAiRequest({ form }: { form: FormikProps<{ prompt: string }> }) {
  return (
    <Box component="form" onSubmit={form.handleSubmit}>
      <FormSectionCard
        icon="mdi:comment-text-outline"
        title="Report Request"
        descriptionTooltip="Describe the setup report, filters, columns, sorting and output format."
      >
        <ShakingTextField error={Boolean(form.touched.prompt && form.errors.prompt)}>
          <TextField
            fullWidth
            required
            size="small"
            multiline
            minRows={5}
            name="prompt"
            label="What report would you like?"
            placeholder="Example: Which classes have only one division?"
            value={form.values.prompt}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={Boolean(form.touched.prompt && form.errors.prompt)}
            helperText={form.touched.prompt && form.errors.prompt}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
          />
        </ShakingTextField>
      </FormSectionCard>
    </Box>
  );
}
