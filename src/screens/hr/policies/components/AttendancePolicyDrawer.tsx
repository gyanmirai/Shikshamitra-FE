'use client';

import type { PolicyStatus } from 'src/redux/hr/hr-policy-api';

import React from 'react';
import { Box, Alert, MenuItem, TextField } from '@mui/material';

import {
  DrawerField,
  PolicySection,
  DrawerFormGrid,
  DrawerSelectField,
  DrawerSwitchField,
  PolicyDrawerLayout,
} from './HRPolicySharedUI';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// ─── helpers (module-level to avoid re-creation on render) ────────────────────

export const ATTENDANCE_MISSING_PUNCH_OPTIONS = [
  { label: 'Requires Review', value: 'requires_review' },
  { label: 'Mark Absent', value: 'mark_absent' },
  { label: 'Mark Half Day', value: 'mark_half_day' },
] as const;

function applyAttendanceAdvancedDefaults(
  form: HRPolicyWorkspaceContext['attendanceForm'],
  defaults: HRPolicyWorkspaceContext['attendanceForm']
): HRPolicyWorkspaceContext['attendanceForm'] {
  const ADVANCED_KEYS: Array<keyof HRPolicyWorkspaceContext['attendanceForm']> = [
    'graceTime',
    'maxLateAllowedPerMonth',
    'penaltyType',
    'penaltyCountThreshold',
    'earlyExitEnabled',
    'earlyExitGraceTime',
    'overtimeEnabled',
    'overtimeRate',
    'minOvertimeMinutes',
    'holidayWorkBehavior',
    'sandwichRuleEnabled',
    'payrollPreviewEnabled',
  ];
  return ADVANCED_KEYS.reduce((current, key) => ({ ...current, [key]: defaults[key] }), form);
}

// ─── AttendancePolicyDrawer ────────────────────────────────────────────────────

