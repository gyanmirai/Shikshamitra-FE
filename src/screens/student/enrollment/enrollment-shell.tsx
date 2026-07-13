'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { Box, Paper, Stack, Button } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';

const enrollmentRoutes = [
  ['Pipeline', studentPaths.enrollment.pipeline, studentPermissions.enrollment.pipeline],
  ['Exams', studentPaths.enrollment.exams, studentPermissions.enrollment.exams],
  [
    'Registrations',
    studentPaths.enrollment.registrations,
    studentPermissions.enrollment.registrations,
  ],
  [
    'Offers & Seats',
    studentPaths.enrollment.offersSeats,
    studentPermissions.enrollment.offersSeats,
  ],
  ['Activation', studentPaths.enrollment.activation, studentPermissions.enrollment.activation],
  ['Operations', studentPaths.enrollment.operations, studentPermissions.enrollment.operations],
  ['Analytics', studentPaths.enrollment.analytics, studentPermissions.enrollment.analytics],
  ['Settings', studentPaths.enrollment.settings, studentPermissions.enrollment.settings],
] as const;

type Props = {
  children: ReactNode;
};

const EnrollmentShell = ({ children }: Props) => {
  const pathname = usePathname();
  const permissions = useSelector((state: RootState) => state.auth.permissions);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelectorAll<HTMLElement>('main').forEach((element) => {
      element.scrollTop = 0;
    });
  }, [pathname]);

  return (
    <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
      <Paper
        component="nav"
        aria-label="Student enrollment workspaces"
        variant="outlined"
        sx={{ px: 1, py: 0.75, borderRadius: 1, overflowX: 'auto' }}
      >
        <Stack direction="row" spacing={0.5} sx={{ minWidth: 'max-content' }}>
          {enrollmentRoutes.map(([label, href, permission]) =>
            hasGrantedPermission(permissions, permission) ? (
              <Button
                key={href}
                component={RouterLink}
                href={href}
                size="small"
                color={pathname === href ? 'primary' : 'inherit'}
                variant={pathname === href ? 'contained' : 'text'}
                aria-current={pathname === href ? 'page' : undefined}
              >
                {label}
              </Button>
            ) : null
          )}
        </Stack>
      </Paper>
      <Box component="section" sx={{ minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  );
};

export default EnrollmentShell;
