import type { FormikProps } from 'formik';
import type { Theme } from '@mui/material/styles';

import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { Grid, TextField, InputAdornment } from '@mui/material';

import type { SetupUserErrors, SetupUserValues } from '../services/setup-user-validation';

export const setupUserErrorTextSx = (theme: Theme) => ({
  '&&.Mui-error': { color: 'error.dark' },
  ...theme.applyStyles('dark', { '&&.Mui-error': { color: 'error.light' } }),
});

export default function SetupUserFields({
  form,
  serverErrors,
  clearServerError,
  passwordHelp,
}: {
  form: FormikProps<SetupUserValues>;
  serverErrors: SetupUserErrors;
  clearServerError: (name: string) => void;
  passwordHelp: string;
}) {
  return (['userName', 'email', 'password'] as const).map((name) => {
    const error = serverErrors[name] || (form.touched[name] && form.errors[name]);
    const help =
      name === 'password' && form.values.password
        ? serverErrors.password || passwordHelp
        : error || (name === 'password' ? passwordHelp : undefined);
    return (
      <Grid key={name} size={12}>
        <TextField
          id={`setup-user-${name}`}
          name={name}
          label={
            name === 'userName' ? 'User name' : name === 'email' ? 'Email' : 'Initial password'
          }
          fullWidth
          size="small"
          required
          type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
          autoComplete={name === 'password' ? 'new-password' : 'off'}
          value={form.values[name]}
          onChange={(event) => {
            clearServerError(name);
            form.handleChange(event);
          }}
          onBlur={form.handleBlur}
          disabled={form.isSubmitting}
          error={Boolean(error)}
          helperText={help}
          slotProps={{
            inputLabel: { sx: setupUserErrorTextSx },
            input: {
              endAdornment: error ? (
                <InputAdornment position="end">
                  <ErrorOutline color="error" fontSize="small" />
                </InputAdornment>
              ) : undefined,
            },
            formHelperText: {
              'aria-live': 'polite',
              sx: setupUserErrorTextSx,
            },
          }}
        />
      </Grid>
    );
  });
}
