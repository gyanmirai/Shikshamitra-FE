'use client';

import { usePathname } from 'next/navigation';
import { settingPath } from 'src/routes/paths';

import GlobalAcademicSearch from './index';

export default function RouteAwareAcademicSearch() {
  const pathname = usePathname();
  const isInstituteSetup = pathname === settingPath || pathname?.startsWith(`${settingPath}/`);

  return isInstituteSetup ? null : <GlobalAcademicSearch />;
}
