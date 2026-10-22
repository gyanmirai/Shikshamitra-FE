import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type Props<T extends Record<string, string>> = {
  name: Extract<keyof T, string>;
  label: string;
  placeholder: string;
  formik: FormikProps<T>;
  type?: string;
  autoComplete: string;
  endAdornment?: ReactNode;
  required?: boolean;
};

export function LoginField<T extends Record<string, string>>({
  name,
  label,
  formik,
  endAdornment,
  required = false,
  ...props
}: Props<T>) {
  const error = formik.touched[name] ? formik.errors[name] : undefined;

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={name}
        variant="caption"
        sx={{ display: 'block', mb: 1, fontWeight: 600, color: 'text.primary' }}
      >
        {label}
        {required && (
          <Box component="span" aria-hidden="true">
            {' '}
            *
          </Box>
        )}
      </Typography>
      <TextField
        {...props}
        fullWidth
        required={required}
        id={name}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        disabled={formik.isSubmitting}
        error={Boolean(error)}
        helperText={typeof error === 'string' ? error : undefined}
        slotProps={{
          htmlInput: { 'aria-label': label },
          input: {
            endAdornment,
          },
        }}
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            minHeight: 48,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            '& fieldset': { borderColor: 'text.secondary' },
            '&:hover fieldset': { borderColor: 'text.primary' },
            '&.Mui-focused fieldset': { borderColor: 'primary.dark' },
            '&.Mui-error fieldset': { borderColor: 'error.dark' },
            ...theme.applyStyles('dark', {
              '&.Mui-focused fieldset': { borderColor: 'primary.light' },
              '&.Mui-error fieldset': { borderColor: 'error.light' },
            }),
          },
          '& input': { fontSize: '1rem', py: 1.25 },
          '& .MuiFormHelperText-root': {
            mx: 0,
            '&.Mui-error': {
              color: 'error.dark',
              ...theme.applyStyles('dark', { color: 'error.light' }),
            },
          },
        })}
      />
    </Box>
  );
}
