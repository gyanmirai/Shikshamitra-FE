'use client';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Tooltip } from '@mui/material';

interface ElectiveAssignmentActionsProps {
  canManage: boolean;
  isLocked: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  canLock: boolean;
  lockTooltip: string;
  onViewInsights: () => void;
  onDiscard: () => void;
  onSaveDraft: () => void;
  onReviewLock: () => void;
}

export default function ElectiveAssignmentActions({
  canManage,
  isLocked,
  hasUnsavedChanges,
  isSaving,
  canLock,
  lockTooltip,
  onViewInsights,
  onDiscard,
  onSaveDraft,
  onReviewLock,
}: ElectiveAssignmentActionsProps) {
  return (
    <Box
      role="group"
      aria-label="Elective assignment actions"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: 1,
        width: 1,
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        startIcon={<Iconify icon="solar:chart-2-bold-duotone" />}
        onClick={onViewInsights}
      >
        View full insights
      </Button>

      {canManage && !isLocked && (
        <>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            disabled={!hasUnsavedChanges}
            onClick={onDiscard}
          >
            Discard
          </Button>

          <LoadingButton
            variant="contained"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={!hasUnsavedChanges}
            onClick={onSaveDraft}
            loading={isSaving}
          >
            Save Draft
          </LoadingButton>
        </>
      )}

      {canManage && (
        <Tooltip title={lockTooltip} arrow>
          <span>
            <Button
              variant="contained"
              size="small"
              startIcon={
                <Iconify icon={isLocked ? GlobalIcons.approvedIcon : GlobalIcons.lockIcon} />
              }
              disabled={!canLock}
              onClick={onReviewLock}
            >
              {isLocked ? 'Locked' : 'Review & Lock'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Box>
  );
}
