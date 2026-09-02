'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetSeatingPlanWorkspaceQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi';

import { normalizeWorkspace } from './normalize-workspace';
import { GuidedSeatingWorkspace } from './guided-seating-workspace';

export default function GuidedSeatingPage() {
  const router = useRouter();
  const params = useParams<{ examId: string }>();
  const searchParams = useSearchParams();
  const seatingPlanId = searchParams.get('planId') ?? undefined;
  const { currentData, isLoading, isFetching, isError, refetch } = useGetSeatingPlanWorkspaceQuery({
    examId: params.examId,
    seatingPlanId,
  });
  const normalizedWorkspace = useMemo(
    () => (currentData ? normalizeWorkspace(currentData) : undefined),
    [currentData]
  );
  const isPublished = normalizedWorkspace?.readiness.isPublished ?? false;

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading={isPublished ? 'Published seating' : 'Seating plan workspace'}
        description={
          isPublished
            ? 'Inspect the final room and seat assignments for this examination.'
            : 'Plan every subject, verify each seating arrangement, then publish the examination once.'
        }
        isBack
        onBack={() => router.push(academicPaths.examination.seatAllocation)}
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Examination' },
          { name: 'Seating plan', href: academicPaths.examination.seatAllocation },
          { name: isPublished ? 'Published seating' : 'Guided setup' },
        ]}
      />

      {isLoading || (isFetching && !currentData) ? (
        <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 520, borderRadius: 2 }} />
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
    </Box>
  );
}
