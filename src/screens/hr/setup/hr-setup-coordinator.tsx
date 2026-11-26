'use client';

import type { RootState } from 'src/redux/store';

import dynamic from 'next/dynamic';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { hrSetupOperatorPermissions } from 'src/constants/hr-setup';
import { useGetHrSetupReadinessQuery } from 'src/redux/hr/hr-setup-readiness-api';

const Wizard = dynamic(() => import('./hr-setup-wizard'));

export function HrSetupCoordinator({
  savedReady,
  onChecked,
}: {
  savedReady?: boolean | null;
  onChecked?: () => void;
}) {
  const { user, loading, permissionsInitialized, permissions, sessionContext } = useSelector(
    (state: RootState) => state.auth
  );
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const profile = user?.profile ?? user;
  const tenantId = profile?.tenantid || sessionContext?.tenantId;
  const userId = profile?.sub || profile?.id;
  const yearId = currentYear?.id || '';
  const identity = JSON.stringify([tenantId, userId]);
  const key = JSON.stringify([tenantId, userId, yearId]);
  const [openContext, setOpenContext] = useState<{ identity: string; yearId: string } | null>(null);
  const allowed =
    !loading &&
    permissionsInitialized &&
    Boolean(tenantId && userId) &&
    hasGrantedPermission(permissions, hrSetupOperatorPermissions);
  const open =
    allowed &&
    openContext?.identity === identity &&
    (!openContext.yearId || openContext.yearId === yearId);
  const query = useGetHrSetupReadinessQuery(
    { contextKey: key, academicYearId: currentYear?.id },
    {
      skip: !open,
      refetchOnMountOrArgChange: true,
    }
  );
  useEffect(() => {
    setOpenContext((context) => {
      if (!allowed || !context || context.identity !== identity) return null;
      if (context.yearId && context.yearId !== yearId) return null;
      return context.yearId === yearId ? context : { identity, yearId };
    });
  }, [allowed, identity, yearId]);
  const close = () => {
    setOpenContext(null);
    if (query.currentData) onChecked?.();
  };
  if (!allowed) return null;
  return (
    <>
      <HrNotice
        action={
          <Button size="small" variant="outlined" onClick={() => setOpenContext({ identity, yearId })}>
            Check HR setup
          </Button>
        }
      >
        {savedReady === true
          ? 'HR setup is complete.'
          : savedReady === false
            ? 'Your school has HR setup items remaining.'
            : 'No current HR setup result for this academic year.'}
      </HrNotice>
      {open && (
        <Wizard
          key={key}
          readiness={query.currentData}
          error={query.isError}
          refreshing={query.isFetching}
          refresh={async () => {
            const result = await query.refetch();
            if (result.error || !result.data) throw new Error('Unable to check HR setup.');
            return result.data;
          }}
          onClose={close}
        />
      )}
    </>
  );
}
