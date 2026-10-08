import type { StudentModuleDashboardLink } from 'src/redux/student/dashboard/student-module-dashboard-types';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, ButtonBase, Typography } from '@mui/material';
import { DashboardSectionCard } from 'src/screens/academic/AcademicDashboard/Components/DashboardSectionCard';

export default function StudentDashboardShortcuts({
  links,
}: {
  links: StudentModuleDashboardLink[];
}) {
  return (
    <DashboardSectionCard
      title="Quick links"
      subheader="Workspaces available with your current permissions"
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {links.map((link) => (
          <ButtonBase
            key={link.id}
            component={Link}
            href={link.href}
            prefetch={false}
            sx={{
              p: 1.5,
              minHeight: 80,
              textAlign: 'left',
              justifyContent: 'flex-start',
              gap: 1.5,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-focusVisible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            <Iconify icon={link.icon} width={24} sx={{ flexShrink: 0, color: 'text.secondary' }} />
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2">{link.label}</Typography>
              <Typography variant="caption" color="text.secondary">
                {link.description}
              </Typography>
            </Stack>
          </ButtonBase>
        ))}
      </Box>
    </DashboardSectionCard>
  );
}
