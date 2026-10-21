'use client';

import { useEffect } from 'react';
import { studentPaths } from 'src/constants/student-menu';
import { LoadingScreen } from 'src/components/loading-screen';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { admissionPipelineApplicationUrl } from './admission-pipeline-state';
import AdmissionApplicationDetailScreen from '../admission-application-detail';
import { getApplicationReturnUrl } from '../application-detail/application-return-url';

/** Retain legacy deep links while opening Pipeline-origin cases over their original worklist. */
export function AdmissionPipelineWorkspaceRoute() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const returnTo = getApplicationReturnUrl(params.get('returnTo'));
  const fromPipeline =
    !params.get('returnTo') ||
    returnTo === studentPaths.enrollment.pipeline ||
    returnTo.startsWith(`${studentPaths.enrollment.pipeline}?`);
  const destination = admissionPipelineApplicationUrl(
    id,
    new URLSearchParams(fromPipeline ? returnTo.split('?')[1] : undefined)
  );
  useEffect(() => {
    if (fromPipeline) router.replace(destination, { scroll: false });
  }, [destination, fromPipeline, router]);
  return fromPipeline ? <LoadingScreen /> : <AdmissionApplicationDetailScreen />;
}
