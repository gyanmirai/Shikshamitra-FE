'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { Card, Chip, Alert, Stack, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { getErrorMessage } from '../hr-policy-workspace-utils';

import type { AssignmentTableRow } from '../types/hr-policy-workspace.types';
import type { HRPolicyWorkspaceContext } from '../hooks/useHRPolicyWorkspace';

// --- AssignmentsTab ------------------------------------------------------------

export function AssignmentsTab({ ctx }: { ctx: HRPolicyWorkspaceContext }) {
  const {
    academicYearId,
    assignmentRows,
    assignmentListArgs,
    assignmentPage,
    setAssignmentPage,
    assignmentTotal,
    assignmentSearch,
    setAssignmentSearch,
    assignmentsLoading,
    assignmentsError,
    refetchAssignments,
    activePayroll = [],
    activeAttendance = [],
    activeLeavePolicies = [],
    canAssignPolicy,
    canViewAudit,
    openAssignmentDrawer,
    openEntityAudit,
    deleteAssignment,
  } = ctx;
  const exportAssignments = useHrTableExport('hr-policy-assignments', assignmentListArgs);

  const assignmentColumns: IColumn[] = [
    {
      id: 'target',
      label: 'Target',
      minWidth: 240,
      sticky: true,
      stickyOnMobile: false,
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
        { label: 'Staff', value: 'Employee' },
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
      stickyOnMobile: false,
      stickyPosition: 'right' as const,
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
      isSort: false,
      excludeFromExport: true,
      id: 'actions',
      label: 'Actions',
      sticky: true,
      stickyPosition: 'right' as const,
      isFilter: false,
      render: (_, row) => {
        const item = (row as AssignmentTableRow).assignment;
        return (
          <ThreeDotsActions
            viewLabel={`View ${String(row.targetName || row.id)}`}
            editLabel={`Edit ${String(row.targetName || row.id)}`}
            deleteLabel={`Delete ${String(row.targetName || row.id)}`}
            moreLabel={`More actions for ${String(row.targetName || row.id)}`}
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
    <Stack spacing={1} sx={{ width: 1, minWidth: 0, minHeight: 0, flex: 1 }}>
      <Card sx={{ p: 1, flexShrink: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
        >
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

      <CustomizableTable
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-policy-assignments"
        onExport={exportAssignments}
        serverSidePagination
        serverSideSearch
        page={assignmentPage.number - 1}
        rowsPerPage={assignmentPage.size}
        totalCount={assignmentTotal}
        onServerPagination={(number, size) => setAssignmentPage({ number, size })}
        searchTerm={assignmentSearch}
        onServerSearch={setAssignmentSearch}
        searchFieldProps={{ placeholder: 'Search targets and reasons' }}
        columns={assignmentColumns}
        data={assignmentRows}
        error={assignmentsError}
        onRetry={refetchAssignments}
        isLoading={assignmentsLoading}
        isFilter
        isPagination
        tableTitle="HR Policy Assignments"
        noDataText="No assignments match the current filters."
        wrapperProps={{
          sx: {
            flex: 1,
            minHeight: 0,
            '& [data-testid="hr-policy-assignments"] > .MuiStack-root': {
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              flexWrap: 'nowrap',
            },
          },
        }}
        tableContainerProps={{
          sx: {
            height: 1,
            '& .MuiTable-root': {
              borderSpacing: 0,
            },
          },
        }}
        {...ctx.assignmentTableProps}
      />
    </Stack>
  );
}
