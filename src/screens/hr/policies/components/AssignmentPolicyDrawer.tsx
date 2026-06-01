'use client';

import type { HrPolicyAssignment } from 'src/redux/hr/hr-policy-api';

import React from 'react';
import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  Divider,
  MenuItem,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import {
  toLabel,
  formatRange,
  optionLabel,
  formatNumber,
  getErrorMessage,
} from '../hr-policy-workspace-utils';
import {
  DrawerField,
  DrawerHeader,
  SectionTable,
  DrawerFormGrid,
  DrawerSelectField,
  DrawerSwitchField,
} from './HRPolicySharedUI';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';
import type { PolicyAssignmentTargetType } from '../types/hr-policy-workspace.types';

// ─── AssignmentPreviewPanel ────────────────────────────────────────────────────

function AssignmentPreviewPanel({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    assignmentForm,
    assignmentPreview,
    assignmentPreviewLoading,
    assignmentPreviewError,
    payroll,
    attendance,
  } = ctx;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        p: 2,
        borderRadius: 1,
        bgcolor: (theme) => theme.vars.palette.background.neutral,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={700}>
            Assignment Preview
          </Typography>
          {assignmentPreviewLoading ? <Chip size="small" label="Resolving..." /> : null}
        </Stack>
        {assignmentPreviewError ? (
          <Alert severity="warning">
            {getErrorMessage(assignmentPreviewError, 'Could not resolve this assignment preview.')}
          </Alert>
        ) : null}
        <Box>
          <Typography variant="caption" color="text.secondary">
            This assignment applies to
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {assignmentForm.targetDisplayName || assignmentForm.targetKey || '-'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {toLabel(assignmentForm.targetType)} ·{' '}
            {formatRange(assignmentForm.effectiveFrom, assignmentForm.effectiveTo)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            size="small"
            label={`Payroll: ${
              payroll.find((item) => item.id === assignmentForm.payrollPolicyId)?.name || '-'
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`Attendance: ${
              attendance.find((item) => item.id === assignmentForm.attendancePolicyId)?.name || '-'
            }`}
            color="success"
            variant="outlined"
          />
        </Stack>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Current effective policy
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {assignmentPreview?.policySource
              ? `${toLabel(assignmentPreview.policySource)} scope`
              : `${toLabel(assignmentForm.targetType)} scope`}
            {assignmentPreview?.matchedPriority != null
              ? ` · Priority ${assignmentPreview.matchedPriority}`
              : assignmentForm.priority
                ? ` · Priority ${assignmentForm.priority}`
                : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {assignmentPreview?.matchedTargetDisplayName ||
              assignmentPreview?.matchedTargetKey ||
              assignmentForm.targetDisplayName ||
              assignmentForm.targetKey ||
              'No matching scope selected yet'}
          </Typography>
        </Box>
        {assignmentPreview?.resolutionSteps?.length ? (
          <Box>
            <SectionTable columns={['Scope', 'Target', 'Status', 'Reason', 'Priority']}>
              {assignmentPreview.resolutionSteps.map((step, index) => (
                <TableRow key={`${step.source}-${step.targetKey || index}`} hover>
                  <TableCell>{toLabel(step.targetType || step.source)}</TableCell>
                  <TableCell>{step.targetDisplayName || step.targetKey || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={toLabel(step.status)}
                      color={step.status === 'matched' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{toLabel(step.skipReason)}</TableCell>
                  <TableCell>{step.priority ?? '-'}</TableCell>
                </TableRow>
              ))}
            </SectionTable>
          </Box>
        ) : null}
        <Divider />
        <Typography variant="caption" color="text.secondary">
          Precedence: Employee &gt; Shift &gt; Role &gt; Department &gt; Employee Type &gt; Default
        </Typography>
      </Stack>
    </Paper>
  );
}

// ─── AssignmentTargetPicker ────────────────────────────────────────────────────

function AssignmentTargetPicker({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const { assignmentForm, setAssignmentForm, employeeOptions, groupOptions } = ctx;

  const setTarget = (key: string, displayName?: string) => {
    setAssignmentForm((current) => ({
      ...current,
      targetKey: key,
      targetDisplayName: displayName || '',
    }));
  };

  if (assignmentForm.targetType === 'employee') {
    return (
      <DrawerField label="Employee *">
        <Autocomplete
          options={employeeOptions}
          getOptionLabel={optionLabel}
          value={employeeOptions.find((item) => item.id === assignmentForm.targetKey) || null}
          onChange={(_, value) => setTarget(value?.id || '', optionLabel(value))}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
      </DrawerField>
    );
  }

  return (
    <DrawerField label="Group *">
      <Autocomplete
        options={groupOptions}
        getOptionLabel={optionLabel}
        value={groupOptions.find((item) => item.id === assignmentForm.targetKey) || null}
        onChange={(_, value) => setTarget(value?.id || '', optionLabel(value))}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Stack spacing={0} sx={{ minWidth: 0 }}>
              <Typography variant="body2">{optionLabel(option)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatNumber(option.employeeCount ?? option.memberCount ?? 0)} members
              </Typography>
            </Stack>
          </li>
        )}
        renderInput={(params) => <TextField {...params} size="small" />}
      />
    </DrawerField>
  );
}

// ─── AssignmentPolicyDrawer ────────────────────────────────────────────────────

export function AssignmentPolicyDrawer({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    drawer,
    formError,
    assignmentForm,
    setAssignmentForm,
    assignmentConflict,
    assignmentDateError,
    setAssignmentDateError,
    activePayroll,
    activeAttendance,
    academicYearId,
    activePolicyOperation,
    isPolicyOperationActive,
    createAssignmentState,
    updateAssignmentState,
    previewPolicyAssignmentImpactState,
    canAssignPolicy,
    canPreviewImpact,
    closeDrawer,
    saveAssignment,
    previewCurrentAssignmentImpact,
    previewAssignment,
  } = ctx;

  if (!drawer || drawer.kind !== 'assignment') return null;

  const handleConflictPreview = () => {
    if (!assignmentConflict) return;
    previewAssignment({
      id: assignmentConflict.assignmentId,
      academicYearId: academicYearId || '',
      targetType: assignmentConflict.targetType as PolicyAssignmentTargetType,
      targetKey: assignmentConflict.targetKey,
      targetDisplayName: assignmentConflict.targetDisplayName,
      payrollPolicyId: assignmentConflict.payrollPolicyId,
      attendancePolicyId: assignmentConflict.attendancePolicyId,
      effectiveFrom: assignmentConflict.effectiveFrom,
      effectiveTo: assignmentConflict.effectiveTo,
      priority: assignmentConflict.priority,
      isActive: true,
      assignmentReason: null,
    } as HrPolicyAssignment);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: 1,
        bgcolor: 'background.default',
      }}
    >
      <DrawerHeader
        title={`${drawer.mode === 'edit' ? 'Edit' : 'New'} Assignment`}
        helpText="Assign payroll and attendance policies to an employee or group for a specific date range."
        onClose={closeDrawer}
        closeDisabled={isPolicyOperationActive}
      />
      <Divider />
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
        {formError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        ) : null}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <Stack spacing={2} sx={{ flex: 1, width: '100%' }}>
            <DrawerSelectField
              label="Target Type"
              value={assignmentForm.targetType}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  targetType: event.target.value as PolicyAssignmentTargetType,
                  targetKey: '',
                  targetDisplayName: '',
                }))
              }
            >
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="group">Group</MenuItem>
            </DrawerSelectField>
            <AssignmentTargetPicker ctx={ctx} />
            <DrawerSelectField
              label="Payroll Policy *"
              value={assignmentForm.payrollPolicyId}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  payrollPolicyId: event.target.value,
                }))
              }
            >
              {activePayroll.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </DrawerSelectField>
            <DrawerSelectField
              label="Attendance Policy *"
              value={assignmentForm.attendancePolicyId}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  attendancePolicyId: event.target.value,
                }))
              }
            >
              {activeAttendance.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </DrawerSelectField>
            <DrawerFormGrid>
              <DrawerField label="Effective From *">
                <DatePicker
                  value={assignmentForm.effectiveFrom ? dayjs(assignmentForm.effectiveFrom) : null}
                  onChange={(val) => {
                    setAssignmentDateError('');
                    setAssignmentForm((current) => ({
                      ...current,
                      effectiveFrom: val?.format('YYYY-MM-DD') || '',
                    }));
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(assignmentDateError),
                    },
                  }}
                />
              </DrawerField>
              <DrawerField label="Effective To" helperText={assignmentDateError}>
                <DatePicker
                  value={assignmentForm.effectiveTo ? dayjs(assignmentForm.effectiveTo) : null}
                  onChange={(val) => {
                    setAssignmentDateError('');
                    setAssignmentForm((current) => ({
                      ...current,
                      effectiveTo: val?.format('YYYY-MM-DD') || '',
                    }));
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: Boolean(assignmentDateError),
                    },
                  }}
                />
              </DrawerField>
            </DrawerFormGrid>
            {assignmentConflict ? (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={handleConflictPreview}>
                    Preview
                  </Button>
                }
              >
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight={700}>
                    Conflicts with{' '}
                    {assignmentConflict.targetDisplayName || assignmentConflict.targetKey}
                  </Typography>
                  <Typography variant="caption">
                    {formatRange(assignmentConflict.effectiveFrom, assignmentConflict.effectiveTo)}{' '}
                    · Priority {assignmentConflict.priority}
                  </Typography>
                  <Typography variant="caption">
                    Payroll: {assignmentConflict.payrollPolicyName} · Attendance:{' '}
                    {assignmentConflict.attendancePolicyName}
                  </Typography>
                </Stack>
              </Alert>
            ) : null}
            <DrawerField label="Priority">
              <TextField
                fullWidth
                type="number"
                size="small"
                value={assignmentForm.priority}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    priority: event.target.value,
                  }))
                }
              />
            </DrawerField>
            <DrawerField label="Reason">
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                value={assignmentForm.assignmentReason}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    assignmentReason: event.target.value,
                  }))
                }
              />
            </DrawerField>
            <DrawerSwitchField
              label="Active"
              checked={assignmentForm.isActive}
              onChange={(checked) =>
                setAssignmentForm((current) => ({ ...current, isActive: checked }))
              }
            />
          </Stack>
          <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
            <AssignmentPreviewPanel ctx={ctx} />
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<Iconify icon="basil:cross-solid" />}
          onClick={closeDrawer}
          size="small"
          disabled={isPolicyOperationActive}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="outlined"
          disabled={!canPreviewImpact || isPolicyOperationActive}
          loading={
            previewPolicyAssignmentImpactState.isLoading ||
            activePolicyOperation?.key === 'preview-impact'
          }
          size="small"
          onClick={previewCurrentAssignmentImpact}
        >
          Preview impact
        </LoadingButton>
        <LoadingButton
          variant="contained"
          disabled={!canAssignPolicy || isPolicyOperationActive}
          loading={
            createAssignmentState.isLoading ||
            updateAssignmentState.isLoading ||
            activePolicyOperation?.key === 'save-assignment'
          }
          size="small"
          startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
          onClick={saveAssignment}
        >
          {activePolicyOperation?.key === 'save-assignment' ? 'Saving...' : 'Submit'}
        </LoadingButton>
      </Stack>
    </Box>
  );
}
