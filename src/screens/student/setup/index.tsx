'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, AcademicYear } from 'src/types/school';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { Stack, Alert, Button } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { SplashScreen } from 'src/components/loading-screen';
import { StudentFeedbackScope } from 'src/screens/student/student-feedback-scope';

import StudentSetupWorkspace from './StudentSetupWorkspace';
import { useStudentSetupVisit } from './use-student-setup-visit';
import { canAccessStudentSetup, permittedStudentReturnTo } from './student-setup-model';

function VisitedStudentSetup({ identity, returnTo }: { identity: string; returnTo: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const visit = useStudentSetupVisit(identity, params.toString(), returnTo);
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState) as {
    currentYear: Partial<AcademicYear>; currentMedium: Partial<Medium>;
  };
  const { permissions } = useSelector((state: RootState) => state.auth);
  if (visit.failed) return <Stack spacing={2} sx={{ p: 3 }}>
    <Alert severity="error">The school’s first-visit status could not be saved. Retry to open the guide.</Alert>
    <Stack direction="row" spacing={1}>
      <Button variant="contained" color="inherit" size="small" onClick={visit.retry}>Retry</Button>
      <Button variant="outlined" color="inherit" size="small" onClick={() => router.push(returnTo)}>Exit setup</Button>
    </Stack>
  </Stack>;
  if (!visit.ready) return <SplashScreen />;
  const classes = currentMedium?.educationMediumStages?.flatMap((stage) => stage.standards ?? []) ?? [];
  const divisions = classes.reduce((sum, item) => sum + (item.divisions?.length ?? 0), 0);
  const prerequisite = !currentMedium?.id ? 'Select the academic year, board and medium above. Academic structure is maintained in Institute Setup.'
    : !classes.length || !divisions ? 'Review missing classes and divisions in Institute Setup before onboarding students.'
      : `${currentYear?.name ?? 'Selected academic year'} · ${currentMedium.name}: ${classes.length} classes and ${divisions} divisions are available. Review their coverage in Institute Setup.`;
  return <StudentFeedbackScope><StudentSetupWorkspace key={`${identity}:${currentYear?.id ?? ''}:${currentMedium?.id ?? ''}`}
    returnTo={returnTo} classes={classes} permissions={permissions} prerequisite={prerequisite}
    scope={{ tenantCacheKey: identity, academicYearId: currentYear?.id ?? '', academicMediumId: currentMedium?.id }} /></StudentFeedbackScope>;
}

export default function StudentSetupScreen() {
  const params = useSearchParams();
  const { sessionContext, permissions, user, loading, permissionsInitialized } = useSelector((state: RootState) => state.auth);
  if (loading || !permissionsInitialized) return <SplashScreen />;
  if (sessionContext?.accountMode !== 'tenant' || !sessionContext.tenantId || !user?.sub || !canAccessStudentSetup(permissions)) return <View403 />;
  const identity = `${sessionContext.tenantId}:${user.sub}`;
  return <VisitedStudentSetup key={identity} identity={identity} returnTo={permittedStudentReturnTo(params.get('returnTo'), permissions)} />;
}
