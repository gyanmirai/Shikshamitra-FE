'use client';

import type { ReactNode, MouseEvent } from 'react';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';

import { OnboardingConfigurationScopeSync } from './onboarding-configuration-scope-bar';

type StudentOnboardingShellProps = {
  children: ReactNode;
};

export default function StudentOnboardingShell({ children }: StudentOnboardingShellProps) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelectorAll<HTMLElement>('main').forEach((element) => {
      element.scrollTop = 0;
    });
  }, [pathname]);

  const skipToWorkspace = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const workspace = document.getElementById('student-onboarding-content');
    if (!workspace) return;
    workspace.focus({ preventScroll: true });
    workspace.scrollIntoView({ block: 'start' });
  };

  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OnboardingConfigurationScopeSync />
      <Box
        component="a"
        href="#student-onboarding-content"
        onClick={skipToWorkspace}
        sx={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          transform: 'translateY(-160%)',
          bgcolor: 'background.paper',
          color: 'text.primary',
          px: 1.5,
          py: 1,
          borderRadius: 1,
          boxShadow: 3,
          '&:focus-visible': { transform: 'translateY(0)' },
        }}
      >
        Skip to Student Onboarding workspace
      </Box>
      <Box
        id="student-onboarding-content"
        component="section"
        tabIndex={-1}
        sx={{
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
