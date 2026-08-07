'use client';

import type { HrPolicyAssignment, HrPolicyAssignmentConflict } from 'src/redux/hr/hr-policy-api';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  Accordion,
  Typography,
  LinearProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { EmptyRows, DrawerHeader, SectionTable } from './HRPolicySharedUI';
import { toLabel, formatDate, formatNumber } from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- PolicyImpactDrawer --------------------------------------------------------

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
    openAssignmentDrawer,
  } = ctx;

  const openConflictingAssignment = (conflict: HrPolicyAssignmentConflict) => {
    closeImpactDrawer();
    openAssignmentDrawer(
      {
        id: conflict.assignmentId,
        academicYearId: impactPreview?.academicYearId || '',
        targetType: conflict.targetType,
        targetKey: conflict.targetKey,
        targetDisplayName: conflict.targetDisplayName,
        payrollPolicyId: conflict.payrollPolicyId,
        attendancePolicyId: conflict.attendancePolicyId,
        leavePolicyId: conflict.leavePolicyId || '',
        effectiveFrom: conflict.effectiveFrom,
        effectiveTo: conflict.effectiveTo,
        priority: conflict.priority,
        isActive: true,
        assignmentReason: null,
      } as HrPolicyAssignment,
      'view'
    );
  };

  const displayedWarnings = [
    ...(impactPreview?.warnings ?? []),
    ...(impactPreview?.blockingWarnings ?? []).filter(
      (blockingWarning) =>
        !(impactPreview?.warnings ?? []).some(
          (warning) =>
            warning.code === blockingWarning.code && warning.message === blockingWarning.message
        )
    ),
  ];
  const warningCount = displayedWarnings.length + (impactPreview?.requiresConfirmation ? 1 : 0);
  const conflictCount = impactPreview?.effectiveAssignmentConflicts?.length ?? 0;
  const hasBlockingWarnings = Boolean(impactPreview?.blockingWarnings?.length);
  const summarySeverity = hasBlockingWarnings
    ? 'error'
    : impactPreview?.requiresConfirmation
      ? 'warning'
      : impactPreview?.warnings?.length
        ? 'info'
        : 'success';

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
        helpText="Preview how this action affects employees, assignments, versions, and risks before confirming."
        onClose={closeImpactDrawer}
        closeDisabled={isPolicyOperationActive}
      />
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {previewPolicyImpactState.isLoading || previewPolicyAssignmentImpactState.isLoading ? (
          <LinearProgress />
        ) : null}

        {/* -- Sticky top: alerts + chips + accordions -- */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, flexShrink: 0 }}>
          <Stack spacing={1.5}>
            {impactPreviewError ? <Alert severity="error">{impactPreviewError}</Alert> : null}
            {!impactPreview && !impactPreviewError ? (
              <Alert severity="info">Loading impact preview...</Alert>
            ) : null}
            {impactPreview?.resolutionSummary ? (
              <Alert severity="info" sx={{ py: 0.75 }}>
                {impactPreview.resolutionSummary}
              </Alert>
            ) : null}

            {impactPreview ? (
              <>
                {/* Summary chips - single row */}
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
                    label={`v${impactPreview.currentVersion ?? '-'} -> v${impactPreview.proposedVersion ?? '-'}`}
                  />
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

                {/* Warnings & Errors accordion */}
                {warningCount > 0 ? (
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      backgroundColor: (theme) =>
                        `${(theme.vars || theme).palette.background.neutral} !important`,
                      border: '1px solid',
                      borderColor: hasBlockingWarnings ? 'error.light' : 'warning.light',
                      borderRadius: '8px !important',
                      overflow: 'hidden',
                      '&:before': { display: 'none' },
                      '& .MuiAccordionSummary-root': {
                        backgroundColor: (theme) =>
                          `${(theme.vars || theme).palette.background.neutral} !important`,
                      },
                      '& .MuiAccordionDetails-root': {
                        backgroundColor: (theme) =>
                          `${(theme.vars || theme).palette.background.neutral} !important`,
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 44, py: 0 }}>
                      <Typography variant="subtitle2" color="text.primary">
                        {hasBlockingWarnings ? 'Errors' : 'Warnings'}&nbsp;
                        <Typography component="span" variant="caption" color="text.secondary">
                          ({warningCount})
                        </Typography>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
                      <Stack spacing={1}>
                        {displayedWarnings.map((warning) => (
                          <Alert
                            key={`${warning.code}-${warning.message}`}
                            severity={warning.severity === 'blocking' ? 'error' : warning.severity}
                            sx={{ py: 0.75 }}
                            action={
                              warning.conflict ? (
                                <Button
                                  color="inherit"
                                  size="small"
                                  onClick={() => openConflictingAssignment(warning.conflict!)}
                                >
                                  View conflict
                                </Button>
                              ) : undefined
                            }
                          >
                            <Stack spacing={0.5}>
                              <Typography variant="body2">{warning.message}</Typography>
                              {warning.conflict ? (
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
                                  Reference ID: {warning.conflict.assignmentId.substring(0, 8).toUpperCase()}
                                </Typography>
                              ) : null}
                            </Stack>
                          </Alert>
                        ))}
                        {impactPreview.requiresConfirmation ? (
                          <Alert
                            severity={hasBlockingWarnings ? 'error' : 'warning'}
                            sx={{ py: 0.75 }}
                          >
                            {hasBlockingWarnings
                              ? 'This action is blocked until the listed risks are resolved.'
                              : `Confirmation required${impactPreview.expiresAt ? ` before ${formatDate(impactPreview.expiresAt)}` : ''}.`}
                          </Alert>
                        ) : null}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ) : null}
                {impactPreview.riskSummary || impactPreview.recommendedAction ? (
                  <Alert severity={summarySeverity} sx={{ py: 0.75 }}>
                    {impactPreview.riskSummary || ''}
                    {impactPreview.riskSummary && impactPreview.recommendedAction ? ' ' : ''}
                    {impactPreview.recommendedAction || ''}
                  </Alert>
                ) : null}

                {/* Effective assignment conflicts accordion */}
                {conflictCount > 0 ? (
                  <Accordion
                    disableGutters
                    elevation={0}
                    sx={{
                      backgroundColor: (theme) =>
                        `${(theme.vars || theme).palette.background.neutral} !important`,
                      border: '1px solid',
                      borderColor: 'warning.light',
                      borderRadius: '8px !important',
                      overflow: 'hidden',
                      '&:before': { display: 'none' },
                      '& .MuiAccordionSummary-root': {
                        backgroundColor: (theme) =>
                          `${(theme.vars || theme).palette.background.neutral} !important`,
                      },
                      '& .MuiAccordionDetails-root': {
                        backgroundColor: (theme) =>
                          `${(theme.vars || theme).palette.background.neutral} !important`,
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 44, py: 0 }}>
                      <Typography variant="subtitle2" color="text.primary">
                        Effective Policy Conflicts&nbsp;
                        <Typography component="span" variant="caption" color="text.secondary">
                          ({conflictCount})
                        </Typography>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 2 }}>
                      <Stack spacing={1}>
                        {(impactPreview.effectiveAssignmentConflicts ?? [])
                          .slice(0, 5)
                          .map((conflict) => (
                            <Box
                              key={`${conflict.employeeId}-${conflict.date}`}
                              sx={{
                                p: 1.25,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                                border: (theme) =>
                                  `1px solid ${(theme.vars || theme).palette.divider}`,
                              }}
                            >
                              <Typography variant="body2" fontWeight={600} color="text.primary">
                                {conflict.employeeName || conflict.employeeId}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Winner:{' '}
                                {conflict.winningAssignment?.targetDisplayName ||
                                  conflict.winningAssignment?.targetKey ||
                                  '-'}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Candidates:{' '}
                                {conflict.candidateAssignments
                                  .map(
                                    (candidate) =>
                                      `${candidate.targetDisplayName || candidate.targetKey} (${toLabel(candidate.status)}: ${toLabel(candidate.skipReason)})`
                                  )
                                  .join(', ')}
                              </Typography>
                            </Box>
                          ))}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ) : null}
              </>
            ) : null}
          </Stack>
        </Box>

        {/* -- Scrollable: Affected Employees only -- */}
        {impactPreview ? (
          <>
            <Divider />
            <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Affected Employees&nbsp;
                <Typography component="span" variant="caption" color="text.secondary">
                  ({formatNumber(impactPreview.affectedEmployees?.length ?? 0)})
                </Typography>
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

        {/* -- Sticky footer: action buttons -- */}
        {pendingImpactAction ? (
          <>
            <Divider />
            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={1.5}
              sx={{ px: 2.5, py: 2, bgcolor: 'background.paper', flexShrink: 0 }}
            >
              <Button
                onClick={closeImpactDrawer}
                disabled={isPolicyOperationActive}
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:close" />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="warning"
                disabled={
                  Boolean(impactPreview?.blockingWarnings?.length) || isPolicyOperationActive
                }
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                loading={activePolicyOperation?.key === 'confirm-impact'}
                onClick={confirmPendingImpactAction}
                size="small"
              >
                Confirm {pendingImpactAction.label}
              </Button>
            </Stack>
          </>
        ) : null}
      </Box>
    </Drawer>
  );
}
