'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, AcademicYear } from 'src/types/school';

import { useSelector } from 'react-redux';
import { View403 } from 'src/sections/error';
import { Stack, Alert, Button } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { SplashScreen } from 'src/components/loading-screen';
import { canAccessAcademicRoute } from 'src/utils/academic-navigation-access';
import { AcademicModuleUiProvider } from 'src/screens/academic/components/AcademicModuleUiProvider';

import AcademicSetupWorkspace from './AcademicSetupWorkspace';
import { safeAcademicReturnTo } from './academic-setup-model';
import { academicSetupSettings } from './academic-setup-catalog';
import { useAcademicSetupVisit } from './use-academic-setup-visit';

function VisitedAcademicSetup({ tenantId, returnTo }: { tenantId: string; returnTo: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const visit = useAcademicSetupVisit(tenantId, params.toString(), returnTo);
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState) as {
    currentYear: Partial<AcademicYear>; currentMedium: Partial<Medium>;
  };
  if (visit.failed) return <Stack spacing={2} sx={{ p: 3 }}>
    <Alert severity="error">The school’s first-visit status could not be saved. Retry to open the guide.</Alert>
    <Stack direction="row" spacing={1}><Button variant="contained" color="inherit" size="small" onClick={visit.retry}>Retry</Button>
      <Button variant="outlined" color="inherit" size="small" onClick={() => router.push(returnTo)}>Exit setup</Button></Stack>
  </Stack>;
  if (!visit.ready) return <SplashScreen />;
  const key = `${tenantId}:${currentYear.id ?? ''}:${currentMedium.id ?? ''}`;
  return <AcademicModuleUiProvider><AcademicSetupWorkspace key={key} returnTo={returnTo}
    classes={currentMedium.educationMediumStages?.flatMap((stage) => stage.standards ?? []) ?? []}
    scope={{ tenantCacheKey: tenantId, academicYearId: currentYear.id ?? '', academicMediumId: currentMedium.id }} />
  </AcademicModuleUiProvider>;
}

export default function AcademicSetupScreen() {
  const params = useSearchParams();
  const { sessionContext, permissions, user } = useSelector((state: RootState) => state.auth);
  if (!sessionContext?.tenantId || !canAccessAcademicRoute('/academic/setup', permissions)) return <View403 />;
  const identity = `${sessionContext.tenantId}:${user?.sub ?? ''}`;
  const fallback = canAccessAcademicRoute('/academic/dashboard', permissions) ? '/academic/dashboard'
    : academicSetupSettings.find((setting) => canAccessAcademicRoute(setting.path, permissions))?.path ?? '/dashboard';
  return <VisitedAcademicSetup key={identity} tenantId={identity}
    returnTo={params.has('returnTo') ? safeAcademicReturnTo(params.get('returnTo')) : fallback} />;
}
