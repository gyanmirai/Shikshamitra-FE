'use client';

import type { RootState } from 'src/redux/store';

import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrSetupOperatorPermissions } from 'src/constants/hr-setup';
import { useGetHrSetupReadinessQuery } from 'src/redux/hr/hr-setup-readiness-api';

import { useHrSetupSession } from './hr-setup-session';

const Wizard = dynamic(() => import('./hr-setup-wizard'));

export function HrSetupCoordinator() {
  const { user, loading, permissionsInitialized, permissions, sessionContext } = useSelector(
    (state: RootState) => state.auth
  );
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const profile = user?.profile ?? user;
  const tenantId = profile?.tenantid || sessionContext?.tenantId;
  const userId = profile?.sub || profile?.id;
  const key = JSON.stringify([tenantId, userId, currentYear?.id || '']);
  const session = useHrSetupSession();
  const [closed, setClosed] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const allowed =
    !loading &&
    permissionsInitialized &&
    Boolean(tenantId && userId) &&
    hasGrantedPermission(permissions, hrSetupOperatorPermissions);
  const dismissed = closed === key || session.isDismissed(key);
  const query = useGetHrSetupReadinessQuery(
    { contextKey: key, academicYearId: currentYear?.id },
    {
      skip: !allowed || dismissed,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  useEffect(() => {
    setOpen(false);
    setClosed(null);
  }, [key]);
  useEffect(() => {
    if (!allowed || dismissed) {
      setOpen(false);
      return undefined;
    }
    if (open || !(query.isError || (query.currentData && !query.currentData.isReady)))
      return undefined;
    const showWhenUncovered = () => {
      const otherModal = Array.from(
        document.querySelectorAll(
          '[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]'
        )
      ).some((element) => !element.closest('[aria-hidden="true"]'));
      if (!otherModal) setOpen(true);
    };
    showWhenUncovered();
    const observer = new MutationObserver(showWhenUncovered);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden'],
    });
    return () => observer.disconnect();
  }, [allowed, dismissed, open, query.currentData, query.isError]);
  const close = () => {
    session.dismiss(key);
    setClosed(key);
    setOpen(false);
  };
  if (!allowed || dismissed || !open) return null;
  return (
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
  );
}
