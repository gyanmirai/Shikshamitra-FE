import type { ReactNode } from 'react';

import React from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';

import SubLayout from 'src/components/sub-layout';

const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <DashboardLayout>
    <SubLayout>{children}</SubLayout>
  </DashboardLayout>
);

export default AuthLayout;
