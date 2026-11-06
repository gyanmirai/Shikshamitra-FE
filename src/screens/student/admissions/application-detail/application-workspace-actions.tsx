import type { MouseEventHandler } from 'react';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Stack, Divider, IconButton } from '@mui/material';

type Props = {
  disabled: boolean;
  closeDisabled?: boolean;
  canViewActivity: boolean;
  historySelected: boolean;
  focused?: boolean;
  onActivity: () => void;
  onHistory: () => void;
  onFocus?: () => void;
  onClose: () => void;
};

export function ApplicationWorkspaceActions({
  disabled,
  closeDisabled = disabled,
  canViewActivity,
  historySelected,
  focused,
  onActivity,
  onHistory,
  onFocus,
  onClose,
}: Props) {
  const action = (
    label: string,
    icon: string,
    onClick: MouseEventHandler<HTMLButtonElement>,
    pressed?: boolean,
    blocked = disabled
  ) => (
    <CustomTooltip title={label} arrow placement="bottom">
      <span>
        <IconButton
          size="small"
          aria-label={label}
          aria-pressed={pressed}
          disabled={blocked}
          onClick={onClick}
          sx={{
            width: { xs: 44, sm: 36 },
            height: { xs: 44, sm: 36 },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Iconify icon={icon} width={20} />
        </IconButton>
      </span>
    </CustomTooltip>
  );
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" aria-label="Applicant Actions">
      {canViewActivity && action('Notes & Follow-Ups', 'mdi:note-text-outline', onActivity)}
      {action('Application History', 'mdi:history', onHistory, historySelected)}
      {onFocus &&
        action(
          focused ? 'Exit Focus Mode' : 'Focus Mode',
          focused ? 'mdi:arrow-collapse' : 'mdi:arrow-expand',
          onFocus,
          focused
        )}
      <Divider orientation="vertical" flexItem />
      {action('Close Application', 'mdi:close', onClose, undefined, closeDisabled)}
    </Stack>
  );
}
