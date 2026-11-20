import type { FormikProps } from 'formik';

import { Stack, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ComposeValues } from './compose-model';

export function NotificationContentFields({
  formik,
  disabled,
}: {
  formik: FormikProps<ComposeValues>;
  disabled: boolean;
}) {
  return (
    <Stack spacing={2}>
      {(['subject', 'message'] as const).map((name) => {
        const error = Boolean(formik.touched[name] && formik.errors[name]);
        return (
          <ShakingTextField key={name} error={error}>
            <TextField
              name={name}
              label={name === 'subject' ? 'Subject' : 'Message'}
              required
              fullWidth
              size="small"
              value={formik.values[name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disabled}
              multiline={name === 'message'}
              minRows={name === 'message' ? 5 : undefined}
              error={error}
              helperText={
                error
                  ? formik.errors[name]
                  : `${formik.values[name].length}/${name === 'subject' ? 300 : 2000} characters`
              }
            />
          </ShakingTextField>
        );
      })}
      <Typography variant="caption" color="text.secondary">
        {
          'Supported variables: {{memberName}}, {{recipientName}}, {{recipientEmail}}. This message has no book or due-date record context.'
        }
      </Typography>
    </Stack>
  );
}
