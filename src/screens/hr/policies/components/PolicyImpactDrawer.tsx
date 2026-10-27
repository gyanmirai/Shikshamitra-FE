'use client';

import type { HrPolicyAssignmentConflict } from 'src/redux/hr/hr-policy-api';

import React from 'react';
import dayjs from 'dayjs';
import { GlobalIcons } from 'src/utils/icons';
import { hrPaths } from 'src/constants/hr-menus';
import { Iconify } from 'src/components/iconify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Drawer,
  Dialog,
  Divider,
  TableRow,
  TableCell,
  Accordion,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { cleanVersionDisplayValue } from '../hr-policy-ui-utils';
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
  } = ctx;

  const [selectedConflict, setSelectedConflict] = React.useState<HrPolicyAssignmentConflict | null>(
    null
  );
  const openConflictingAssignment = (conflict: HrPolicyAssignmentConflict) =>
    setSelectedConflict(conflict);
  React.useEffect(() => {
    if (!impactDrawerOpen) setSelectedConflict(null);
  }, [impactDrawerOpen]);

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
  const isPreviewLoading =
    previewPolicyImpactState.isLoading || previewPolicyAssignmentImpactState.isLoading;
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
        helpText="Preview how this action affects staff, assignments, versions, and risks before confirming."
        onClose={closeImpactDrawer}
        closeDisabled={isPolicyOperationActive}
      />
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        {/* -- Sticky top: alerts + chips + accordions -- */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            minHeight: 0,
            overflow: 'auto',
            flexShrink: 1,
            maxHeight: impactPreview ? '55%' : undefined,
          }}
        >
          <Stack spacing={1.5}>
            {impactPreviewError ? <Alert severity="error">{impactPreviewError}</Alert> : null}
            {isPreviewLoading ? (
              <HrLoadingNotice>Loading impact preview...</HrLoadingNotice>
            ) : !impactPreview && !impactPreviewError ? (
              <HrNotice>Impact preview is not loaded yet.</HrNotice>
            ) : null}
            {impactPreview?.resolutionSummary ? (
              <HrNotice severity="info" sx={{ py: 0.75 }}>
                {impactPreview.resolutionSummary}
              </HrNotice>
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
                    label={`${formatNumber(impactPreview.affectedEmployeeCount)} staff`}
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
                    key={`warnings-${impactPreview.confirmationToken || impactPreview.action}-${hasBlockingWarnings}`}
                    defaultExpanded={hasBlockingWarnings}
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
                          <HrNotice
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
                                <Typography
                                  variant="caption"
                                  sx={{ mt: 1, display: 'block', opacity: 0.8 }}
                                >
                                  Reference ID:{' '}
                                  {warning.conflict.assignmentId.substring(0, 8).toUpperCase()}
                                </Typography>
                              ) : null}
                            </Stack>
                          </HrNotice>
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
                  <HrNotice severity={summarySeverity} sx={{ py: 0.75 }}>
                    {impactPreview.riskSummary || ''}
                    {impactPreview.riskSummary && impactPreview.recommendedAction ? ' ' : ''}
                    {impactPreview.recommendedAction || ''}
                  </HrNotice>
                ) : null}

                {/* Effective assignment conflicts accordion */}
                {conflictCount > 0 ? (
                  <Accordion
                    key={`conflicts-${impactPreview.confirmationToken || impactPreview.action}`}
                    defaultExpanded
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
                        {(impactPreview.effectiveAssignmentConflicts ?? []).map((conflict) => (
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
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Current versus proposed rules</Typography>
                {impactPreview.ruleDifferencesStatus === 'calculated' ? (
                  impactPreview.ruleDifferences?.length ? (
                    <SectionTable columns={['Rule', 'Current', 'Proposed']}>
                      {impactPreview.ruleDifferences.map((difference) => (
                        <TableRow key={difference.fieldKey || difference.field}>
                          <TableCell>
                            {difference.fieldLabel || toLabel(difference.field)}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {cleanVersionDisplayValue(
                              difference.fromDisplayValue ?? difference.fromValue, { full: true }
                            )}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {cleanVersionDisplayValue(
                              difference.toDisplayValue ?? difference.toValue, { full: true }
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </SectionTable>
                  ) : (
                    <Typography variant="body2">No rule changes in the compared fields.</Typography>
                  )
                ) : (
                  <Typography variant="body2">
                    {impactPreview.ruleDifferencesStatus === 'new_policy'
                      ? 'New policy: there is no saved configuration to compare.'
                      : 'Rule comparison not calculated for this action.'}
                  </Typography>
                )}
              </Box>
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {[
                  [
                    'Affected Payroll Periods',
                    impactPreview.affectedPayrollMonths,
                    'Review and recompute required where indicated',
                  ],
                  [
                    'Locked Payroll Periods',
                    impactPreview.lockedPayrollMonths,
                    'Blocked: locked payroll must remain unchanged',
                  ],
                  [
                    'Attendance Evaluation Periods',
                    impactPreview.affectedAttendanceEvaluationMonths,
                    'Attendance evaluation may need recomputation',
                  ],
                ].map(([title, periods, description]) => (
                  <Box key={String(title)}>
                    <Typography variant="subtitle2">{String(title)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {String(description)}
                    </Typography>
                    {Array.isArray(periods) && periods.length ? (
                      periods.map((period) => {
                        const month = `${period.year}-${String(period.month).padStart(2, '0')}`;
                        const attendancePeriod = title === 'Attendance Evaluation Periods';
                        const canOpen = attendancePeriod
                          ? ctx.canOpenAttendanceRegister
                          : ctx.canOpenPayrollWorkbench;
                        const href = attendancePeriod
                          ? `${hrPaths.attendance.attendanceTracking}?startDate=${month}-01&endDate=${dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')}`
                          : `${hrPaths.payroll.runPayroll}?month=${month}`;
                        return (
                          <Stack
                            key={`${period.year}-${period.month}-${period.status}`}
                            spacing={0.5}
                          >
                            <Typography variant="body2">
                              {period.label ||
                                `${period.year}-${String(period.month).padStart(2, '0')}`}{' '}
                              — {period.status || 'Status unavailable'} ({period.count} records)
                            </Typography>
                            {canOpen ? (
                              <Button
                                component="a"
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                sx={{ alignSelf: 'flex-start' }}
                              >
                                Open {attendancePeriod ? 'attendance register' : 'payroll'} for{' '}
                                {period.label || month} (new tab)
                              </Button>
                            ) : null}
                          </Stack>
                        );
                      })
                    ) : (
                      <Typography variant="body2">None reported by this preview.</Typography>
                    )}
                  </Box>
                ))}
              </Stack>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Affected Staff&nbsp;
                <Typography component="span" variant="caption" color="text.secondary">
                  ({formatNumber(impactPreview.affectedEmployees?.length ?? 0)})
                </Typography>
              </Typography>
              <SectionTable
                tableId="hr-policy-affected-staff"
                tableTitle="Affected staff"
                columns={['Staff', 'Department', 'Type']}
              >
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
                  <EmptyRows colSpan={3} message="No staff found in preview." />
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
      <Dialog
        open={Boolean(selectedConflict)}
        onClose={() => setSelectedConflict(null)}
        aria-labelledby="assignment-conflict-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="assignment-conflict-title">Conflicting assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography>
              {selectedConflict?.targetDisplayName || selectedConflict?.targetKey}
            </Typography>
            <Typography>Scope: {toLabel(selectedConflict?.targetType || '')}</Typography>
            <Typography>
              Effective: {formatDate(selectedConflict?.effectiveFrom)} —{' '}
              {selectedConflict?.effectiveTo
                ? formatDate(selectedConflict.effectiveTo)
                : 'No end date'}
            </Typography>
            <Typography>Priority: {selectedConflict?.priority}</Typography>
            <Typography>
              Payroll: {selectedConflict?.payrollPolicyName || selectedConflict?.payrollPolicyId}
            </Typography>
            <Typography>
              Attendance:{' '}
              {selectedConflict?.attendancePolicyName || selectedConflict?.attendancePolicyId}
            </Typography>
            <Typography>
              Leave:{' '}
              {selectedConflict?.leavePolicyName ||
                selectedConflict?.leavePolicyId ||
                'Default fallback'}
            </Typography>
            <Typography variant="body2">
              Your proposed changes remain in the editor. Return to the impact preview to continue
              reviewing them.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedConflict(null)}>Return to impact</Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
