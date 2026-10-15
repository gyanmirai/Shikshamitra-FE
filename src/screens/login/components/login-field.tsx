import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import type { LoginValues } from '../hooks/use-login-form';

type Props = {
  name: keyof LoginValues;
  label: string;
  placeholder: string;
  formik: FormikProps<LoginValues>;
  type?: string;
  autoComplete: string;
  endAdornment?: ReactNode;
};

export function LoginField({ name, label, formik, endAdornment, ...props }: Props) {
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
      </Typography>
      <TextField
        {...props}
        fullWidth
        id={name}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        disabled={formik.isSubmitting}
        error={Boolean(error)}
        helperText={error}
        slotProps={{
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
