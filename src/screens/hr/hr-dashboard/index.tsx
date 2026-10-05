'use client';

import { useHRAccessKey } from 'src/hooks/use-hr-access-key';

import OperationalDashboard from './OperationalDashboard';

export default function HRDashboardScreen() {
  const accessKey = useHRAccessKey();
  return <OperationalDashboard key={accessKey} cacheIdentity={accessKey} />;
}
