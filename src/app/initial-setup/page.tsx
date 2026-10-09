import React from 'react';
import InitialSetupScreen from 'src/screens/initial-setup-screen';
import AuthRouteLayout from 'src/components/auth-route-layout';

export const dynamic = 'force-dynamic';
const InitialSetup = () => (
  <AuthRouteLayout>
    <InitialSetupScreen />
  </AuthRouteLayout>
);

export default InitialSetup;
