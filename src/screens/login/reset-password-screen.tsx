import { Suspense } from 'react';

import { AuthLayout } from './components/auth-layout';
import { ResetPasswordForm, ResetPasswordLoading } from './components/reset-password-form';

export default function ResetPasswordScreen() {
  return (
    <AuthLayout>
      <Suspense fallback={<ResetPasswordLoading />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
