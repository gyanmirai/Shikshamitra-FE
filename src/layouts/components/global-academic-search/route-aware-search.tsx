'use client';

import { usePathname } from 'next/navigation';
import { settingPath, securityPath } from 'src/routes/paths';
import { financePaths } from 'src/constants/finance-menu';

import GlobalAcademicSearch from './index';

export default function RouteAwareAcademicSearch() {
  const pathname = usePathname();
  const hidesAcademicContext = [settingPath, securityPath].some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  const isFinanceDashboard = pathname?.replace(/\/$/, '') === financePaths.dashboard;

  return hidesAcademicContext ? null : <GlobalAcademicSearch hidden={isFinanceDashboard} />;
}
