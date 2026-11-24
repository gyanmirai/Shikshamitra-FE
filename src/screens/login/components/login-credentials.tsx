import Box from '@mui/material/Box';

import { LoginField } from './login-field';
import { AuthPasswordField } from './auth-password-field';

import type { useLoginForm } from '../hooks/use-login-form';

type Props = Pick<ReturnType<typeof useLoginForm>, 'formik' | 'handleSchoolCodeChange'>;

export function LoginCredentials({ formik, handleSchoolCodeChange }: Props) {
  return (
    <>
      <LoginField
        name="organization"
        label="School code"
        placeholder="Enter your school code"
        autoComplete="organization"
        formik={formik}
        onChange={handleSchoolCodeChange}
      />
      <LoginField
        name="email"
        label="Email or username"
        placeholder="Enter your email or username"
        autoComplete="username"
        required
        formik={formik}
      />
      <Box data-login-password>
        <AuthPasswordField
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          formik={formik}
        />
      </Box>
    </>
  );
}
