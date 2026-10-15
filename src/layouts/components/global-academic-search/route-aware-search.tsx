'use client';

import { usePathname } from 'next/navigation';
import { settingPath, securityPath } from 'src/routes/paths';

import GlobalAcademicSearch from './index';

export default function RouteAwareAcademicSearch() {
  const pathname = usePathname();
  const hidesAcademicContext = [settingPath, securityPath].some(
    (path) => pathname === path || pathname?.startsWith(`${path}/`)
  );

  return hidesAcademicContext ? null : <GlobalAcademicSearch />;
}
