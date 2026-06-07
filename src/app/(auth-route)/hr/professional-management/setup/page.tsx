'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProfessionalManagementSetupPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hr/professional-management/settings/setup');
  }, [router]);

  return null;
};

export default ProfessionalManagementSetupPage;
