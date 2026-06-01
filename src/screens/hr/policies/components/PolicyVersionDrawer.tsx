'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import {
  cleanVersionDisplayValue,
  versionMatchesHistorySearch,
} from 'src/screens/hr/policies/hr-policy-ui-utils';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Drawer,
  Dialog,
  Select,
  Divider,
  Tooltip,
  MenuItem,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Typography,
  InputLabel,
  FormControl,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';

import { toLabel, formatDate, formatNumber } from '../hr-policy-workspace-utils';
import { EmptyRows, DrawerHeader, SectionTable, InfoTooltipIcon } from './HRPolicySharedUI';

import type { VersionDifference } from '../types/hr-policy-workspace.types';
import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// ─── PolicyVersionDrawer ───────────────────────────────────────────────────────

export function PolicyVersionDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    versionTarget,
    versionHistory,
    versionCompare,
    compareVersionIds,
    versionFilters,
    versionHistoryLoading,
    versionCompareLoading,
    isPolicyOperationActive,
    canClonePolicy,
    restoreVersionState,
    setVersionTarget,
    setCompareVersionIds,
    setVersionFilters,
    setRestoreVersion,
  } = ctx;

  const versions = versionHistory?.items || [];
  const filteredVersions = versions.filter((version) => {
    const matchesAction =
      versionFilters.action === 'all' || version.changeAction === versionFilters.action;
    const matchesSearch = versionMatchesHistorySearch(version, versionFilters.search);
    return matchesAction && matchesSearch;
  });

  const actions = Array.from(new Set(versions.map((v) => v.changeAction))).filter(Boolean);

  const groupedDifferences = (versionCompare?.differences || []).reduce(
    (groups, diff) => {
      const category = diff.category || 'Other changes';
      groups[category] = groups[category] || [];
      groups[category].push(diff);
      return groups;
    },
    {} as Record<string, VersionDifference[]>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={Boolean(versionTarget)}
        onClose={() => {
          if (!isPolicyOperationActive) setVersionTarget(null);
        }}
        PaperProps={{ sx: { width: { xs: '100%', md: 720 } } }}
      >
        <DrawerHeader
          title="Policy Versions"
          helpText="Review immutable policy snapshots, compare changes between versions, and restore a selected version as a new draft."
          onClose={() => setVersionTarget(null)}
          closeDisabled={isPolicyOperationActive}
        />
        <Divider />
        <Stack spacing={2} sx={{ p: 2.5 }}>
          {versionHistoryLoading || versionCompareLoading ? <LinearProgress /> : null}
          <Box gap={0.5} display="flex" alignItems="center">
            <Typography variant="subtitle1">{versionTarget?.policyName}</Typography>
            <InfoTooltipIcon title="Version history includes all published versions. Draft versions are not included." />
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label="Search history"
              value={versionFilters.search}
              onChange={(event) =>
                setVersionFilters((current) => ({ ...current, search: event.target.value }))
              }
              fullWidth
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Action</InputLabel>
              <Select
                label="Action"
                value={versionFilters.action}
                onChange={(event) =>
                  setVersionFilters((current) => ({ ...current, action: event.target.value }))
                }
              >
                <MenuItem value="all">All actions</MenuItem>
                {actions.map((action) => (
                  <MenuItem key={action} value={action}>
                    {toLabel(action)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <SectionTable columns={['Version', 'Action', 'Created', 'Reason', 'Actions']}>
            {filteredVersions.length ? (
              filteredVersions.map((version) => (
                <TableRow
                  key={version.id}
                  hover
                  selected={
                    compareVersionIds.from === version.id || compareVersionIds.to === version.id
                  }
                >
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">v{version.versionNumber}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {toLabel(version.status)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{toLabel(version.changeAction)}</TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2">{formatDate(version.creationTime)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {version.createdByName || 'Unknown user'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{version.changeReason || version.summary || '-'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Compare from this version">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCompareVersionIds((current) => ({ ...current, from: version.id }))
                        }
                      >
                        <Iconify icon="mdi:compare-horizontal" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Compare to this version">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setCompareVersionIds((current) => ({ ...current, to: version.id }))
                        }
                      >
                        <Iconify icon="mdi:compare" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Restore as draft">
                      <span>
                        <IconButton
                          size="small"
                          disabled={
                            !canClonePolicy ||
                            restoreVersionState.isLoading ||
                            isPolicyOperationActive
                          }
                          onClick={() =>
                            setRestoreVersion({
                              version,
                              name: `${version.name} v${version.versionNumber} Restore Draft`,
                              reason: '',
                            })
                          }
                        >
                          <Iconify icon="mdi:file-restore-outline" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <EmptyRows colSpan={5} message="No matching policy versions." />
            )}
          </SectionTable>

          {versionCompare ? (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">
                  Comparing v{versionCompare.fromVersion.versionNumber} to v
                  {versionCompare.toVersion.versionNumber}
                </Typography>
                {versionCompare.differences.length ? (
                  Object.entries(groupedDifferences).map(([category, differences]) => (
                    <Stack key={category} spacing={1}>
                      <Typography variant="subtitle2">{category}</Typography>
                      <SectionTable columns={['Field', 'From', 'To']}>
                        {differences.map((diff) => (
                          <TableRow key={`${category}-${diff.fieldKey || diff.field}`}>
                            <TableCell>{diff.fieldLabel || toLabel(diff.field)}</TableCell>
                            <TableCell sx={{ maxWidth: 240, wordBreak: 'break-word' }}>
                              {cleanVersionDisplayValue(diff.fromDisplayValue || diff.fromValue)}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 240, wordBreak: 'break-word' }}>
                              {cleanVersionDisplayValue(diff.toDisplayValue || diff.toValue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </SectionTable>
                    </Stack>
                  ))
                ) : (
                  <Alert severity="info">No differences found.</Alert>
                )}
              </Stack>
            </Paper>
          ) : versions.length >= 2 ? (
            <Alert severity="info">
              Latest change is compared automatically. Select different versions to compare another
              range.
            </Alert>
          ) : null}
        </Stack>
      </Drawer>
      <RestoreVersionDialog ctx={ctx} />
    </>
  );
}

// ─── RestoreVersionDialog ──────────────────────────────────────────────────────

function RestoreVersionDialog({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    restoreVersion,
    restorePreview,
    restorePreviewLoading,
    restoreVersionState,
    isPolicyOperationActive,
    setRestoreVersion,
    restoreVersionAsDraft,
  } = ctx;

  return (
    <Dialog
      open={Boolean(restoreVersion)}
      onClose={() => {
        if (!isPolicyOperationActive) setRestoreVersion(null);
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Restore Version As Draft</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {restorePreviewLoading ? <LinearProgress /> : null}
          <Alert severity="info">
            Restore creates a new draft. The current active policy is not changed.
          </Alert>
          {restorePreview ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Chip
                size="small"
                label={`${formatNumber(restorePreview.affectedEmployeeCount)} employees`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`${formatNumber(restorePreview.affectedAssignmentCount)} assignments`}
                variant="outlined"
              />
              {restorePreview.hasStalePayrollRisk ? (
                <Chip size="small" color="warning" label="Payroll risk" variant="outlined" />
              ) : null}
            </Stack>
          ) : null}
          {restorePreview?.warnings?.length ? (
            <Stack spacing={1}>
              {restorePreview.warnings.slice(0, 3).map((warning) => (
                <Alert
                  key={warning.code}
                  severity={warning.severity === 'blocking' ? 'error' : 'warning'}
                >
                  {warning.message}
                </Alert>
              ))}
            </Stack>
          ) : null}
          <TextField
            label="Draft name"
            value={restoreVersion?.name || ''}
            onChange={(event) =>
              setRestoreVersion((current) =>
                current ? { ...current, name: event.target.value } : current
              )
            }
            fullWidth
            required
          />
          <TextField
            label="Restore reason"
            value={restoreVersion?.reason || ''}
            onChange={(event) =>
              setRestoreVersion((current) =>
                current ? { ...current, reason: event.target.value } : current
              )
            }
            fullWidth
            required
            multiline
            minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRestoreVersion(null)} disabled={isPolicyOperationActive}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={restoreVersionState.isLoading || isPolicyOperationActive}
          disabled={!restoreVersion?.name.trim() || !restoreVersion?.reason.trim()}
          onClick={() => restoreVersion && restoreVersionAsDraft(restoreVersion.version)}
        >
          Create Draft
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
