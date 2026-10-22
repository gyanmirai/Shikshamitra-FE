import type { FormikProps } from 'formik';

import { LoginField } from './login-field';
import { AuthPasswordField } from './auth-password-field';

import type { LoginValues } from '../hooks/use-login-form';

export function LoginCredentials({
  formik,
  hostLogin = false,
}: {
  formik: FormikProps<LoginValues>;
  hostLogin?: boolean;
}) {
  return (
    <>
      {!hostLogin && (
        <LoginField
          name="organization"
          label="School code"
          placeholder="Enter your school code"
          autoComplete="organization"
          required
          formik={formik}
        />
      )}
      <LoginField
        name="email"
        label="Email or username"
        placeholder="Enter your email or username"
        autoComplete="username"
        required
        formik={formik}
      />
      <AuthPasswordField
        name="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        formik={formik}
      />
    </>
  );
}
