'use client';

import type { RootState } from 'src/redux/store';
import type { EmployeeApplication } from 'src/redux/hr/employeeOnboardingApi';

import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Box, Stack, Alert, Button, Skeleton, Typography } from '@mui/material';
import { useLazyGetEmployeeApplicationQuery } from 'src/redux/hr/employeeOnboardingApi';

import { FinalizeWorkflow } from './finalize-workflow';
import { canFinalizeEmployeeApplication } from './status';
import { FinalizePageHeader } from './finalize-page-header';
import { isEmployeeApplicationId, resolveOnboardingReturnHref } from './finalize-navigation';

const pageSx = {
  height: 1,
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const;
const finalizePermission = `${hrPermissions.employee.onboarding}.Finalize`;
const viewPermission = `${hrPermissions.employee.onboarding}.View`;

export default function FinalizeOnboardingPage({ applicationId }: { applicationId: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [returnHref, setReturnHref] = useState<string>(hrPaths.employee.onboarding);
  const returnTo = params.get('returnTo');
  useEffect(() => {
    setReturnHref(resolveOnboardingReturnHref(returnTo, window.location.origin));
  }, [returnTo]);
  const ready = auth.permissionsInitialized && !auth.loading;
  const permitted =
    hasGrantedPermission(auth.permissions, viewPermission) &&
    hasGrantedPermission(auth.permissions, finalizePermission);
  const scope = JSON.stringify([
    auth.user?.sub || auth.user?.id,
    auth.sessionContext?.tenantId,
    auth.initializationVersion,
  ]);
  const header = (
    <FinalizePageHeader
      applicationId={applicationId}
      returnHref={returnHref}
      onBack={() => router.push(returnHref)}
    />
  );

  if (!ready)
    return (
      <Box sx={pageSx}>
        {header}
        <Skeleton variant="rounded" height={240} aria-label="Loading onboarding access" />
      </Box>
    );
  if (!permitted)
    return (
      <Box sx={pageSx}>
        {header}
        <Alert severity="error">
          You do not have permission to finalize staff onboarding. Return to Staff Onboarding or ask
          your administrator to review your access.
        </Alert>
      </Box>
    );
  if (!isEmployeeApplicationId(applicationId))
    return (
      <Box sx={pageSx}>
        {header}
        <Alert severity="warning">
          This application link is invalid. Return to Staff Onboarding and choose an application.
        </Alert>
      </Box>
    );

  // A new application or authenticated scope owns a fresh query, form and in-memory draft.
  return (
    <FinalizeApplicationWorkspace
      key={`${scope}:${applicationId.toLowerCase()}`}
      applicationId={applicationId.toLowerCase()}
      returnHref={returnHref}
    />
  );
}

function FinalizeApplicationWorkspace({
  applicationId,
  returnHref,
}: {
  applicationId: string;
  returnHref: string;
}) {
  const router = useRouter();
  const [load, query] = useLazyGetEmployeeApplicationQuery({
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const request = useRef<ReturnType<typeof load> | null>(null);
  const [application, setApplication] = useState<EmployeeApplication>();
  const refresh = useCallback(() => {
    request.current?.abort();
    request.current?.unsubscribe();
    // Always make a scoped read on entry/retry; never initialize from a list row or stale cache.
    request.current = load(applicationId, false);
  }, [applicationId, load]);
  useEffect(() => {
    refresh();
    return () => {
      request.current?.abort();
      request.current?.unsubscribe();
    };
  }, [refresh]);

  const current =
    query.originalArgs === applicationId && query.currentData?.id?.toLowerCase() === applicationId
      ? query.currentData
      : undefined;
  const fresh = Boolean(current) && query.isSuccess && !query.isFetching && !query.isError;
  const status = query.error && 'status' in query.error ? query.error.status : undefined;
  const blocked = query.isError && [401, 403, 404].includes(Number(status));
  useEffect(() => {
    if (blocked) setApplication(undefined);
    else if (fresh && current && !application) setApplication(current);
  }, [blocked, fresh, current, application]);
  const candidate = current || application;
  const eligible = candidate && canFinalizeEmployeeApplication(candidate.status);

  if (!blocked && application && eligible) {
    return (
      <FinalizeWorkflow
        application={application}
        returnHref={returnHref}
        readReady={fresh}
        readError={query.isError || (!query.isFetching && !query.isUninitialized && !current)}
        onRetry={refresh}
        onFinalized={() => router.replace(returnHref)}
      />
    );
  }
  const loading =
    !blocked &&
    (!application || !candidate) &&
    (query.isUninitialized || query.isFetching || fresh);
  return (
    <Box sx={pageSx}>
      <FinalizePageHeader
        applicationId={applicationId}
        returnHref={returnHref}
        onBack={() => router.push(returnHref)}
      />
      {loading ? (
        <Stack spacing={2} aria-label="Loading onboarding application" aria-busy="true">
          <Skeleton height={60} />
          <Skeleton variant="rounded" height={240} />
        </Stack>
      ) : (
        <Alert severity={status === 404 || (candidate && !eligible) ? 'warning' : 'error'}>
          <Stack spacing={1} alignItems="flex-start">
            <Typography variant="body2">
              {status === 403 || status === 401
                ? 'This application is not available with your current access.'
                : status === 404
                  ? 'This application was not found or is no longer available.'
                  : candidate && !eligible
                    ? 'This application is not eligible for finalization. It may already be finalized, closed, or awaiting submission. Return to Staff Onboarding to review its current status.'
                    : 'Application details could not be loaded or verified. Try again.'}
            </Typography>
            {(!candidate || blocked) && (
              <Button type="button" size="small" onClick={refresh} disabled={query.isFetching}>
                Retry application
              </Button>
            )}
            {candidate?.finalizedEmployeeId && !blocked && (
              <Button
                size="small"
                href={`${hrPaths.employee.list}?${new URLSearchParams({ employee: candidate.finalizedEmployeeId })}`}
              >
                View staff
              </Button>
            )}
          </Stack>
        </Alert>
      )}
    </Box>
  );
}