export function AttendancePolicyDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
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
                status: event.target.value as PolicyStatus,
              }))
            }
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </DrawerSelectField>
          <Box sx={{ gridColumn: { sm: 'span 2' } }}>
            <DrawerSelectField
              label="Work Calendar *"
              value={attendanceForm.workCalendarPolicyId}
              onChange={(event) =>
                setAttendanceForm((current) => ({
                  ...current,
                  workCalendarPolicyId: event.target.value,
                  isDefault:
                    event.target.value && current.status === 'active' ? true : current.isDefault,
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
            checked={attendanceForm.isDefault}
            disabled={attendanceForm.status !== 'active'}
            onChange={(checked) =>
              setAttendanceForm((current) => ({ ...current, isDefault: checked }))
            }
          />
        </DrawerFormGrid>
      </PolicySection>
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
      <Alert severity="info" sx={{ mb: 2 }}>
        Standard setup uses 75% for full day, 50% for half day, missing punches require review,
        manual correction is allowed, and payroll impact remains visible.
      </Alert>
      <PolicySection title="Exceptions">
        <DrawerFormGrid columns={3} rowGap={1} alignItems="center">
          <DrawerSelectField
            label="Missing Punch"
            help="Controls what happens when an employee has incomplete punch data for the day."
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
          <DrawerSwitchField
            compact
            label="Manual correction"
            help="Allows HR users to correct attendance records manually when punch data is wrong or incomplete."
            checked={attendanceForm.manualCorrectionAllowed}
            onChange={(checked) =>
              setAttendanceForm((current) => ({ ...current, manualCorrectionAllowed: checked }))
            }
          />
          <DrawerSwitchField
            compact
            label="Advanced settings"
            help="Show detailed attendance, penalty, overtime, holiday, and payroll integration rules. Turning this off uses the default rules."
            checked={attendanceAdvancedMode}
            onChange={(checked) => {
              setAttendanceAdvancedMode(checked);
              if (!checked) {
                // Revert advanced fields to defaults when toggling off
                setAttendanceForm((current) =>
                  applyAttendanceAdvancedDefaults(current, {
                    ...current,
                    graceTime: '0',
                    maxLateAllowedPerMonth: '0',
                    penaltyType: 'none',
                    penaltyCountThreshold: '0',
                    earlyExitEnabled: false,
                    earlyExitGraceTime: '0',
                    overtimeEnabled: false,
                    overtimeRate: '',
                    minOvertimeMinutes: '',
                    holidayWorkBehavior: 'comp_off',
                    sandwichRuleEnabled: false,
                    payrollPreviewEnabled: true,
                  })
                );
              }
            }}
          />
        </DrawerFormGrid>
      </PolicySection>
      {attendanceAdvancedMode ? (
        <PolicySection
          title="Advanced Rules"
          description="Detailed attendance, penalty, overtime, holiday, and payroll integration rules."
        >
          <DrawerFormGrid columns={3} alignItems="center">
            <DrawerField
              label="Absent threshold"
              help="Worked time percentage at or below this value is treated as absent."
            >
              <TextField {...getAttendanceNumericFieldProps('absentThresholdPercentage')} />
            </DrawerField>
            <DrawerField
              label="Late grace minutes"
              help="Late arrival minutes ignored before the employee is counted as late."
            >
              <TextField {...getAttendanceNumericFieldProps('graceTime')} />
            </DrawerField>
            <DrawerField
              label="Allowed late arrivals per month"
              help="Number of late arrivals allowed in a month before penalties can apply."
            >
              <TextField {...getAttendanceNumericFieldProps('maxLateAllowedPerMonth')} />
            </DrawerField>
            <DrawerSelectField
              label="Penalty"
              help="Attendance deduction applied after the configured late-arrival threshold is crossed."
              value={attendanceForm.penaltyType}
              onChange={(event) =>
                setAttendanceForm((current) => ({ ...current, penaltyType: event.target.value }))
              }
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="deduct_half_day">Half Day</MenuItem>
              <MenuItem value="deduct_full_day">Full Day</MenuItem>
            </DrawerSelectField>
            <DrawerField
              label="Late count before deduction"
              help="Number of qualifying late instances required before the selected penalty is applied."
            >
              <TextField {...getAttendanceNumericFieldProps('penaltyCountThreshold')} />
            </DrawerField>
            <DrawerSwitchField
              label="Early exit"
              help="Tracks employees leaving before the scheduled end time."
              checked={attendanceForm.earlyExitEnabled}
              onChange={(checked) =>
                setAttendanceForm((current) => ({ ...current, earlyExitEnabled: checked }))
              }
            />
            <DrawerSwitchField
              label="Overtime"
              help="Enables overtime calculation when employees work beyond the scheduled time."
              checked={attendanceForm.overtimeEnabled}
              onChange={(checked) =>
                setAttendanceForm((current) => ({ ...current, overtimeEnabled: checked }))
              }
            />
            <DrawerField
              label="Early exit grace minutes"
              help="Early departure minutes ignored before the exit is flagged."
            >
              <TextField {...getAttendanceNumericFieldProps('earlyExitGraceTime')} />
            </DrawerField>
            <DrawerField
              label="Minimum overtime minutes"
              help="Minimum extra minutes required before overtime is counted."
            >
              <TextField {...getAttendanceNumericFieldProps('minOvertimeMinutes')} />
            </DrawerField>
            <DrawerSelectField
              label="Overtime Rate"
              help="Optional rate or multiplier used by payroll when overtime is paid."
              value={attendanceForm.overtimeRate}
              onChange={(event) =>
                setAttendanceForm((current) => ({ ...current, overtimeRate: event.target.value }))
              }
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="1.5x">1.5x</MenuItem>
              <MenuItem value="2.0x">2.0x</MenuItem>
              <MenuItem value="flat">Flat</MenuItem>
            </DrawerSelectField>
            <DrawerSelectField
              label="Work on holiday"
              help="Defines how attendance on holidays should be handled."
              value={attendanceForm.holidayWorkBehavior}
              onChange={(event) =>
                setAttendanceForm((current) => ({
                  ...current,
                  holidayWorkBehavior: event.target.value,
                }))
              }
            >
              <MenuItem value="comp_off">Comp Off</MenuItem>
              <MenuItem value="ot_payout">Overtime</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </DrawerSelectField>
            <DrawerSwitchField
              label="Sandwich rule"
              help="Counts leave or absence between non-working days according to the organization's sandwich policy."
              checked={attendanceForm.sandwichRuleEnabled}
              onChange={(checked) =>
                setAttendanceForm((current) => ({ ...current, sandwichRuleEnabled: checked }))
              }
            />
            <DrawerSwitchField
              label="Show payroll impact"
              help="Allows payroll impact to be previewed from attendance and leave records."
              checked={attendanceForm.payrollPreviewEnabled}
              onChange={(checked) =>
                setAttendanceForm((current) => ({ ...current, payrollPreviewEnabled: checked }))
              }
            />
          </DrawerFormGrid>
        </PolicySection>
      ) : null}
    </PolicyDrawerLayout>
  );
}
