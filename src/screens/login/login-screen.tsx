import { LoginForm } from './components/login-form';
import { AuthLayout } from './components/auth-layout';

export default function LoginScreen() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
