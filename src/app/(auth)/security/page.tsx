'use client';

import { useRouter } from 'next/navigation';

import { studentPath } from 'src/routes/paths';

import { navSubData } from 'src/layouts/config-nav-dashboard';

const Student = () => {
  const firstData = navSubData[studentPath as keyof typeof navSubData][0];
  const router = useRouter();
  router.replace(`${firstData?.items?.[0]?.path}`);
  return null;
};

export default Student;
