import type { FormikProps } from 'formik';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { LoginField } from './login-field';

import type { LoginValues } from '../hooks/use-login-form';

export function LoginCredentials({ formik }: { formik: FormikProps<LoginValues> }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <LoginField
        name="organization"
        label="School code"
        placeholder="Enter school code"
        icon="mdi:school-outline"
        autoComplete="organization"
        formik={formik}
      />
      <LoginField
        name="email"
        label="Email / Username"
        placeholder="Enter email or username"
        icon="mdi:account-outline"
        autoComplete="username"
        formik={formik}
      />
      <LoginField
        name="password"
        label="Password"
        placeholder="Enter password"
        icon="mdi:lock-outline"
        autoComplete="current-password"
        formik={formik}
        type={showPassword ? 'text' : 'password'}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword((visible) => !visible)}
              onMouseDown={(event) => event.preventDefault()}
              disabled={formik.isSubmitting}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              edge="end"
              sx={{
                width: 44,
                height: 44,
                color: 'text.secondary',
                '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: -2 },
              }}
            >
              <Iconify icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} />
            </IconButton>
          </InputAdornment>
        }
      />
    </>
  );
}
