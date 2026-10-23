'use client';

import type { ReactNode } from 'react';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Paper, Button, Tooltip, Skeleton, TextField, Typography } from '@mui/material';

import type { StudentSetupView, StudentSetupTaskScope } from './student-setup-view';

export default function StudentSetupAssignmentToolbar({
  view,
  title,
  scope,
  pendingCount,
  pendingLoading = false,
  selectedCount = 0,
  onClearSelection,
  automaticDisabledReason,
  onScopeChange,
  busy,
  unavailable = false,
  automaticCount,
  automaticLoading = false,
  manualCount,
  manualEditing,
  changedCount,
  onAuto,
  onManual,
  onSave,
  onCancel,
  locks,
  needsReason,
  reason,
  reasonError,
  onReasonChange,
  onReasonBlur,
}: {
  view: Exclude<StudentSetupView, 'readiness'>;
  title: string;
  scope: StudentSetupTaskScope;
  pendingCount?: number;
  pendingLoading?: boolean;
  selectedCount?: number;
  onClearSelection?: () => void;
  automaticDisabledReason?: string;
  onScopeChange: (scope: StudentSetupTaskScope) => void;
  busy: boolean;
  unavailable?: boolean;
  automaticCount: number;
  automaticLoading?: boolean;
  manualCount: number;
  manualEditing: boolean;
  changedCount: number;
  onAuto: () => void;
  onManual: () => void;
  onSave: () => void;
  onCancel: () => void;
  locks?: ReactNode;
  needsReason: boolean;
  reason: string;
  reasonError?: string;
  onReasonChange: (value: string) => void;
  onReasonBlur: () => void;
}) {
  const assignments = view === 'division' || view === 'gr-number' || view === 'roll-number';
  const automaticHelp =
    automaticDisabledReason === 'Select one class and division for Auto.'
      ? undefined
      : automaticDisabledReason;
  return (
    <Paper variant="outlined" sx={{ p: 1, minWidth: 0, flexShrink: 0 }}>
      <Stack spacing={1}>
        <Box
          role="region"
          aria-label={`${title} controls`}
          tabIndex={0}
          sx={{ minWidth: 0, overflowX: 'auto' }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 'max-content' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {title}
              </Typography>
              {pendingLoading ? (
                <Skeleton width={72} aria-label="Loading pending count" />
              ) : pendingCount !== undefined ? (
                <Label variant="soft" color={pendingCount ? 'warning' : 'success'}>
                  {pendingCount} pending
                </Label>
              ) : null}
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flexShrink: 0, '& .MuiButton-root': { whiteSpace: 'nowrap', flexShrink: 0 } }}
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:account-switch-outline" width={18} />}
                onClick={() => onScopeChange(scope === 'all' ? 'pending' : 'all')}
                disabled={busy}
              >
                {scope === 'all' ? 'Remaining Students' : 'All Students'}
              </Button>
              {assignments &&
                (manualEditing ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon="mdi:content-save-outline" width={18} />}
                      onClick={onSave}
                      loading={busy}
                      disabled={unavailable || !changedCount}
                    >
                      Save ({changedCount})
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={onCancel}
                      disabled={busy}
                      startIcon={<Iconify icon="mdi:close" width={18} />}
                    >
                      Cancel Editing
                    </Button>
                  </>
                ) : (
                  <>
                    <Tooltip title={automaticHelp || ''}>
                      <Box component="span" sx={{ display: 'inline-flex' }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Iconify icon="mdi:auto-fix" width={18} />}
                          onClick={onAuto}
                          loading={automaticLoading}
                          disabled={busy || unavailable || !automaticCount}
                        >
                          Auto
                        </Button>
                      </Box>
                    </Tooltip>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:pencil-outline" width={18} />}
                      onClick={onManual}
                      disabled={busy || unavailable || !manualCount}
                    >
                      Manual
                    </Button>
                  </>
                ))}
              {locks}
            </Stack>
          </Stack>
        </Box>
        {view === 'division' && selectedCount > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            sx={{ px: 1, borderRadius: 1, bgcolor: 'action.selected' }}
          >
            <Typography variant="body2" role="status">
              {selectedCount} selected
            </Typography>
            <Button size="small" disabled={busy || manualEditing} onClick={onClearSelection}>
              Clear selection
            </Button>
          </Stack>
        )}
        {!manualEditing && automaticHelp && !busy && !unavailable && (
          <Typography variant="caption" color="text.secondary" role="status">
            {automaticHelp}
          </Typography>
        )}
        {manualEditing && needsReason && (
          <ShakingTextField error={Boolean(reasonError)}>
            <TextField
              name="reason"
              label="Reason for changing existing numbers"
              size="small"
              fullWidth
              required
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              onBlur={onReasonBlur}
              error={Boolean(reasonError)}
              helperText={reasonError}
              disabled={busy}
              inputProps={{ maxLength: 1000 }}
            />
          </ShakingTextField>
        )}
      </Stack>
    </Paper>
  );
}
