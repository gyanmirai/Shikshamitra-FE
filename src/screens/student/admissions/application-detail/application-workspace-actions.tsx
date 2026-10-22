import type { MouseEventHandler } from 'react';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Stack, Divider, IconButton } from '@mui/material';

type Props = {
  disabled: boolean;
  closeDisabled?: boolean;
  canViewActivity: boolean;
  journeyOpen: boolean;
  historySelected: boolean;
  focused?: boolean;
  onActivity: () => void;
  onHistory: () => void;
  onJourney: MouseEventHandler<HTMLButtonElement>;
  onFocus?: () => void;
  onClose: () => void;
};

export function ApplicationWorkspaceActions({
  disabled,
  closeDisabled = disabled,
  canViewActivity,
  journeyOpen,
  historySelected,
  focused,
  onActivity,
  onHistory,
  onJourney,
  onFocus,
  onClose,
}: Props) {
  const action = (
    label: string,
    icon: string,
    onClick: MouseEventHandler<HTMLButtonElement>,
    expanded?: boolean,
    pressed?: boolean,
    blocked = disabled
  ) => (
    <CustomTooltip title={label} arrow placement="bottom">
      <span>
        <IconButton
          size="small"
          aria-label={label}
          aria-haspopup={expanded === undefined ? undefined : 'dialog'}
          aria-expanded={expanded}
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
    <Stack direction="row" spacing={0.75} alignItems="center" aria-label="Applicant actions">
      {canViewActivity && action('Notes & Follow-ups', 'mdi:note-text-outline', onActivity)}
      {action('Application History', 'mdi:history', onHistory, undefined, historySelected)}
      {action('Admission journey', 'mdi:chart-timeline-variant', onJourney, journeyOpen)}
      {onFocus &&
        action(
          focused ? 'Exit focus mode' : 'Focus mode',
          focused ? 'mdi:arrow-collapse' : 'mdi:arrow-expand',
          onFocus,
          undefined,
          focused
        )}
      <Divider orientation="vertical" flexItem />
      {action('Close application', 'mdi:close', onClose, undefined, undefined, closeDisabled)}
    </Stack>
  );
}
