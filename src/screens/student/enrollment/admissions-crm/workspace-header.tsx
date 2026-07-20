import type { ReactNode } from 'react';

import { Stack } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

type Props = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function EnrollmentWorkspaceHeader({ title, description, actions }: Props) {
  const { state } = useEnrollmentWorkspace();
  const cycleQuery = state.cycle ? `?cycle=${encodeURIComponent(state.cycle)}` : '';

  return (
    <CustomBreadcrumbs
      heading={title}
      description={description}
      links={[
        { name: 'Student', href: studentPaths.dashboard },
        { name: 'Student Enrollment', href: `${studentPaths.enrollment.overview}${cycleQuery}` },
        { name: title },
      ]}
      action={
        actions ? (
          <Stack direction="row" gap={1} flexWrap="wrap" sx={{ flexShrink: 0 }}>
            {actions}
          </Stack>
        ) : undefined
      }
      sx={{ px: 0, minHeight: 48 }}
    />
  );
}
