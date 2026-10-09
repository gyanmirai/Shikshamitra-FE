import AuthenticatedWorkspace from 'src/components/auth-route-layout/workspace';
import AuthRouteLayout from 'src/components/auth-route-layout';

// Protected application screens depend on per-request authentication and user state.
// Keep them out of static prerendering so production builds do not serialize a shared
// authenticated shell as public HTML.
export const dynamic = 'force-dynamic';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <AuthRouteLayout>
    <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
  </AuthRouteLayout>
);

export default AuthLayout;
