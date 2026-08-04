'use client';

import React from 'react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Autocomplete,
  LinearProgress,
} from '@mui/material';

import { SectionTable } from './HRPolicySharedUI';
import { getHRPolicyTab } from '../hr-policy-workspace.constants';
import { useHRPolicyWorkspace } from '../hooks/useHRPolicyWorkspace';
import { toLabel, optionLabel, getErrorMessage } from '../hr-policy-workspace-utils';

// --- EffectivePreviewTab --------------------------------------------------------

export function EffectivePreviewTab() {
  const effectiveTab = getHRPolicyTab('effective');
  const ctx = useHRPolicyWorkspace({ focus: 'effective', tabs: [effectiveTab] });

  const {
    effectiveFilters,
    setEffectiveFilters,
    effectivePreview,
    effectiveLoading,
    effectiveError,
    effectiveEmployeeOptions,
    effectiveGroupOptions,
    employeeOptions,
    groupOptions,
    employeeLookupSearch,
    setEmployeeLookupSearch,
    employeeSearchLoading,
  } = ctx;

  const selectedEmployee =
    employeeOptions.find((item) => item.id === effectiveFilters.employeeId) || null;

  return (
    <Card sx={{ p: 2, width: '100%' }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <Autocomplete
          key="effective-employee-autocomplete"
          options={effectiveEmployeeOptions}
          getOptionLabel={optionLabel}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          inputValue={employeeLookupSearch ?? ''}
          onInputChange={(_event, value, reason) => {
            if (reason === 'input' || reason === 'clear') {
              setEmployeeLookupSearch(value ?? '');
              if (
                effectiveFilters.employeeId &&
                (reason === 'clear' || value !== optionLabel(selectedEmployee))
              ) {
                setEffectiveFilters((current) => ({
                  ...current,
                  employeeId: '',
                }));
              }
            }
          }}
          loading={employeeSearchLoading}
          filterOptions={(options) => options}
          sx={{ minWidth: 220, flex: 1 }}
          value={selectedEmployee}
          onChange={(_, value) => {
            setEffectiveFilters((current) => ({
              ...current,
              employeeId: value?.id || '',
              groupId: value?.id ? '' : current.groupId,
            }));
            setEmployeeLookupSearch(optionLabel(value));
          }}
          renderInput={(params) => <TextField {...params} label="Employee" size="small" />}
        />
        <Autocomplete
          key="effective-group-autocomplete"
          options={effectiveGroupOptions}
          getOptionLabel={optionLabel}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          sx={{ minWidth: 220, flex: 1 }}
          value={groupOptions.find((item) => item.id === effectiveFilters.groupId) || null}
          onChange={(_, value) => {
            setEffectiveFilters((current) => ({
              ...current,
              groupId: value?.id || '',
              employeeId: value?.id ? '' : current.employeeId,
            }));
            if (value?.id) {
              setEmployeeLookupSearch('');
            }
          }}
          renderInput={(params) => <TextField {...params} label="Group" size="small" />}
        />
        <DatePicker
          label="Date"
          value={effectiveFilters.date ? dayjs(effectiveFilters.date) : null}
          onChange={(val) =>
            setEffectiveFilters((current) => ({
              ...current,
              date: val?.format('YYYY-MM-DD') || '',
            }))
          }
          format="DD/MM/YYYY"
          slotProps={{ textField: { size: 'small' } }}
        />
      </Stack>
      {effectiveLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}
      {effectiveError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(effectiveError, 'Could not resolve effective policies.')}
        </Alert>
      ) : null}
      {effectivePreview?.resolutionSummary ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {effectivePreview.resolutionSummary}
        </Alert>
      ) : null}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Alert severity="info" sx={{ flex: 1 }}>
          Source: {effectivePreview?.policySource || '-'}
          {effectivePreview?.matchedTargetDisplayName || effectivePreview?.matchedTargetKey
            ? ` (${effectivePreview.matchedTargetDisplayName || effectivePreview.matchedTargetKey})`
            : ''}
        </Alert>
        <Alert severity="success" sx={{ flex: 1 }}>
          Payroll: {effectivePreview?.payrollPolicy?.name || '-'} /{' '}
          {effectivePreview?.payrollWorkCalendarPolicy?.name || '-'}
        </Alert>
        <Alert severity="success" sx={{ flex: 1 }}>
          Attendance: {effectivePreview?.attendancePolicy?.name || '-'} /{' '}
          {effectivePreview?.attendanceWorkCalendarPolicy?.name || '-'}
        </Alert>
      </Stack>
      {effectivePreview?.recommendedAction ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {effectivePreview.recommendedAction}
        </Alert>
      ) : null}
      {effectivePreview?.resolutionSteps?.length ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Resolution Chain
          </Typography>
          <SectionTable columns={['Scope', 'Target', 'Status', 'Reason', 'Priority']}>
            {effectivePreview.resolutionSteps.map((step, index) => (
              <TableRow
                key={`${step.source}-${step.assignmentId || step.targetKey || index}`}
                hover
                selected={step.status === 'matched'}
              >
                <TableCell>{toLabel(step.targetType || step.source)}</TableCell>
                <TableCell>
                  {step.targetDisplayName || step.targetKey || 'Academic year default'}
                </TableCell>
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
    </Card>
  );
}
