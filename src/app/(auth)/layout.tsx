import type { ReactNode } from 'react';

import React from 'react';
import { redirect } from 'next/navigation';

import { getSession } from 'src/lib';
import { DashboardLayout } from 'src/layouts/dashboard';

import SubLayout from 'src/components/sub-layout';

const AuthLayout: React.FC<{ children: ReactNode }> = async ({ children }) => {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout session={{ access_token: session.access_token, userInfo: session.userInfo }}>
      <SubLayout>{children}</SubLayout>
    </DashboardLayout>
  );
};

export default AuthLayout;
