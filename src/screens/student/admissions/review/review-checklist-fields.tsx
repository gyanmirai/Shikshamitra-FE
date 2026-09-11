import type { FormikProps } from 'formik';
import type {
  ReviewDraft,
  ReviewSummary,
} from 'src/redux/student/admissions/admission-review-types';

import { Box, Stack, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';

export function ReviewChecklistFields({
  summary,
  formik,
}: {
  summary: ReviewSummary;
  formik: FormikProps<ReviewDraft>;
}) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Review checklist</Typography>
      {!summary.policy?.checklist.length && (
        <Typography variant="body2" color="text.secondary">
          No checklist confirmations are required.
        </Typography>
      )}
      {summary.policy?.checklist.map((item, index) => {
        const notesError = formik.getFieldMeta(`checklist.${index}.notes`);
        return (
          <Box key={item.code} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
            <FormControlLabel
              sx={{
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': { pt: 1, overflowWrap: 'anywhere' },
              }}
              control={
                <Checkbox
                  checked={formik.values.checklist[index]?.checked ?? false}
                  disabled={formik.isSubmitting}
                  onChange={(_, checked) =>
                    formik.setFieldValue(`checklist.${index}.checked`, checked)
                  }
                />
              }
              label={`${item.name}${item.required ? ' *' : ' (optional)'}`}
            />
            <TextField
              fullWidth
              multiline
              size="small"
              label={`Notes: ${item.name}`}
              {...formik.getFieldProps(`checklist.${index}.notes`)}
              disabled={formik.isSubmitting}
              error={Boolean(notesError.touched && notesError.error)}
              helperText={notesError.touched && notesError.error}
            />
          </Box>
        );
      })}
    </Stack>
  );
}
