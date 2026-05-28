'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Drawer,
  Divider,
  TableRow,
  TableCell,
  Typography,
  LinearProgress,
} from '@mui/material';

import { EmptyRows, DrawerHeader, SectionTable } from './HRPolicySharedUI';
import { toLabel, formatDate, formatNumber } from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// ─── PolicyImpactDrawer ────────────────────────────────────────────────────────

export function PolicyImpactDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    impactDrawerOpen,
    impactPreview,
    impactPreviewError,
    pendingImpactAction,
    isPolicyOperationActive,
    activePolicyOperation,
    drawerTransitionDuration,
    previewPolicyImpactState,
    previewPolicyAssignmentImpactState,
    closeImpactDrawer,
    confirmPendingImpactAction,
  } = ctx;

  return (
    <Drawer
      anchor="right"
      open={impactDrawerOpen}
      onClose={closeImpactDrawer}
      transitionDuration={drawerTransitionDuration}
      PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}
    >
      <DrawerHeader
        title="Policy Impact"
        onClose={closeImpactDrawer}
        closeDisabled={isPolicyOperationActive}
      />
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {previewPolicyImpactState.isLoading || previewPolicyAssignmentImpactState.isLoading ? (
          <LinearProgress />
        ) : null}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Stack spacing={2.5}>
            {impactPreviewError ? <Alert severity="error">{impactPreviewError}</Alert> : null}
            {!impactPreview && !impactPreviewError ? (
              <Alert severity="info">Loading impact preview...</Alert>
            ) : null}
            {impactPreview ? (
              <>
                {/* Summary chips */}
                <Stack spacing={1}>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={toLabel(impactPreview.policyType)}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip size="small" label={toLabel(impactPreview.action)} variant="outlined" />
                    <Chip
                      size="small"
                      label={`v${impactPreview.currentVersion ?? '-'} → v${impactPreview.proposedVersion ?? '-'}`}
                    />
                  </Stack>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={`${formatNumber(impactPreview.affectedEmployeeCount)} employees`}
                    />
                    <Chip
                      size="small"
                      label={`${formatNumber(impactPreview.affectedAssignmentCount)} assignments`}
                    />
                    <Chip
                      size="small"
                      label={`${formatNumber(impactPreview.lockedPayrollMonths?.length)} locked months`}
                      color={impactPreview.lockedPayrollMonths?.length ? 'error' : 'default'}
                    />
                  </Stack>
                </Stack>

                {/* Warnings */}
                {(impactPreview.warnings?.length ?? 0) > 0 ||
                impactPreview.requiresConfirmation ||
                (impactPreview.effectiveAssignmentConflicts?.length ?? 0) > 0 ? (
                  <>
                    <Divider />
                    <Stack spacing={1}>
                      {impactPreview.warnings?.map((warning) => (
                        <Alert
                          key={`${warning.code}-${warning.message}`}
                          severity={warning.severity === 'blocking' ? 'error' : warning.severity}
                          sx={{ py: 0.75 }}
                        >
                          {warning.message}
                        </Alert>
                      ))}
                      {impactPreview.requiresConfirmation ? (
                        <Alert
                          severity={impactPreview.blockingWarnings?.length ? 'error' : 'warning'}
                          sx={{ py: 0.75 }}
                        >
                          {impactPreview.blockingWarnings?.length
                            ? 'This action is blocked until the listed risks are resolved.'
                            : `Confirmation required${impactPreview.expiresAt ? ` before ${formatDate(impactPreview.expiresAt)}` : ''}.`}
                        </Alert>
                      ) : null}
                      {impactPreview.effectiveAssignmentConflicts?.length ? (
                        <Alert severity="warning" sx={{ py: 0.75 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Effective policy conflicts
                          </Typography>
                          <Stack spacing={1}>
                            {impactPreview.effectiveAssignmentConflicts
                              .slice(0, 5)
                              .map((conflict) => (
                                <Box key={`${conflict.employeeId}-${conflict.date}`}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {conflict.employeeName || conflict.employeeId}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Winner:{' '}
                                    {conflict.winningAssignment?.targetDisplayName ||
                                      conflict.winningAssignment?.targetKey ||
                                      '-'}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Candidates:{' '}
                                    {conflict.candidateAssignments
                                      .map(
                                        (candidate) =>
                                          `${candidate.targetDisplayName || candidate.targetKey} (${candidate.status}: ${candidate.skipReason})`
                                      )
                                      .join(', ')}
                                  </Typography>
                                </Box>
                              ))}
                          </Stack>
                        </Alert>
                      ) : null}
                    </Stack>
                  </>
                ) : null}

                {/* Affected employees */}
                <Divider />
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Affected Employees
                  </Typography>
                  <SectionTable columns={['Employee', 'Department', 'Type']}>
                    {impactPreview.affectedEmployees?.length ? (
                      impactPreview.affectedEmployees.map((employee) => (
                        <TableRow key={employee.employeeId} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Typography variant="body2">
                                {employee.employeeName || employee.employeeId}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {employee.employeeCode}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{employee.department || '-'}</TableCell>
                          <TableCell>{employee.employeeType || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <EmptyRows colSpan={3} message="No employees found in preview." />
                    )}
                  </SectionTable>
                </Box>
              </>
            ) : null}
          </Stack>
        </Box>
        {pendingImpactAction ? (
          <>
            <Divider />
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ px: 2.5, py: 2, bgcolor: 'background.paper' }}
            >
              <Button onClick={closeImpactDrawer} disabled={isPolicyOperationActive}>
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                color="warning"
                disabled={
                  Boolean(impactPreview?.blockingWarnings?.length) || isPolicyOperationActive
                }
                loading={activePolicyOperation?.key === 'confirm-impact'}
                onClick={confirmPendingImpactAction}
              >
                Confirm {pendingImpactAction.label}
              </LoadingButton>
            </Stack>
          </>
        ) : null}
      </Box>
    </Drawer>
  );
}
