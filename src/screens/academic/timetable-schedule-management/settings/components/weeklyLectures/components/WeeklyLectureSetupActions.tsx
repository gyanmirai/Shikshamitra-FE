'use client';

import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Typography } from '@mui/material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPaths, academicPermissions } from 'src/constants/academic-menu';

const SETUP_ACTIONS = {
  slots: {
    label: 'Configure lecture slots',
    href: academicPaths.timetable.settings.lectureSlots,
    permission: `${academicPermissions.timetable.settings.lectureSlots}.View`,
  },
  subjects: {
    label: 'Open subject allocation',
    href: academicPaths.curriculum.subjectsAssignment,
    permission: `${academicPermissions.curriculum.subjectsAssignment}.View`,
  },
};

export function WeeklyLectureSetupActions({
  setup,
  onRefresh,
  disabled = false,
}: {
  setup: keyof typeof SETUP_ACTIONS;
  onRefresh: () => unknown;
  disabled?: boolean;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const action = SETUP_ACTIONS[setup];

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {hasGrantedPermission(permissions, action.permission) && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            disabled={disabled}
            aria-label={`${action.label} (opens in a new tab)`}
            startIcon={<Iconify icon="mdi:open-in-new" width={18} />}
          >
            {action.label} (new tab)
          </Button>
        )}
        <Button
          type="button"
          size="small"
          color="inherit"
          disabled={disabled}
          onClick={onRefresh}
          startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
        >
          Refresh setup
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {hasGrantedPermission(permissions, action.permission)
          ? 'Complete setup in the new tab, then refresh here. Your lecture targets stay in this form.'
          : 'Ask an administrator to complete this setup, then refresh here.'}
      </Typography>
    </Stack>
  );
}
