'use client';

import type { ReactNode } from 'react';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Paper, Button, TextField, Typography } from '@mui/material';

import type { StudentSetupView, StudentSetupTaskScope } from './student-setup-view';

export default function StudentSetupAssignmentToolbar({
  view,
  title,
  scope,
  pendingCount,
  onScopeChange,
  busy,
  unavailable = false,
  automaticCount,
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
  pendingCount: number;
  onScopeChange: (scope: StudentSetupTaskScope) => void;
  busy: boolean;
  unavailable?: boolean;
  automaticCount: number;
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
              <Label variant="soft" color={pendingCount ? 'warning' : 'success'}>
                {pendingCount} pending
              </Label>
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
                startIcon={<Iconify icon="mdi:account-switch-outline" />}
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
                      startIcon={<Iconify icon="mdi:content-save-outline" />}
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
                      startIcon={<Iconify icon="mdi:close" />}
                    >
                      Cancel Editing
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Iconify icon="mdi:auto-fix" />}
                      onClick={onAuto}
                      disabled={busy || unavailable || !automaticCount}
                    >
                      Auto
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Iconify icon="mdi:pencil-outline" />}
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
