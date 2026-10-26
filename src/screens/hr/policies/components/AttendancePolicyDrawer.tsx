'use client';

import type { EditablePolicyStatus } from 'src/redux/hr/hr-policy-api';

import React, { useState } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { Box, Chip, Paper, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';

import { defaultAttendanceForm, ATTENDANCE_ADVANCED_KEYS } from '../hr-policy-workspace.constants';
import {
  DrawerField,
  PolicySection,
  DrawerFormGrid,
  DrawerSelectField,
  DrawerSwitchField,
  PolicyDrawerLayout,
} from './HRPolicySharedUI';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- helpers (module-level to avoid re-creation on render) --------------------

export const ATTENDANCE_MISSING_PUNCH_OPTIONS = [
  { label: 'Requires Review', value: 'requires_review' },
  { label: 'Mark Absent', value: 'mark_absent' },
  { label: 'Mark Half Day', value: 'mark_half_day' },
] as const;

export const ATTENDANCE_CAPTURE_MODE_OPTIONS = [
  { label: 'Manual status', value: 'manual_status' },
  { label: 'Manual with time', value: 'manual_with_time' },
  { label: 'Integrated', value: 'integrated' },
] as const;

export const ATTENDANCE_PENALTY_ACTION_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Warning', value: 'warning' },
  { label: 'Salary Deduction', value: 'salary_deduction' },
  { label: 'Half Day', value: 'deduct_half_day' },
  { label: 'Full Day', value: 'deduct_full_day' },
] as const;

export const ATTENDANCE_HOLIDAY_COMPENSATION_OPTIONS = [
  { label: 'No Benefit', value: 'no_benefit' },
  { label: 'Comp Off', value: 'comp_off' },
  { label: 'Overtime Pay', value: 'ot_payout' },
  { label: 'Both', value: 'both' },
  { label: 'Paid', value: 'paid' },
] as const;

export const ATTENDANCE_OVERTIME_CALCULATION_OPTIONS = [
  { label: 'Fixed Rate', value: 'flat' },
  { label: 'Multiplier (1.5x)', value: '1.5x' },
  { label: 'Multiplier (2x)', value: '2.0x' },
] as const;

const optionLabel = (
  options: readonly { label: string; value: string }[],
  value: string | null | undefined,
  fallback = 'None'
) => options.find((option) => option.value === value)?.label ?? fallback;

function buildAttendanceSummary(form: HRPolicyWorkspaceContext['attendanceForm']) {
  const penaltyLabel = optionLabel(ATTENDANCE_PENALTY_ACTION_OPTIONS, form.penaltyType);
  const holidayLabel = optionLabel(
    ATTENDANCE_HOLIDAY_COMPENSATION_OPTIONS,
    form.holidayWorkBehavior,
    'Comp Off'
  );
  const earlyExitSummary = form.earlyExitEnabled
    ? `Early exit tracking enabled after ${Number(form.earlyExitGraceTime || 0)} minutes grace`
    : 'Early exit tracking disabled';
  const holidaySummary =
    form.holidayWorkBehavior === 'paid'
      ? 'Holiday work is paid as regular work'
      : `Holiday work grants ${holidayLabel}`;
  const penaltyAmount = Number(form.penaltyDeductionAmount || 0);
  const penaltySummary =
    form.penaltyType === 'salary_deduction' && penaltyAmount > 0
      ? `${penaltyLabel} applies after ${Number(form.penaltyCountThreshold || 0)} violations at INR ${penaltyAmount} each`
      : `${penaltyLabel} applies after ${Number(form.penaltyCountThreshold || 0)} violations`;
  const summary = [
    `Staff receive ${Number(form.graceTime || 0)} minutes grace period`,
    `${Number(form.maxLateAllowedPerMonth || 0)} late arrivals allowed per month`,
    form.penaltyType === 'none' ? 'No late-arrival penalty configured' : penaltySummary,
    earlyExitSummary,
    form.overtimeEnabled
      ? `Overtime enabled from ${Number(form.minOvertimeMinutes || 0)} minutes`
      : 'Overtime disabled',
    holidaySummary,
  ];

  return summary;
}

// --- AttendancePolicyDrawer ----------------------------------------------------

