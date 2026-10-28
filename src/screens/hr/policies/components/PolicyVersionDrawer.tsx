'use client';

import React from 'react';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { serverColumnFilters } from 'src/screens/hr/utils/server-column-filters';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { cleanVersionDisplayValue } from 'src/screens/hr/policies/hr-policy-ui-utils';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Drawer,
  Select,
  Divider,
  MenuItem,
  TableRow,
  TableCell,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  LinearProgress,
} from '@mui/material';

import { toLabel, formatDate, formatNumber } from '../hr-policy-workspace-utils';
import { EmptyRows, DrawerHeader, SectionTable, InfoTooltipIcon } from './HRPolicySharedUI';

import type { VersionDifference } from '../types/hr-policy-workspace.types';
import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- PolicyVersionDrawer -------------------------------------------------------

export function PolicyVersionDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    versionTarget,
    versionHistory,
    versionCompare: cachedVersionCompare,
    compareVersionIds,
    versionFilters,
    versionPage,
    setVersionPage,
    versionHistoryLoading,
    versionHistoryError,
    versionCompareError,
    versionCompareLoading,
    isPolicyOperationActive,
    canRestoreVersion,
    restoreVersionState,
    setVersionTarget,
    setCompareVersionIds,
    setVersionFilters,
    setRestoreVersion,
  } = ctx;

  const dataAvailable =
    !ctx.versionAccessUnavailable && !versionHistoryError && !versionCompareError;
  const versionCompare = dataAvailable ? cachedVersionCompare : undefined;
  const versions = dataAvailable ? versionHistory?.items || [] : [];
  const filteredVersions = versions;
  const exportVersions = useHrTableExport('hr-policy-versions', {
    policyType: versionTarget?.policyType,
    policyId: versionTarget?.policyId,
    search: versionFilters.search,
    action: versionFilters.action,
  });

  const actions = Array.from(
    new Set([
      'created',
      'edited',
      'cloned',
      'archived',
      'unarchived',
      'set-default',
      'set-default-cleared',
      'restore-draft',
      ...versions.map((version) => version.changeAction),
    ])
  ).filter(Boolean);
  const { columns: versionColumnDefinitions, ...versionTableFilters } = serverColumnFilters(
    ['versionNumber', 'changeAction', 'creationTime', 'changeReason', 'actions'].map((id) => ({
      id,
      label: id === 'changeAction' ? 'Action' : id,
    })),
    [
      {
        column: 'changeAction',
        query: 'action',
        emptyValue: 'all',
        options: actions.map((value) => ({ value, label: toLabel(value) })),
      },
    ],
    versionFilters,
    ({ action }) => {
      setVersionFilters((current) => ({ ...current, action: String(action ?? 'all') }));
      setVersionPage((current) => ({ ...current, number: 1 }));
    }
  );

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
          {!dataAvailable ? (
            <Alert severity="error">
              Could not load policy history or comparison. Close and retry.
            </Alert>
          ) : null}
          <Box gap={1} display="flex" alignItems="center">
            <Typography variant="subtitle1">
              {dataAvailable ? versionTarget?.policyName : 'Policy history unavailable'}
            </Typography>
            <InfoTooltipIcon title="History contains recorded snapshots. Existing leave policies enter history at their first lifecycle write; earlier history is not reconstructed." />
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
          <SectionTable
            columns={['Version', 'Action', 'Created', 'Reason', 'Actions']}
            columnIds={['versionNumber', 'changeAction', 'creationTime', 'changeReason', 'actions']}
            tableId="hr-policy-versions"
            columnDefinitions={versionColumnDefinitions.map(
              ({ label, ...definition }) => definition
            )}
            {...versionTableFilters}
            tableTitle={`${versionTarget?.policyName || 'Policy'} versions`}
            isPagination
            isLoading={versionHistoryLoading}
            serverSidePagination
            isSearch
            serverSideSearch
            page={versionPage.number - 1}
            rowsPerPage={versionPage.size}
            totalCount={dataAvailable ? versionHistory?.totalCount || 0 : 0}
            showExport={dataAvailable && versionTarget?.policyType !== 'leave'}
            onExport={versionTarget?.policyType === 'leave' ? undefined : exportVersions}
            onServerPagination={(number, size) => setVersionPage({ number, size })}
            searchTerm={versionFilters.search}
            searchFieldProps={{ placeholder: 'Search policy history' }}
            onServerSearch={(search) => setVersionFilters((current) => ({ ...current, search }))}
            {...ctx.versionTableProps}
          >
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
                    <AdaptiveThreeDotsActions
                      directActionLimit={2}
                      collapseOnOverflow={false}
                      moreLabel={`More actions for version ${version.versionNumber}`}
                      sx={{ justifyContent: 'flex-end' }}
                      actions={[
                        {
                          id: 'compare-from',
                          label: `Compare from version ${version.versionNumber}`,
                          icon: 'mdi:compare-horizontal',
                          onClick: () =>
                            setCompareVersionIds((current) => ({ ...current, from: version.id })),
                        },
                        {
                          id: 'compare-to',
                          label: `Compare to version ${version.versionNumber}`,
                          icon: 'mdi:compare',
                          onClick: () =>
                            setCompareVersionIds((current) => ({ ...current, to: version.id })),
                        },
                        ...(canRestoreVersion
                          ? [
                              {
                                id: 'restore',
                                label: 'Restore as draft',
                                icon: 'mdi:file-restore-outline',
                                disabled: restoreVersionState.isLoading || isPolicyOperationActive,
                                tooltip:
                                  restoreVersionState.isLoading || isPolicyOperationActive
                                    ? 'Wait for the current policy operation to finish.'
                                    : `Restore version ${version.versionNumber} as draft`,
                                onClick: () =>
                                  setRestoreVersion({
                                    version,
                                    name: `${version.name} v${version.versionNumber} Restore Draft`,
                                    reason: '',
                                  }),
                              },
                            ]
                          : []),
                      ]}
                    />
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
                  <HrNotice severity="info">No differences found.</HrNotice>
                )}
              </Stack>
            </Paper>
          ) : versions.length >= 2 ? (
            <HrNotice severity="info">
              Latest change is compared automatically. Select different versions to compare another
              range.
            </HrNotice>
          ) : null}
        </Stack>
      </Drawer>
      <RestoreVersionDrawer ctx={ctx} />
    </>
  );
}

