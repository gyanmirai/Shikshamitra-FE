'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { emptyDashboardResult } from './dashboard-api-source';
import { useDashboardDataSource, getDashboardDataSourceMode } from './dashboard-data-source';
import { getSessionRoles, isDashboardTemplate, resolveDashboardTemplate, getSessionDashboardTemplate } from './dashboard-template-resolver';

export function useMainDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { permissions, permissionsInitialized, initializationVersion, user, sessionContext } =
    useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const previewEnabled = process.env.NODE_ENV !== 'production' && searchParams.get('dashboardPreview') === 'true';
  const requestedTemplate = searchParams.get('dashboardTemplate');
  const template = resolveDashboardTemplate({ roles: getSessionRoles(session),
    explicitTemplate: previewEnabled && isDashboardTemplate(requestedTemplate)
      ? requestedTemplate : getSessionDashboardTemplate(session) });
  const academicYearId = typeof currentYear?.id === 'string' ? currentYear.id : '';
  const userId = typeof user?.sub === 'string' ? user.sub : '';
  const accessKey = `${sessionContext?.tenantId ?? ''}:${userId}:${initializationVersion}`;
  const contextKey = `${accessKey}:${academicYearId}:${template}`;
  const [selection, setSelection] = useState({ contextKey, studentId: '' });
  const studentId = selection.contextKey === contextKey ? selection.studentId : '';
  const authorized = status === 'authenticated' && permissionsInitialized && Boolean(userId && sessionContext?.tenantId) &&
    hasGrantedPermission(permissions, 'ShikshaMitra.Module.Dashboard');
  const hasContext = Boolean(academicYearId);
  const mode = getDashboardDataSourceMode(searchParams.get('dashboardDataSource'));
  const source = useDashboardDataSource({ template, academicYearId, accessKey, studentId: studentId || undefined,
    mode, enabled: authorized && hasContext });
  const data = authorized && hasContext ? source.data : emptyDashboardResult(template).data;
  const initializing = status === 'loading' || (status === 'authenticated' && !permissionsInitialized);
  const blockedMessage = initializing ? undefined : !authorized
    ? 'Dashboard access is unavailable for your current account. Contact your administrator to review access.'
    : !hasContext ? 'Select an academic year using the global academic context to load your dashboard.' : undefined;

  return { ...source, data, template, previewEnabled, permissions, initializing,
    authorized, hasContext, blockedMessage, studentId,
    retry: authorized && hasContext ? source.retry : undefined,
    selectStudent: (id: string) => setSelection({ contextKey, studentId: id }),
    selectTemplate: (value: string) => {
      if (!previewEnabled || !isDashboardTemplate(value)) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('dashboardTemplate', value);
      router.replace(`${pathname}?${params.toString()}`);
    } };
}
