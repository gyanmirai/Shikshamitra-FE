'use client';

import type { ReactNode } from 'react';

import { Box } from '@mui/material';
import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SplashScreen } from 'src/components/loading-screen';

import { EnrollmentWorkspaceProvider } from './admissions-crm/enrollment-workspace-context';

type Props = {
  children: ReactNode;
};

const EnrollmentShell = ({ children }: Props) => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelectorAll<HTMLElement>('main').forEach((element) => {
      element.scrollTop = 0;
    });
  }, [pathname]);

  return (
    <Box
      sx={{ minWidth: 0, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Box
        component="a"
        href="#student-enrollment-content"
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
        Skip to Enrollment workspace
      </Box>
      <Box
        id="student-enrollment-content"
        component="section"
        tabIndex={-1}
        sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Suspense fallback={<SplashScreen />}>
          <EnrollmentWorkspaceProvider>{children}</EnrollmentWorkspaceProvider>
        </Suspense>
      </Box>
    </Box>
  );
};

export default EnrollmentShell;
