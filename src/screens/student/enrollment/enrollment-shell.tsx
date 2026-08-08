'use client';

import type { ReactNode, MouseEvent } from 'react';

import { Box } from '@mui/material';
import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { EnrollmentWorkspaceProvider } from './admissions-crm/enrollment-workspace-context';
import { EnrollmentWorkspaceLoadingState } from './admissions-crm/workspace-table-patterns';

type Props = {
  children: ReactNode;
};

const EnrollmentShell = ({ children }: Props) => {
  const pathname = usePathname();

  const skipToWorkspace = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const workspace = document.getElementById('student-enrollment-content');
    if (!workspace) return;
    workspace.focus({ preventScroll: true });
    workspace.scrollIntoView({ block: 'start' });
  };

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
        Skip to Enrollment workspace
      </Box>
      <Box
        id="student-enrollment-content"
        component="section"
        tabIndex={-1}
        sx={{ minWidth: 0, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Suspense fallback={<EnrollmentWorkspaceLoadingState />}>
          <EnrollmentWorkspaceProvider>{children}</EnrollmentWorkspaceProvider>
        </Suspense>
      </Box>
    </Box>
  );
};

export default EnrollmentShell;
