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
import { HR_POLICY_TABS } from '../hr-policy-workspace.constants';
import { useHRPolicyWorkspace } from '../hooks/useHRPolicyWorkspace';
import { toLabel, optionLabel, getErrorMessage } from '../hr-policy-workspace-utils';

// ─── EffectivePreviewTab ────────────────────────────────────────────────────────

export function EffectivePreviewTab() {
  const effectiveTab =
    HR_POLICY_TABS.find((item) => item.value === 'effective') || HR_POLICY_TABS[0];
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
  } = ctx;

  return (
    <Card sx={{ p: 2, width: '100%' }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <Autocomplete
          options={effectiveEmployeeOptions}
          getOptionLabel={optionLabel}
          sx={{ minWidth: 220, flex: 1 }}
          value={employeeOptions.find((item) => item.id === effectiveFilters.employeeId) || null}
          onChange={(_, value) =>
            setEffectiveFilters((current) => ({
              ...current,
              employeeId: value?.id || '',
              groupId: value?.id ? '' : current.groupId,
            }))
          }
          renderInput={(params) => <TextField {...params} label="Employee" size="small" />}
        />
        <Autocomplete
          options={effectiveGroupOptions}
          getOptionLabel={optionLabel}
          sx={{ minWidth: 220, flex: 1 }}
          value={groupOptions.find((item) => item.id === effectiveFilters.groupId) || null}
          onChange={(_, value) =>
            setEffectiveFilters((current) => ({
              ...current,
              groupId: value?.id || '',
              employeeId: value?.id ? '' : current.employeeId,
            }))
          }
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
