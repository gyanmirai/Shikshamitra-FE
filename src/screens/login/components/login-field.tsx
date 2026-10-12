import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import type { LoginValues } from '../hooks/use-login-form';

type Props = {
  name: keyof LoginValues;
  label: string;
  placeholder: string;
  icon: string;
  formik: FormikProps<LoginValues>;
  type?: string;
  autoComplete: string;
  endAdornment?: ReactNode;
};

export function LoginField({ name, label, icon, formik, endAdornment, ...props }: Props) {
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
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={icon} sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment,
          },
        }}
        sx={(theme) => ({
          '& .MuiOutlinedInput-root': {
            minHeight: 52,
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            '& fieldset': { borderColor: 'text.secondary' },
            '&:hover fieldset': { borderColor: 'text.primary' },
            '&.Mui-focused fieldset': { borderColor: 'primary.dark' },
            '&.Mui-error fieldset': { borderColor: 'error.dark' },
            ...theme.applyStyles('dark', {
              '&.Mui-focused fieldset': { borderColor: 'primary.light' },
              '&.Mui-error fieldset': { borderColor: 'error.light' },
            }),
          },
          '& input': { fontSize: '1rem', py: 1.5 },
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
