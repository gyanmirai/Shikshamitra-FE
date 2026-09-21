'use client';

import type { RootState } from 'src/redux/store';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Stack, Button, Typography } from '@mui/material';

export function AdminDashboardDataScope() {
  const { currentYear, currentBoard, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  const workspaceContext = [currentYear?.name, currentBoard?.name, currentMedium?.name]
    .filter(Boolean)
    .join(' / ');

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'stretch', md: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.24)}`,
        bgcolor: (theme) => alpha(theme.palette.info.main, 0.06),
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            color: 'info.main',
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.12),
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:buildings-2-bold" width={22} />
        </Box>
        <Box>
          <Typography variant="subtitle2">Data scope: all classes and divisions</Typography>
          <Typography variant="body2" color="text.secondary">
            This admin view combines school-wide academic records. It is not limited to one class.
            {workspaceContext ? ` Workspace context: ${workspaceContext}.` : ''}
          </Typography>
        </Box>
      </Stack>

      <Button
        component={Link}
        href={academicPaths.studentAcademic360}
        variant="outlined"
        size="small"
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
        sx={{ minHeight: 40, flexShrink: 0 }}
      >
        Open class-level view
      </Button>
    </Stack>
  );
}
