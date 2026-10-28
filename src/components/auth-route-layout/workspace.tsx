'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import SubLayout from 'src/components/sub-layout';
import { DashboardLayout } from 'src/layouts/dashboard';
import PageTransition from 'src/components/page-transition';
import OnboardingProvider from 'src/components/onboarding/onboarding-provider';
import { HrSetupSessionProvider } from 'src/screens/hr/setup/hr-setup-session';

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
    <HrSetupSessionProvider>
      <OnboardingProvider>
        <DashboardLayout>
          <SubLayout>
            <PageTransition>{children}</PageTransition>
          </SubLayout>
        </DashboardLayout>
      </OnboardingProvider>
    </HrSetupSessionProvider>
  );
}