export function AttendancePolicyDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const [resetOpen, setResetOpen] = useState(false);
  const {
    drawer,
    formError,
    attendanceForm,
    setAttendanceForm,
    attendanceAdvancedMode,
    setAttendanceAdvancedMode,
    currentAttendanceUnchanged,
    createAttendanceState,
    updateAttendanceState,
    activePolicyOperation,
    activeCalendars,
    canEditPolicy,
    canCreatePolicy,
    closeDrawer,
    saveAttendance,
    getAttendanceNumericFieldProps,
  } = ctx;

  if (!drawer || drawer.kind !== 'attendance') return null;

  const isCurrentSaveOperation =
    activePolicyOperation?.key === 'save-attendance' ||
    activePolicyOperation?.key === 'save-calendar' ||
    activePolicyOperation?.key === 'save-payroll' ||
    activePolicyOperation?.key === 'save-assignment';
  const isManualStatusMode = attendanceForm.captureMode === 'manual_status';
  const defaults = defaultAttendanceForm(attendanceForm.workCalendarPolicyId);
  const changedAdvancedKeys = ATTENDANCE_ADVANCED_KEYS.filter(
    (key) => attendanceForm[key] !== defaults[key]
  );
  const resetBusy = Boolean(activePolicyOperation);

  return (
    <PolicyDrawerLayout
      title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Attendance Policy`}
      helpText="Start with the standard school setup. Use Advanced Settings only when the school has special attendance rules."
      error={formError}
      onClose={closeDrawer}
      onSave={saveAttendance}
      disabled={
        drawer.mode === 'edit'
          ? !canEditPolicy || Boolean(currentAttendanceUnchanged)
          : !canCreatePolicy
      }
      disabledReason={currentAttendanceUnchanged ? 'No changes to save' : undefined}
      loading={createAttendanceState.isLoading || updateAttendanceState.isLoading}
      operation={isCurrentSaveOperation ? activePolicyOperation : null}
    >
      <PolicySection title="Policy Details">
        <DrawerFormGrid columns={3} alignItems="center">
          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <DrawerField label="Name *">
              <TextField
                fullWidth
                size="small"
                value={attendanceForm.name}
                onChange={(event) =>
                  setAttendanceForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </DrawerField>
          </Box>
          <DrawerSelectField
            label="Status"
            value={attendanceForm.status}
            onChange={(event) =>
              setAttendanceForm((current) => ({
                ...current,
                status: event.target.value as EditablePolicyStatus,
                isDefault: event.target.value === 'active' ? current.isDefault : false,
              }))
            }
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
          </DrawerSelectField>
          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <DrawerSelectField
              label="Work Calendar *"
              value={attendanceForm.workCalendarPolicyId}
              onChange={(event) =>
                setAttendanceForm((current) => ({
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
          </Box>
          <DrawerSwitchField
            compact
            label="Default policy"
            help="Applies to staff without an explicit staff or group assignment. Changing the calendar keeps this choice."
            checked={attendanceForm.isDefault}
            disabled={attendanceForm.status !== 'active'}
            onChange={(checked) =>
              setAttendanceForm((current) => ({ ...current, isDefault: checked }))
            }
          />
          <DrawerSelectField
            label="Attendance capture mode"
            help="Controls whether attendance is marked by status only, status with time, or integrated punch data."
            value={attendanceForm.captureMode}
            onChange={(event) =>
              setAttendanceForm((current) => ({
                ...current,
                captureMode: event.target.value as typeof current.captureMode,
              }))
            }
          >
            {ATTENDANCE_CAPTURE_MODE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </DrawerSelectField>
        </DrawerFormGrid>
      </PolicySection>
      {!isManualStatusMode && changedAdvancedKeys.length > 0 ? (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {!attendanceAdvancedMode ? <Chip size="small" label="Custom rules active" /> : null}
          <Button size="small" disabled={resetBusy} onClick={() => setResetOpen(true)}>
            Reset advanced rules
          </Button>
        </Stack>
      ) : null}
      <ConfirmDialog
        open={resetOpen}
        title="Reset Advanced Rules?"
        icon="warning"
        cancelText="Keep editing"
        disableBackdropClick
        disableCancel={resetBusy}
        disableEscapeKeyDown={resetBusy}
        onClose={() => {
          if (!resetBusy) setResetOpen(false);
        }}
        content={
          <Stack spacing={1}>
            <Typography variant="body2">
              These draft values will reset to the existing form defaults. Submit still requires the
              normal policy review.
            </Typography>
            {changedAdvancedKeys.map((key) => (
              <Typography variant="body2" key={key}>
                {key.replace(/([A-Z])/g, ' $1')}:{' '}
                {attendanceForm[key] === '' ? 'empty' : String(attendanceForm[key])} →{' '}
                {defaults[key] === '' ? 'empty' : String(defaults[key])}
              </Typography>
            ))}
          </Stack>
        }
        action={
          <Button
            size="small"
            color="warning"
            variant="contained"
            disabled={resetBusy}
            onClick={() => {
              if (resetBusy) return;
              setAttendanceForm((current) =>
                ATTENDANCE_ADVANCED_KEYS.reduce(
                  (next, key) => ({ ...next, [key]: defaults[key] }),
                  current
                )
              );
              setResetOpen(false);
            }}
          >
            Reset rules
          </Button>
        }
      />
      {!isManualStatusMode && (
        <PolicySection
          title="Attendance Thresholds"
          description="Set the worked-time percentages used to classify full-day and half-day attendance."
        >
          <DrawerFormGrid>
            <DrawerField
              label="Full day threshold"
              help="Minimum worked time percentage required to count the day as a full day."
            >
              <TextField {...getAttendanceNumericFieldProps('fullDayThresholdPercentage')} />
            </DrawerField>
            <DrawerField
              label="Half day threshold"
              help="Minimum worked time percentage required to count the day as a half day."
            >
              <TextField {...getAttendanceNumericFieldProps('halfDayThresholdPercentage')} />
            </DrawerField>
          </DrawerFormGrid>
        </PolicySection>
      )}
      {!isManualStatusMode && (
        <HrNotice severity="info" sx={{ mb: 2 }}>
          Showing or hiding rules keeps their current values. Review the policy summary and use the
          separate reset action only when you intend to replace custom advanced rules.
        </HrNotice>
      )}
      <PolicySection title="Exceptions">
        <DrawerFormGrid columns={3} rowGap={1} alignItems="center">
          {!isManualStatusMode && (
            <DrawerSelectField
              label="Missing Punch"
              help="Controls what happens when a staff member has incomplete punch data for the day."
              value={attendanceForm.missingPunchBehavior}
              onChange={(event) =>
                setAttendanceForm((current) => ({
                  ...current,
                  missingPunchBehavior: event.target.value,
                }))
              }
            >
              {ATTENDANCE_MISSING_PUNCH_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </DrawerSelectField>
          )}
          <DrawerSwitchField
            compact
            label="Manual correction"
            help="Allows HR users to correct attendance records manually when punch data is wrong or incomplete."
            checked={attendanceForm.manualCorrectionAllowed}
            onChange={(checked) =>
              setAttendanceForm((current) => ({ ...current, manualCorrectionAllowed: checked }))
            }
          />
          {!isManualStatusMode && (
            <DrawerSwitchField
              compact
              label="Advanced settings"
              help="Show or hide detailed attendance, penalty, overtime, holiday, and payroll integration rules. Hiding them keeps their current values."
              checked={attendanceAdvancedMode}
              onChange={setAttendanceAdvancedMode}
            />
          )}
        </DrawerFormGrid>
      </PolicySection>
      {!isManualStatusMode && attendanceAdvancedMode ? (
        <PolicySection
          title="Advanced Rules"
          description="Readable attendance behavior grouped by business rule."
        >
          <Stack spacing={2}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: 'primary.lighter',
                borderColor: 'primary.light',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.darker' }}>
                Attendance Policy Summary
              </Typography>
              <Stack spacing={0.75}>
                {buildAttendanceSummary(attendanceForm).map((item) => (
                  <Typography key={item} variant="body2" color="primary.darker">
                    - {item}
                  </Typography>
                ))}
              </Stack>
            </Paper>

            <DrawerFormGrid columns={2} alignItems="flex-start">
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2">Late Arrival Policy</Typography>
                  <DrawerField
                    label="Grace Period"
                    help="Late arrival minutes ignored before the staff is counted as late."
                  >
                    <TextField {...getAttendanceNumericFieldProps('graceTime')} />
                  </DrawerField>
                  <DrawerField
                    label="Monthly Late Allowance"
                    help="Number of late arrivals allowed in a month before penalties can apply."
                  >
                    <TextField {...getAttendanceNumericFieldProps('maxLateAllowedPerMonth')} />
                  </DrawerField>
                  <DrawerSelectField
                    label="Penalty Action"
                    help="Action applied after the configured late-arrival threshold is crossed."
                    value={attendanceForm.penaltyType}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        penaltyType: event.target.value,
                        penaltyDeductionAmount:
                          event.target.value === 'salary_deduction'
                            ? current.penaltyDeductionAmount
                            : '',
                      }))
                    }
                  >
                    {ATTENDANCE_PENALTY_ACTION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </DrawerSelectField>
                  {attendanceForm.penaltyType !== 'none' ? (
                    <DrawerField
                      label="Apply Penalty After"
                      help="Number of qualifying late instances required before the selected action is applied."
                    >
                      <TextField {...getAttendanceNumericFieldProps('penaltyCountThreshold')} />
                    </DrawerField>
                  ) : null}
                  {attendanceForm.penaltyType === 'salary_deduction' ? (
                    <DrawerField
                      label="Deduction Amount"
                      help="Payroll deduction amount charged for each qualifying late arrival."
                    >
                      <TextField {...getAttendanceNumericFieldProps('penaltyDeductionAmount')} />
                    </DrawerField>
                  ) : null}
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2">Early Exit Policy</Typography>
                  <DrawerSwitchField
                    compact
                    label="Track Early Exit"
                    help="Tracks staff leaving before the scheduled end time."
                    checked={attendanceForm.earlyExitEnabled}
                    onChange={(checked) =>
                      setAttendanceForm((current) => ({ ...current, earlyExitEnabled: checked }))
                    }
                  />
                  {attendanceForm.earlyExitEnabled ? (
                    <DrawerField
                      label="Grace Period"
                      help="Early departure minutes ignored before the exit is flagged."
                    >
                      <TextField {...getAttendanceNumericFieldProps('earlyExitGraceTime')} />
                    </DrawerField>
                  ) : null}
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2">Overtime Policy</Typography>
                  <DrawerSwitchField
                    compact
                    label="Enable Overtime"
                    help="Enables overtime calculation when staff work beyond the scheduled time."
                    checked={attendanceForm.overtimeEnabled}
                    onChange={(checked) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        overtimeEnabled: checked,
                        overtimeRate: checked ? current.overtimeRate || 'flat' : '',
                      }))
                    }
                  />
                  {attendanceForm.overtimeEnabled ? (
                    <>
                      <DrawerField
                        label="Minimum Overtime Minutes"
                        help="Minimum extra minutes required before overtime is counted."
                      >
                        <TextField {...getAttendanceNumericFieldProps('minOvertimeMinutes')} />
                      </DrawerField>
                      <DrawerField
                        label="Overtime Rate"
                        help="Business-facing rate currently selected for overtime."
                      >
                        <TextField
                          fullWidth
                          size="small"
                          value={optionLabel(
                            ATTENDANCE_OVERTIME_CALCULATION_OPTIONS,
                            attendanceForm.overtimeRate,
                            'Fixed Rate'
                          )}
                          disabled
                        />
                      </DrawerField>
                      <DrawerSelectField
                        label="Calculation Method"
                        help="How payroll should interpret overtime for this policy."
                        value={attendanceForm.overtimeRate || 'flat'}
                        onChange={(event) =>
                          setAttendanceForm((current) => ({
                            ...current,
                            overtimeRate: event.target.value,
                          }))
                        }
                      >
                        {ATTENDANCE_OVERTIME_CALCULATION_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </DrawerSelectField>
                    </>
                  ) : null}
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2">Holiday Rules</Typography>
                  <DrawerSelectField
                    label="Holiday Compensation"
                    help="Defines how work on holidays should be compensated."
                    value={attendanceForm.holidayWorkBehavior}
                    onChange={(event) =>
                      setAttendanceForm((current) => ({
                        ...current,
                        holidayWorkBehavior: event.target.value,
                      }))
                    }
                  >
                    {ATTENDANCE_HOLIDAY_COMPENSATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </DrawerSelectField>
                </Stack>
              </Paper>
            </DrawerFormGrid>

            <DrawerFormGrid columns={2}>
              <DrawerField
                label="Absence Conversion Threshold"
                help="Worked time percentage at or below this value is treated as absent."
              >
                <TextField {...getAttendanceNumericFieldProps('absentThresholdPercentage')} />
              </DrawerField>
            </DrawerFormGrid>
          </Stack>
        </PolicySection>
      ) : null}
    </PolicyDrawerLayout>
  );
}
