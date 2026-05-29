'use client';

import type { PolicyStatus } from 'src/redux/hr/hr-policy-api';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Table,
  Button,
  Tooltip,
  MenuItem,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TextField,
  Typography,
  TableContainer,
} from '@mui/material';

import {
  PAYROLL_DAY_CALCULATION_OPTIONS,
  PAYROLL_SATURDAY_POLICY_OPTIONS,
} from '../hr-policy-workspace.constants';
import {
  EmptyRows,
  DrawerField,
  PolicySection,
  DrawerFormGrid,
  DrawerSelectField,
  DrawerSwitchField,
  PolicyDrawerLayout,
} from './HRPolicySharedUI';
import {
  toLabel,
  formatRange,
  numberOrNull,
  formatBasisDays,
  buildCalendarDaysMap,
  isValidManualDayCount,
  buildManualMonthDaysMap,
  buildPayrollBasisPreviewRows,
  normalizePayrollDayCalculationType,
} from '../hr-policy-workspace-utils';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// ─── PayrollPolicyDrawer ──────────────────────────────────────────────────────

export function PayrollPolicyDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    drawer,
    formError,
    payrollForm,
    setPayrollForm,
    currentPayrollUnchanged,
    createPayrollState,
    updatePayrollState,
    activePolicyOperation,
    activeCalendars,
    calendars,
    currentYear,
    canEditPolicy,
    canCreatePolicy,
    closeDrawer,
    savePayroll,
  } = ctx;

  if (!drawer || drawer.kind !== 'payroll') return null;

  const isCurrentSaveOperation =
    activePolicyOperation?.key === 'save-payroll' ||
    activePolicyOperation?.key === 'save-calendar' ||
    activePolicyOperation?.key === 'save-attendance' ||
    activePolicyOperation?.key === 'save-assignment';

  const selectedPayrollCalendar = calendars.find(
    (item) => item.id === payrollForm.workCalendarPolicyId
  );

  const payrollPreviewMode = normalizePayrollDayCalculationType(payrollForm.dayCalculationType);

  const payrollBasisPreviewRows = buildPayrollBasisPreviewRows({
    academicYearStart: currentYear?.startDate,
    academicYearEnd: currentYear?.endDate,
    calendar: selectedPayrollCalendar,
    dayCalculationType: payrollForm.dayCalculationType,
    saturdayWorkPolicy: payrollForm.saturdayWorkPolicy,
    manualMonthDays: payrollForm.manualMonthDays,
  });

  const payrollPreviewTotalBasis = payrollBasisPreviewRows.reduce(
    (total, row) => total + (row.basisDays ?? 0),
    0
  );

  const payrollPreviewMissingManualDays =
    payrollPreviewMode === 'manual-days' &&
    payrollBasisPreviewRows.some((row) => row.basisDays == null);

  const saturdayPolicyLabel =
    PAYROLL_SATURDAY_POLICY_OPTIONS.find(
      (option) => option.value === payrollForm.saturdayWorkPolicy
    )?.label || 'Full Day';

  const calendarDaysManualMap = buildCalendarDaysMap(currentYear?.startDate, currentYear?.endDate);

  const selectPayrollDayCalculationType = (value: string) => {
    setPayrollForm((current) => ({
      ...current,
      dayCalculationType: value,
      manualMonthDays:
        value === 'manual-days'
          ? buildManualMonthDaysMap({
              academicYearStart: currentYear?.startDate,
              academicYearEnd: currentYear?.endDate,
              existing: Object.keys(current.manualMonthDays).length
                ? current.manualMonthDays
                : calendarDaysManualMap,
            })
          : current.manualMonthDays,
    }));
  };

  const copyCalendarDaysToManualMonths = () => {
    setPayrollForm((current) => ({
      ...current,
      manualMonthDays: buildManualMonthDaysMap({
        academicYearStart: currentYear?.startDate,
        academicYearEnd: currentYear?.endDate,
        existing: calendarDaysManualMap,
      }),
    }));
  };

  return (
    <PolicyDrawerLayout
      title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Payroll Policy`}
      helpText="Configure how salary basis days are calculated for payroll preview, lock, and salary slips."
      error={formError}
      onClose={closeDrawer}
      onSave={savePayroll}
      disabled={
        drawer.mode === 'edit'
          ? !canEditPolicy || Boolean(currentPayrollUnchanged)
          : !canCreatePolicy
      }
      disabledReason={currentPayrollUnchanged ? 'No changes to save' : undefined}
      loading={createPayrollState.isLoading || updatePayrollState.isLoading}
      operation={isCurrentSaveOperation ? activePolicyOperation : null}
    >
      <PolicySection title="Policy Details">
        <DrawerFormGrid alignItems="center">
          <DrawerField label="Name *">
            <TextField
              fullWidth
              size="small"
              value={payrollForm.name}
              onChange={(event) =>
                setPayrollForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </DrawerField>
          <DrawerSelectField
            label="Status"
            value={payrollForm.status}
            onChange={(event) =>
              setPayrollForm((current) => ({
                ...current,
                status: event.target.value as PolicyStatus,
              }))
            }
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </DrawerSelectField>
          <DrawerSelectField
            label="Work Calendar *"
            value={payrollForm.workCalendarPolicyId}
            onChange={(event) =>
              setPayrollForm((current) => ({
                ...current,
                workCalendarPolicyId: event.target.value,
              }))
            }
          >
            {activeCalendars.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </DrawerSelectField>
          <DrawerSwitchField
            label="Default policy"
            checked={payrollForm.isDefault}
            disabled={payrollForm.status !== 'active'}
            onChange={(checked) =>
              setPayrollForm((current) => ({ ...current, isDefault: checked }))
            }
          />
        </DrawerFormGrid>
      </PolicySection>
      <PolicySection
        title="Payroll Day Calculation"
        description="Choose the salary proration basis for preview, lock, and slips."
      >
        <Stack spacing={1.75}>
          <DrawerFormGrid columns={3}>
            {PAYROLL_DAY_CALCULATION_OPTIONS.map((option) => {
              const selected = payrollPreviewMode === option.value;
              return (
                <Box key={option.value}>
                  <Paper
                    variant="outlined"
                    role="button"
                    tabIndex={0}
                    onClick={() => selectPayrollDayCalculationType(option.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectPayrollDayCalculationType(option.value);
                      }
                    }}
                    sx={{
                      p: 1.25,
                      height: 1,
                      minHeight: 84,
                      cursor: 'pointer',
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: (theme) =>
                        selected
                          ? theme.palette.mode === 'dark'
                            ? 'rgba(0, 167, 111, 0.1)'
                            : 'rgba(0, 167, 111, 0.06)'
                          : 'background.paper',
                      transition: (theme) =>
                        theme.transitions.create(['background-color', 'border-color'], {
                          duration: theme.transitions.duration.shortest,
                        }),
                      '&:hover': {
                        borderColor: selected ? 'primary.main' : 'text.secondary',
                        bgcolor: selected ? undefined : 'action.hover',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Iconify
                        icon={selected ? 'mdi:radiobox-marked' : 'mdi:radiobox-blank'}
                        color={selected ? 'primary.main' : 'text.secondary'}
                        width={19}
                      />
                      <Stack spacing={0.35}>
                        <Typography variant="subtitle2">{option.label}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.35 }}
                        >
                          {option.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Box>
              );
            })}
          </DrawerFormGrid>
          <Paper variant="outlined" sx={{ px: 1.25, py: 1, bgcolor: 'background.default' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack spacing={0.25}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography variant="subtitle2">Saturday</Typography>
                  <Chip size="small" variant="outlined" label={saturdayPolicyLabel} />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Applies only when Saturdays are working days.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {PAYROLL_SATURDAY_POLICY_OPTIONS.map((option) => {
                  const selected = payrollForm.saturdayWorkPolicy === option.value;
                  return (
                    <Tooltip key={option.value} title={option.description} arrow>
                      <Button
                        size="small"
                        variant={selected ? 'contained' : 'outlined'}
                        color={selected ? 'primary' : 'inherit'}
                        onClick={() =>
                          setPayrollForm((current) => ({
                            ...current,
                            saturdayWorkPolicy: option.value,
                          }))
                        }
                        sx={{ minWidth: 70, whiteSpace: 'nowrap' }}
                      >
                        {selected ? <Iconify icon="mdi:check" width={16} /> : null}
                        {option.label}
                      </Button>
                    </Tooltip>
                  );
                })}
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </PolicySection>
      <PolicySection
        title="Academic Year Preview"
        description="This preview estimates the payroll denominator used for proration. Final payroll may also depend on locked attendance and holiday overrides."
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={`Academic year: ${formatRange(currentYear?.startDate, currentYear?.endDate)}`}
            />
            <Chip size="small" variant="outlined" label={`Mode: ${toLabel(payrollPreviewMode)}`} />
            <Chip size="small" variant="outlined" label={`Saturday: ${saturdayPolicyLabel}`} />
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={`Total basis: ${formatBasisDays(payrollPreviewTotalBasis)}`}
            />
          </Stack>
          {payrollPreviewMode === 'manual-days' ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                Calendar days are filled by default. Edit only the months that need a different
                payroll basis.
              </Typography>
              <Button size="small" variant="outlined" onClick={copyCalendarDaysToManualMonths}>
                Copy calendar days
              </Button>
            </Stack>
          ) : null}
          {!selectedPayrollCalendar ? (
            <Alert severity="warning">
              Select a work calendar to preview working-day basis correctly.
            </Alert>
          ) : null}
          {payrollPreviewMissingManualDays ? (
            <Alert severity="warning">
              Manual Days mode needs valid payroll basis days for every month in the academic year.
            </Alert>
          ) : null}
          <TableContainer
            sx={{
              border: (theme) => `1px solid ${theme.vars.palette.divider}`,
              borderRadius: 1,
              maxHeight: 320,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    'Month',
                    'Calendar Days',
                    'Saturdays',
                    'Saturday Units',
                    'Working Units',
                    'Holiday Units Excluded',
                    'Payroll Basis Days',
                    'Calculation Source',
                  ].map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollBasisPreviewRows.length ? (
                  payrollBasisPreviewRows.map((row) => (
                    <TableRow
                      key={row.monthKey}
                      hover
                      sx={{ bgcolor: row.isCurrentMonth ? 'action.hover' : 'inherit' }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.monthLabel}</TableCell>
                      <TableCell>{row.calendarDays}</TableCell>
                      <TableCell>{row.saturdayCount}</TableCell>
                      <TableCell
                        sx={{
                          color:
                            payrollPreviewMode === 'working-days' ? 'primary.main' : 'text.primary',
                          fontWeight: payrollPreviewMode === 'working-days' ? 700 : 400,
                        }}
                      >
                        {formatBasisDays(row.saturdayUnits)}
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            payrollPreviewMode === 'working-days' ? 'primary.main' : 'text.primary',
                          fontWeight: payrollPreviewMode === 'working-days' ? 700 : 400,
                        }}
                      >
                        {formatBasisDays(row.workingUnits)}
                      </TableCell>
                      <TableCell>{formatBasisDays(row.holidayUnitsExcluded)}</TableCell>
                      <TableCell>
                        {payrollPreviewMode === 'manual-days' ? (
                          <TextField
                            size="small"
                            type="number"
                            value={payrollForm.manualMonthDays[row.monthKey] || ''}
                            error={
                              Boolean(payrollForm.manualMonthDays[row.monthKey]) &&
                              !isValidManualDayCount(
                                numberOrNull(payrollForm.manualMonthDays[row.monthKey])
                              )
                            }
                            inputProps={{ min: 1, max: 31, step: 1 }}
                            sx={{ width: 120 }}
                            onChange={(event) =>
                              setPayrollForm((current) => ({
                                ...current,
                                manualMonthDays: {
                                  ...current.manualMonthDays,
                                  [row.monthKey]: event.target.value,
                                },
                              }))
                            }
                          />
                        ) : (
                          <Typography variant="subtitle2">
                            {formatBasisDays(row.basisDays)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.source}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <EmptyRows
                    colSpan={8}
                    message="Select an academic year with valid start and end dates to preview payroll basis days."
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </PolicySection>
    </PolicyDrawerLayout>
  );
}
