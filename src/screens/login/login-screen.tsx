import { LoginForm } from './components/login-form';
import { AuthLayout } from './components/auth-layout';
import { useLoginForm } from './hooks/use-login-form';
import { useLoginCompanion } from './hooks/use-login-companion';
import { LoginBrandPanel } from './components/login-brand-panel';
import { useLoginSceneMotion } from './hooks/use-login-scene-motion';

export default function LoginScreen() {
  const form = useLoginForm();
  const companion = useLoginCompanion({
    isSubmitting: form.formik.isSubmitting,
    loginSucceeded: form.loginSucceeded,
  });
  const motion = useLoginSceneMotion();

  return (
    <AuthLayout brandPanel={<LoginBrandPanel companion={{ state: companion.state, motion }} />}>
      <LoginForm form={form} onPasswordFocusChange={companion.onPasswordFocusChange} />
    </AuthLayout>
  );
}
