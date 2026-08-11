import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { useEffect } from 'react';
import { Stack } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

type Props = {
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  section?: {
    name: string;
    href: string;
  };
  sx?: SxProps<Theme>;
};

export function EnrollmentWorkspaceHeader({ title, description, actions, section, sx }: Props) {
  const { state } = useEnrollmentWorkspace();
  const cycleQuery = state.cycle ? `?cycle=${encodeURIComponent(state.cycle)}` : '';

  useEffect(() => {
    document.title = `${title} | GyanMirai`;
  }, [title]);

  return (
    <CustomBreadcrumbs
      heading={title}
      headingComponent="h1"
      description={description}
      descriptionDisplay="tooltip"
      links={[
        { name: 'Student', href: studentPaths.dashboard },
        { name: 'Student Enrollment', href: `${studentPaths.enrollment.myWork}${cycleQuery}` },
        ...(section ? [{ name: section.name, href: `${section.href}${cycleQuery}` }] : []),
        { name: title },
      ]}
      action={
        actions ? (
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            sx={{ width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
          >
            {actions}
          </Stack>
        ) : undefined
      }
      slotProps={{
        action: {},
        heading: { overflowWrap: 'anywhere' },
        moreLink: {},
        breadcrumbs: { display: { xs: 'none', sm: 'block' } },
      }}
      sx={[
        {
          px: 2,
          py: { xs: 1.25, md: 0 },
          minHeight: { xs: 'auto', md: 56 },
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 1, md: 2 },
          overflow: 'visible',
          '& > .MuiBox-root': {
            width: { xs: '100%', md: 'auto' },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
