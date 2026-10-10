'use client';

import { useEffect } from 'react';
import { LoadingScreen } from 'src/components/loading-screen';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import { getApplicationWorkspaceUrl } from './application-return-url';

export function ApplicationWorkspaceRedirect({
  applicationId,
  returnTo,
}: { applicationId?: string; returnTo?: string } = {}) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = applicationId ?? params.id;
  const destination = getApplicationWorkspaceUrl(id, returnTo ?? searchParams.get('returnTo'));
  useEffect(() => {
    router.replace(destination, { scroll: false });
  }, [router, destination]);
  return <LoadingScreen />;
}
