'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Alert, Button } from '@mui/material';
import { useRef, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { SplashScreen } from 'src/components/loading-screen';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { academicPaths, academicSetupViewPermissions } from 'src/constants/academic-menu';
import {
  useAcademicSetupVisitStatusQuery,
  useRecordAcademicSetupVisitMutation,
} from 'src/redux/academic-setup/api';

import { safeAcademicReturnTo, getAcademicConfigurationSetting } from './academic-setup-model';

export default function AcademicSetupEntry({ children }: { children: ReactNode }) {
  const { sessionContext, user, permissions } = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const router = useRouter();
  const path = pathname.replace(/\/$/, '');
  const settingKey = getAcademicConfigurationSetting(path);
  const setupRoute = path === academicPaths.setup || path.startsWith(`${academicPaths.setup}/`);
  const identity = `${sessionContext?.tenantId ?? ''}:${user?.sub ?? ''}`;
  const eligible =
    sessionContext?.accountMode === 'tenant' &&
    Boolean(sessionContext.tenantId) &&
    Boolean(user?.sub) &&
    hasGrantedPermission(permissions, academicSetupViewPermissions);
  const ordinaryRoute = eligible && !settingKey && !setupRoute;
  const visitStatus = useAcademicSetupVisitStatusQuery(identity, {
    skip: !ordinaryRoute,
    refetchOnMountOrArgChange: true,
  });
  const [recordVisit, { isLoading: recordingVisit }] = useRecordAcademicSetupVisitMutation();
  const lastVisit = useRef<string | null>(null);
  const lastRedirect = useRef<string | null>(null);
  const [failedVisit, setFailedVisit] = useState<string | null>(null);
  const entryKey = `${identity}:${path}`;
  const writeFailure = Boolean(settingKey && failedVisit === entryKey);
  const readFailure = ordinaryRoute && visitStatus.isError;
  const shouldRedirect =
    ordinaryRoute &&
    !readFailure &&
    visitStatus.currentData?.canAccessSetup === true &&
    visitStatus.currentData.hasVisitedConfiguration === false;
  const returnTo = safeAcademicReturnTo(`${pathname}${search ? `?${search}` : ''}`);
  const redirectKey = `${identity}:${returnTo}`;

  useEffect(() => {
    if (!eligible || !settingKey) {
      lastVisit.current = null;
      return;
    }
    if (lastVisit.current === entryKey) return;
    lastVisit.current = entryKey;
    setFailedVisit(null);
    recordVisit({ settingKey })
      .unwrap()
      .catch(() => {
        if (lastVisit.current === entryKey) setFailedVisit(entryKey);
      });
  }, [eligible, settingKey, entryKey, recordVisit]);

  useEffect(() => {
    if (!shouldRedirect) {
      lastRedirect.current = null;
      return;
    }
    if (lastRedirect.current === redirectKey) return;
    lastRedirect.current = redirectKey;
    router.replace(
      `${academicPaths.setup}?source=automatic&returnTo=${encodeURIComponent(returnTo)}`
    );
  }, [shouldRedirect, redirectKey, returnTo, router]);

  const retry = () => {
    if (writeFailure && settingKey) {
      setFailedVisit(null);
      recordVisit({ settingKey })
        .unwrap()
        .catch(() => {
          if (lastVisit.current === entryKey) setFailedVisit(entryKey);
        });
    } else visitStatus.refetch();
  };

  if (ordinaryRoute && !readFailure && (!visitStatus.currentData || shouldRedirect)) {
    return <SplashScreen />;
  }
  return (
    <>
      {(readFailure || writeFailure) && (
        <Alert
          severity="warning"
          action={
            <Button
              size="small"
              color="inherit"
              disabled={recordingVisit || (readFailure && visitStatus.isFetching)}
              onClick={retry}
            >
              Try again
            </Button>
          }
        >
          {writeFailure
            ? 'We could not save this Academic setup visit. Your work is still available.'
            : 'We could not check Academic setup progress. You can continue using this page.'}
        </Alert>
      )}
      {children}
    </>
  );
}
