'use client';

import { usePathname } from 'next/navigation';
import { instituteSetupPaths } from 'src/constants/institute-setup';

import GlobalAcademicSearch from './index';

export default function RouteAwareAcademicSearch() {
  const pathname = usePathname();
  const isAcademicSetup = pathname?.replace(/\/+$/, '') === instituteSetupPaths.academicSetup;

  return isAcademicSetup ? null : <GlobalAcademicSearch />;
}
