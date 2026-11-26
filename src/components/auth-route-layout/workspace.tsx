'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import SubLayout from 'src/components/sub-layout';
import { DashboardLayout } from 'src/layouts/dashboard';
import PageTransition from 'src/components/page-transition';
import OnboardingProvider from 'src/components/onboarding/onboarding-provider';

export default function AuthenticatedWorkspace({ children }: { children: ReactNode }) {
  const isHost = useSelector(
    (state: RootState) => state.auth.sessionContext?.accountMode === 'host'
  );
  if (isHost)
    return (
      <DashboardLayout>
        <PageTransition>{children}</PageTransition>
      </DashboardLayout>
    );
  return (
    <OnboardingProvider>
      <DashboardLayout>
        <SubLayout>
          <PageTransition>{children}</PageTransition>
        </SubLayout>
      </DashboardLayout>
    </OnboardingProvider>
  );
}
