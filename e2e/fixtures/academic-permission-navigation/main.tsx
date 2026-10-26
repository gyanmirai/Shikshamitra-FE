import type { GrantedPermission } from 'src/utils/permissions';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider, useSelector } from 'react-redux';
import { createTheme } from 'src/theme/create-theme';
import academicModule from 'src/constants/academic-menu';
import { defaultSettings } from 'src/components/settings';
import { NavSectionVertical } from 'src/components/nav-section';
import AcademicLayout from 'src/app/(auth-route)/academic/layout';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Alert, Stack, Button, Typography, CssBaseline } from '@mui/material';
import { getFirstAcademicPath, filterAcademicNavigation } from 'src/utils/academic-navigation-access';

import { navigate, usePathname } from './navigation';

const root = 'ShikshaMitra.Module.Academics';
const calendar = [root, `${root}.AcademicCalendar`, 'Academics.AcademicCalendar.CalendarManagement.View'];
const seating = [root, `${root}.Examination`, 'Academics.Examination.SeatAllocation.View'];
const asGrants = (names: string[]): GrantedPermission[] => names.map((name) => ({ name, isGranted: true }));
const initialState = { permissions: asGrants(calendar), permissionsInitialized: true, loading: false };
const store = configureStore({ reducer: {
  auth: (state: typeof initialState | undefined, action: { type: string; payload?: typeof initialState }) =>
    action.type === 'fixture/permissions' ? action.payload! : state ?? initialState,
} });
const setPermissions = (names: string[], loading = false) => store.dispatch({
  type: 'fixture/permissions',
  payload: { permissions: asGrants(names), loading, permissionsInitialized: !loading },
});

function Preview() {
  const { permissions, loading } = useSelector((state: ReturnType<typeof store.getState>) => state.auth);
  const { mode, setMode } = useColorScheme();
  const pathname = usePathname();
  const navigation = filterAcademicNavigation(academicModule()['/academic'][0].items, permissions);
  return <Box sx={{ p: { xs: 1.5, md: 3 } }}>
    <Typography variant="h5">Academic permission navigation</Typography>
    <Alert severity="info" sx={{ my: 2 }}>Synthetic permissions with the production navigation and route guard. No school data is loaded.</Alert>
    <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
      <Button onClick={() => { setPermissions(calendar); navigate('/academic/calendarManagement'); }}>Calendar access</Button>
      <Button onClick={() => { setPermissions(seating); navigate('/academic/seatallocation/exam-123/setup'); }}>Seating access</Button>
      <Button onClick={() => setPermissions([root])}>Revoke View</Button>
      <Button onClick={() => navigate('/academic/calendarAuditLogs')}>Open denied audit route</Button>
      <Button onClick={() => {
        navigate('/academic/calendarManagement');
        setPermissions([], true);
        window.setTimeout(() => setPermissions(calendar), 1500);
      }}>Reload permissions</Button>
      <Button onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>{mode === 'dark' ? 'Use light theme' : 'Use dark theme'}</Button>
    </Stack>
    <Typography data-testid="permission-status" sx={{ mb: 1 }}>{loading ? 'Loading permissions' : 'Permissions loaded'}</Typography>
    <Typography data-testid="academic-landing" sx={{ mb: 2 }}>Academics opens: {getFirstAcademicPath(navigation) ?? 'Hidden'}</Typography>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px minmax(0, 1fr)' }, gap: 2 }}>
      <Box component="aside" aria-label="Academic modules" sx={{ p: 1, border: 1, borderColor: 'divider', minWidth: 0 }}>
        <NavSectionVertical data={[{ subheader: 'Academic modules', items: navigation }]} isSubLayout />
      </Box>
      <Box component="main" sx={{ minWidth: 0, p: 2, border: 1, borderColor: 'divider' }}>
        <AcademicLayout><Typography data-testid="protected-content">Authorized Academic content: {pathname}</Typography></AcademicLayout>
      </Box>
    </Box>
  </Box>;
}

if (window.location.pathname === '/') navigate('/academic/calendarManagement', true);
createRoot(document.getElementById('root')!).render(
  <Provider store={store}><ThemeProvider theme={createTheme(defaultSettings)} defaultMode="light"><CssBaseline /><Preview /></ThemeProvider></Provider>
);