// --- RestoreVersionDrawer ------------------------------------------------------

function RestoreVersionDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    restoreVersion: cachedRestoreVersion,
    restorePreview: cachedRestorePreview,
    restorePreviewLoading,
    restoreVersionState,
    isPolicyOperationActive,
    setRestoreVersion,
    restoreVersionAsDraft,
  } = ctx;
  const accessUnavailable =
    ctx.versionAccessUnavailable ||
    ctx.versionHistoryError ||
    ctx.versionCompareError ||
    ctx.restorePreviewError ||
    ctx.canRestoreVersion === false;
  const restoreVersion = accessUnavailable ? null : cachedRestoreVersion;
  const restorePreview = accessUnavailable ? null : cachedRestorePreview;
  const hasBlockingRestoreWarnings = Boolean(restorePreview?.blockingWarnings?.length);
  const displayedRestoreWarnings = [
    ...(restorePreview?.warnings ?? []),
    ...(restorePreview?.blockingWarnings ?? []).filter(
      (blockingWarning) =>
        !(restorePreview?.warnings ?? []).some(
          (warning) =>
            warning.code === blockingWarning.code && warning.message === blockingWarning.message
        )
    ),
  ];
  const restoreSummarySeverity = hasBlockingRestoreWarnings
    ? 'error'
    : restorePreview?.requiresConfirmation
      ? 'warning'
      : displayedRestoreWarnings.length
        ? 'info'
        : 'success';

  return (
    <Drawer
      anchor="right"
      open={Boolean(restoreVersion)}
      onClose={() => {
        if (!isPolicyOperationActive) setRestoreVersion(null);
      }}
      PaperProps={{
        'aria-label': 'Restore Version As Draft',
        sx: { width: { xs: '100%', sm: 'min(640px, 92vw)' }, maxWidth: '100%' },
      }}
    >
      <DrawerHeader
        title="Restore Version As Draft"
        helpText="Review the recorded version and provide a name and reason for the new draft."
        onClose={() => {
          if (!isPolicyOperationActive) setRestoreVersion(null);
        }}
        closeDisabled={isPolicyOperationActive}
      />
      <Divider />
      <Box
        component="fieldset"
        disabled={isPolicyOperationActive}
        sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto', border: 0, m: 0, p: 2.5 }}
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          {restorePreviewLoading ? <LinearProgress /> : null}
          <HrNotice severity="info">
            Restore creates a new draft. The current active policy is not changed.
          </HrNotice>
          {restorePreview && ctx.versionTarget?.policyType !== 'leave' ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Chip
                size="small"
                label={`${formatNumber(restorePreview.affectedEmployeeCount)} staff`}
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
          {displayedRestoreWarnings.length ? (
            <Stack spacing={1}>
              {displayedRestoreWarnings.slice(0, 3).map((warning) => (
                <Alert
                  key={`${warning.code}-${warning.message}`}
                  severity={warning.severity === 'blocking' ? 'error' : 'warning'}
                >
                  {warning.message}
                </Alert>
              ))}
            </Stack>
          ) : null}
          {restorePreview?.riskSummary || restorePreview?.recommendedAction ? (
            <HrNotice severity={restoreSummarySeverity}>
              {restorePreview.riskSummary || ''}
              {restorePreview.riskSummary && restorePreview.recommendedAction ? ' ' : ''}
              {restorePreview.recommendedAction || ''}
            </HrNotice>
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
      </Box>
      <Divider />
      <Stack
        direction="row"
        spacing={1.5}
        justifyContent="flex-end"
        sx={{ px: { xs: 2, sm: 3 }, py: 1.5, flexShrink: 0 }}
      >
        <Button
          size="small"
          onClick={() => setRestoreVersion(null)}
          disabled={isPolicyOperationActive}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          loading={restoreVersionState.isLoading || isPolicyOperationActive}
          disabled={
            !restoreVersion?.name.trim() ||
            !restoreVersion?.reason.trim() ||
            !restorePreview ||
            restorePreviewLoading ||
            hasBlockingRestoreWarnings
          }
          onClick={() => restoreVersion && restoreVersionAsDraft(restoreVersion.version)}
        >
          Create Draft
        </Button>
      </Stack>
    </Drawer>
  );
}
