'use client';

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import { academicPaths } from 'src/constants/academic-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { buildSeatingPlanListUrl } from '../utils/seating-plan-navigation';

interface GuidedSeatingPageShellProps {
  children: ReactNode;
  isPublished?: boolean;
  standardId?: string;
}

export function GuidedSeatingPageShell({
  children,
  isPublished = false,
  standardId,
}: GuidedSeatingPageShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listUrl = buildSeatingPlanListUrl(
    searchParams.get('standardId') ?? standardId,
    searchParams.get('status')
  );

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
        onBack={() => router.push(listUrl)}
        links={[
          { name: 'Academics', href: academicPaths.dashboard },
          { name: 'Examination' },
          { name: 'Seating plan', href: listUrl },
          { name: isPublished ? 'Published seating' : 'Guided setup' },
        ]}
      />
      {children}
    </Box>
  );
}
