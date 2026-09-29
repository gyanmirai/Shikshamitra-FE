'use client';

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import { academicPaths } from 'src/constants/academic-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface GuidedSeatingPageShellProps {
  children: ReactNode;
  isPublished?: boolean;
}

export function GuidedSeatingPageShell({
  children,
  isPublished = false,
}: GuidedSeatingPageShellProps) {
  const router = useRouter();

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
      {children}
    </Box>
  );
}
