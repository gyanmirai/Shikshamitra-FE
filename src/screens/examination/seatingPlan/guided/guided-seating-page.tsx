'use client';

import { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetSeatingPlanWorkspaceQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi';

import { normalizeWorkspace } from './normalize-workspace';
import { GuidedSeatingWorkspace } from './guided-seating-workspace';
import { GuidedSeatingPageShell } from './guided-seating-page-shell';
import { GuidedSeatingWorkspaceSkeleton } from './guided-seating-workspace-skeleton';

export default function GuidedSeatingPage() {
  const params = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const seatingPlanId = searchParams.get('planId') ?? undefined;
  const { currentData, isLoading, isFetching, isError, refetch } = useGetSeatingPlanWorkspaceQuery({
    examId: params.examId,
    seatingPlanId,
  });
  /** Memoization Justification: preserve plan and room references while step query parameters
   * change, so editor effects do not reload or overwrite an in-progress draft. */
  const normalizedWorkspace = useMemo(
    () => (currentData ? normalizeWorkspace(currentData) : undefined),
    [currentData]
  );
  const isPublished = normalizedWorkspace?.readiness.isPublished ?? false;

  return (
    <GuidedSeatingPageShell isPublished={isPublished} standardId={normalizedWorkspace?.standardId}>
      {isLoading || (isFetching && !currentData) ? (
        <GuidedSeatingWorkspaceSkeleton />
      ) : isError || !normalizedWorkspace ? (
        <Alert severity="error" action={<Button onClick={() => refetch()}>Try again</Button>}>
          The seating workspace could not be loaded.
        </Alert>
      ) : (
        <GuidedSeatingWorkspace
          key={`${normalizedWorkspace.examId}-${seatingPlanId ?? 'new'}`}
          workspace={normalizedWorkspace}
        />
      )}
    </GuidedSeatingPageShell>
  );
}
