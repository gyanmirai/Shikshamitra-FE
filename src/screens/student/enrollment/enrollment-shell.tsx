'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { RouterLink } from 'src/routes/components';
import { Suspense, useState, useEffect } from 'react';
import MenuRounded from '@mui/icons-material/MenuRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { SplashScreen } from 'src/components/loading-screen';
import { usePathname, useSearchParams } from 'next/navigation';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import {
  Box,
  List,
  Paper,
  Stack,
  Button,
  Drawer,
  Divider,
  ListItem,
  IconButton,
  Typography,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { EnrollmentWorkspaceProvider } from './admissions-crm/enrollment-workspace-context';

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
  const searchParams = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const permittedRoutes = enrollmentRoutes.filter(([, , permission]) =>
    hasGrantedPermission(permissions, permission)
  );
  const isRouteActive = (href: string) =>
    href === studentPaths.enrollment.settings
      ? pathname.startsWith(`${href}/`) || pathname === href
      : pathname === href;
  const activeRoute = permittedRoutes.find(([, href]) => isRouteActive(href)) ?? permittedRoutes[0];
  const cycle = searchParams.get('cycle');
  const routeHref = (href: string) => (cycle ? `${href}?cycle=${encodeURIComponent(cycle)}` : href);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.querySelectorAll<HTMLElement>('main').forEach((element) => {
      element.scrollTop = 0;
    });
  }, [pathname]);

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  return (
    <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
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
      <Paper
        component="nav"
        aria-label="Student enrollment workspaces"
        variant="outlined"
        sx={{ px: 1, py: 0.75, borderRadius: 1 }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}
        >
          {permittedRoutes.map(([label, href]) => (
            <Button
              key={href}
              component={RouterLink}
              href={routeHref(href)}
              size="small"
              color={isRouteActive(href) ? 'primary' : 'inherit'}
              variant={isRouteActive(href) ? 'contained' : 'text'}
              aria-current={isRouteActive(href) ? 'page' : undefined}
              sx={{
                flexShrink: 0,
                ...(isRouteActive(href) && {
                  bgcolor: 'primary.darker',
                  '&:hover': { bgcolor: 'primary.dark' },
                }),
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Student Enrollment
            </Typography>
            <Typography variant="subtitle2" noWrap>
              {activeRoute?.[0] ?? 'Workspace'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Open Enrollment workspace menu"
            onClick={() => setMobileNavigationOpen(true)}
          >
            <MenuRounded />
          </IconButton>
        </Stack>
      </Paper>

      <Drawer
        anchor="bottom"
        open={mobileNavigationOpen}
        onClose={() => setMobileNavigationOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            maxHeight: 'min(78vh, 620px)',
            overscrollBehavior: 'contain',
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5}>
          <Box>
            <Typography variant="subtitle1">Enrollment Workspaces</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose an admissions workspace
            </Typography>
          </Box>
          <IconButton
            aria-label="Close Enrollment workspace menu"
            onClick={() => setMobileNavigationOpen(false)}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
        <Divider />
        <List disablePadding sx={{ py: 0.5 }}>
          {permittedRoutes.map(([label, href]) => (
            <ListItem key={href} disablePadding>
              <ListItemButton
                component={RouterLink}
                href={routeHref(href)}
                selected={isRouteActive(href)}
                aria-current={isRouteActive(href) ? 'page' : undefined}
                sx={{ minHeight: 48 }}
              >
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box id="student-enrollment-content" component="section" tabIndex={-1} sx={{ minWidth: 0 }}>
        <Suspense fallback={<SplashScreen />}>
          <EnrollmentWorkspaceProvider>{children}</EnrollmentWorkspaceProvider>
        </Suspense>
      </Box>
    </Box>
  );
};

export default EnrollmentShell;
