'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  Box,
  Card,
  Chip,
  Badge,
  Alert,
  Stack,
  Button,
  Select,
  Divider,
  Popover,
  MenuItem,
  MenuList,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { formatDate, getErrorMessage } from '../hr-policy-workspace-utils';
import { defaultAssignmentFilters } from '../hr-policy-workspace.constants';

import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';
import type { AssignmentFilters, AssignmentTableRow } from '../types/hr-policy-workspace.types';

function getLeavePolicyName(item: any): string {
  return item?.policyTitle || item?.name || item?.title || item?.id || '-';
}

// --- AssignmentsTab ------------------------------------------------------------

export function AssignmentsTab({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    academicYearId,
    assignmentRows,
    assignmentFilters,
    setAssignmentFilters,
    assignmentFilterAnchorEl,
    setAssignmentFilterAnchorEl,
    draftAssignmentFilters,
    setDraftAssignmentFilters,
    assignmentsLoading,
    assignmentsError,
    activePayroll = [],
    activeAttendance = [],
    activeLeavePolicies = [],
    payroll = [],
    attendance = [],
    leavePolicies = [],
    canAssignPolicy,
    canViewAudit,
    openAssignmentDrawer,
    openEntityAudit,
    deleteAssignment,
  } = ctx;

  const activeFilterCount = [
    assignmentFilters.targetType !== 'all',
    assignmentFilters.status !== 'all',
    Boolean(assignmentFilters.payrollPolicyId),
    Boolean(assignmentFilters.attendancePolicyId),
    Boolean(assignmentFilters.leavePolicyId),
    Boolean(assignmentFilters.activeOnDate),
    Boolean(assignmentFilters.effectiveFrom),
    Boolean(assignmentFilters.effectiveTo),
  ].filter(Boolean).length;

  const activeFilterChips: Array<{
    label: string;
    key: keyof AssignmentFilters;
    reset: Partial<AssignmentFilters>;
  }> = [];

  if (assignmentFilters.targetType !== 'all')
    activeFilterChips.push({
      label: `Source -> ${assignmentFilters.targetType === 'employee' ? 'Employee' : 'Group'}`,
      key: 'targetType',
      reset: { targetType: 'all' },
    });
  if (assignmentFilters.status !== 'all')
    activeFilterChips.push({
      label: `Status -> ${assignmentFilters.status === 'active' ? 'Active' : 'Inactive'}`,
      key: 'status',
      reset: { status: 'all' },
    });
  if (assignmentFilters.payrollPolicyId) {
    const name =
      payroll.find((p) => p.id === assignmentFilters.payrollPolicyId)?.name ||
      assignmentFilters.payrollPolicyId;
    activeFilterChips.push({
      label: `Payroll -> ${name}`,
      key: 'payrollPolicyId',
      reset: { payrollPolicyId: '' },
    });
  }
  if (assignmentFilters.attendancePolicyId) {
    const name =
      attendance.find((a) => a.id === assignmentFilters.attendancePolicyId)?.name ||
      assignmentFilters.attendancePolicyId;
    activeFilterChips.push({
      label: `Attendance -> ${name}`,
      key: 'attendancePolicyId',
      reset: { attendancePolicyId: '' },
    });
  }
  if (assignmentFilters.leavePolicyId) {
    const name =
      getLeavePolicyName(
        leavePolicies.find((item: any) => item.id === assignmentFilters.leavePolicyId)
      ) || assignmentFilters.leavePolicyId;
    activeFilterChips.push({
      label: `Leave -> ${name}`,
      key: 'leavePolicyId',
      reset: { leavePolicyId: '' },
    });
  }
  if (assignmentFilters.activeOnDate)
    activeFilterChips.push({
      label: `Active on -> ${formatDate(assignmentFilters.activeOnDate)}`,
      key: 'activeOnDate',
      reset: { activeOnDate: '' },
    });
  if (assignmentFilters.effectiveFrom)
    activeFilterChips.push({
      label: `Effective from -> ${formatDate(assignmentFilters.effectiveFrom)}`,
      key: 'effectiveFrom',
      reset: { effectiveFrom: '' },
    });
  if (assignmentFilters.effectiveTo)
    activeFilterChips.push({
      label: `Effective to -> ${formatDate(assignmentFilters.effectiveTo)}`,
      key: 'effectiveTo',
      reset: { effectiveTo: '' },
    });

  const assignmentColumns: IColumn[] = [
    {
      id: 'target',
      label: 'Target',
      minWidth: 240,
      sticky: true,
      render: (_, row) => {
        const item = row as AssignmentTableRow;
        return (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {item.target}
            </Typography>
          </Stack>
        );
      },
    },
    {
      id: 'sourceType',
      label: 'Source',
      filterType: 'enum',
      enumOptions: [
        { label: 'Employee', value: 'Employee' },
        { label: 'Group', value: 'Group' },
      ],
      render: (value) => <Chip size="small" label={value} variant="outlined" />,
    },
    {
      id: 'organization',
      label: 'Organization',
      minWidth: 180,
      render: (value) => (
        <Typography
          variant="body2"
          noWrap
          color={value === '-' ? 'text.secondary' : 'text.primary'}
        >
          {value || '-'}
        </Typography>
      ),
    },
    { id: 'payrollPolicyName', label: 'Payroll Policy', minWidth: 180 },
    { id: 'attendancePolicyName', label: 'Attendance Policy', minWidth: 180 },
    { id: 'leavePolicyName', label: 'Leave Policy', minWidth: 180 },
    { id: 'effective', label: 'Effective', minWidth: 180 },
    { id: 'priority', label: 'Priority', filterType: 'number', width: 110 },
    { id: 'reason', label: 'Reason', minWidth: 220, defaultHidden: true },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      sticky: true,
      enumOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
      render: (value) => {
        const statusValue = String(value);
        const color = (statusValue === 'Active' ? 'success' : 'default') as LabelColor;
        return <Label color={color}>{statusValue}</Label>;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      isFilter: false,
      render: (_, row) => {
        const item = (row as AssignmentTableRow).assignment;
        return (
          <ThreeDotsActions
            showViewIcon
            handleViewClick={() => openAssignmentDrawer(item, 'view')}
            showEditIcon={canAssignPolicy}
            handleEditClick={() => openAssignmentDrawer(item)}
            actions={({ popover }) => (
              <MenuList>
                {canViewAudit && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      openEntityAudit(
                        'policy_assignment',
                        item.id,
                        item.targetDisplayName || item.targetKey
                      );
                    }}
                  >
                    <Iconify icon="mdi:history" />
                    Audit Trail
                  </MenuItem>
                )}
                {canAssignPolicy && item.isActive && (
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      deleteAssignment(item);
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <Iconify icon="mdi:close-circle-outline" />
                    Deactivate Assignment
                  </MenuItem>
                )}
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Card sx={{ px: 1.5, py: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1.5}>
          <Badge
            badgeContent={activeFilterCount || undefined}
            color="primary"
            overlap="circular"
            sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:filter-outline" />}
              onClick={(e) => {
                setDraftAssignmentFilters({ ...assignmentFilters });
                setAssignmentFilterAnchorEl(e.currentTarget);
              }}
              sx={{
                borderColor: activeFilterCount ? 'primary.main' : undefined,
                color: activeFilterCount ? 'primary.main' : undefined,
              }}
            >
              Advanced Filters
            </Button>
          </Badge>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() => openAssignmentDrawer()}
            size="small"
            disabled={
              !academicYearId ||
              activePayroll.length === 0 ||
              activeAttendance.length === 0 ||
              activeLeavePolicies.length === 0 ||
              !canAssignPolicy
            }
          >
            New Assignment
          </Button>
        </Stack>
        {activeFilterChips.length > 0 ? (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            alignItems="center"
            sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mr: 0.5 }}>
              Active Filters:
            </Typography>
            {activeFilterChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size="small"
                onDelete={() => setAssignmentFilters((cur) => ({ ...cur, ...chip.reset }))}
                sx={{ fontWeight: 500, fontSize: 12 }}
              />
            ))}
            <Button
              size="small"
              color="error"
              variant="text"
              startIcon={<Iconify icon="mdi:delete-outline" />}
              onClick={() => setAssignmentFilters(defaultAssignmentFilters())}
              sx={{ ml: 0.5, px: 1 }}
            >
              Clear ({activeFilterChips.length})
            </Button>
          </Stack>
        ) : null}
      </Card>

      {activePayroll.length === 0 ||
        activeAttendance.length === 0 ||
        activeLeavePolicies.length === 0 ? (
        <Alert severity="warning">
          Active payroll, attendance, and leave policies are required.
        </Alert>
      ) : null}
      {assignmentsError ? (
        <Alert severity="error">
          {getErrorMessage(assignmentsError, 'Could not load policy assignments.')}
        </Alert>
      ) : null}

      <Popover
        open={Boolean(assignmentFilterAnchorEl)}
        anchorEl={assignmentFilterAnchorEl}
        onClose={() => setAssignmentFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 520, p: 2.5, borderRadius: 2 } }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:filter-outline" width={18} sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle2" fontWeight={700}>
                Advanced Filters
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setAssignmentFilterAnchorEl(null)}>
              <Iconify icon="mdi:close" width={16} />
            </IconButton>
          </Stack>
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                label="Source"
                value={draftAssignmentFilters.targetType}
                onChange={(e) =>
                  setDraftAssignmentFilters((cur) => ({
                    ...cur,
                    targetType: e.target.value as AssignmentFilters['targetType'],
                  }))
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="group">Group</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={draftAssignmentFilters.status}
                onChange={(e) =>
                  setDraftAssignmentFilters((cur) => ({
                    ...cur,
                    status: e.target.value as AssignmentFilters['status'],
                  }))
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel shrink>Payroll Policy</InputLabel>
              <Select
                label="Payroll Policy"
                displayEmpty
                value={draftAssignmentFilters.payrollPolicyId}
                renderValue={(selected) => {
                  const value = selected as string;
                  if (!value) return 'All';
                  return payroll.find((item) => item.id === value)?.name || value;
                }}
                onChange={(e) =>
                  setDraftAssignmentFilters((cur) => ({ ...cur, payrollPolicyId: e.target.value }))
                }
              >
                <MenuItem value="">All</MenuItem>
                {payroll.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel shrink>Attendance Policy</InputLabel>
              <Select
                label="Attendance Policy"
                displayEmpty
                value={draftAssignmentFilters.attendancePolicyId}
                renderValue={(selected) => {
                  const value = selected as string;
                  if (!value) return 'All';
                  return attendance.find((item) => item.id === value)?.name || value;
                }}
                onChange={(e) =>
                  setDraftAssignmentFilters((cur) => ({
                    ...cur,
                    attendancePolicyId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">All</MenuItem>
                {attendance.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel shrink>Leave Policy</InputLabel>
              <Select
                label="Leave Policy"
                displayEmpty
                value={draftAssignmentFilters.leavePolicyId}
                renderValue={(selected) => {
                  const value = selected as string;
                  if (!value) return 'All';
                  return getLeavePolicyName(leavePolicies.find((item: any) => item.id === value));
                }}
                onChange={(e) =>
                  setDraftAssignmentFilters((cur) => ({
                    ...cur,
                    leavePolicyId: e.target.value,
                  }))
                }
              >
                <MenuItem value="">All</MenuItem>
                {leavePolicies.map((item: any) => (
                  <MenuItem key={item.id} value={item.id}>
                    {getLeavePolicyName(item)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DatePicker
              label="Active on"
              value={
                draftAssignmentFilters.activeOnDate
                  ? dayjs(draftAssignmentFilters.activeOnDate)
                  : null
              }
              onChange={(val) =>
                setDraftAssignmentFilters((cur) => ({
                  ...cur,
                  activeOnDate: val?.format('YYYY-MM-DD') || '',
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Box />
            <DatePicker
              label="Effective from"
              value={
                draftAssignmentFilters.effectiveFrom
                  ? dayjs(draftAssignmentFilters.effectiveFrom)
                  : null
              }
              onChange={(val) =>
                setDraftAssignmentFilters((cur) => ({
                  ...cur,
                  effectiveFrom: val?.format('YYYY-MM-DD') || '',
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="Effective to"
              value={
                draftAssignmentFilters.effectiveTo
                  ? dayjs(draftAssignmentFilters.effectiveTo)
                  : null
              }
              onChange={(val) =>
                setDraftAssignmentFilters((cur) => ({
                  ...cur,
                  effectiveTo: val?.format('YYYY-MM-DD') || '',
                }))
              }
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>
          <Divider />
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const reset = defaultAssignmentFilters();
                setDraftAssignmentFilters(reset);
                setAssignmentFilters(reset);
                setAssignmentFilterAnchorEl(null);
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setAssignmentFilters({ ...draftAssignmentFilters });
                setAssignmentFilterAnchorEl(null);
              }}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>

      <CustomizableTable
        tableId="hr-policy-assignments"
        columns={assignmentColumns}
        data={assignmentRows}
        isLoading={assignmentsLoading}
        isFilter
        isPagination
        tableTitle="HR Policy Assignments"
        noDataText="No assignments match the current filters."
        wrapperProps={{
          sx: {
            '& [data-testid="hr-policy-assignments"] > .MuiStack-root': {
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              flexWrap: 'nowrap',
            },
          },
        }}
        tableContainerProps={{
          sx: {
            maxHeight: 620,
            '& .MuiTable-root': {
              borderSpacing: 0,
            },
          },
        }}
      />
    </Stack>
  );
}
