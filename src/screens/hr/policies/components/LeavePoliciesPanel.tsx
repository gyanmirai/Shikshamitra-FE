'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { ILeavePolicy } from 'src/screens/hr/attendance-setting/leave-type';

import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { LeavePolicyForm } from 'src/screens/hr/attendance-setting/leave-policy';
import { Card, Chip, Stack, Alert, Button, MenuItem, MenuList, Typography } from '@mui/material';
import {
  useGetLeavePoliciesQuery,
  useDeleteLeavePolicyMutation,
  useSetDefaultLeavePolicyMutation,
} from 'src/redux/hr/leaveApi';

import { InfoTooltipIcon } from './HRPolicySharedUI';
import { formatDate } from '../hr-policy-workspace-utils';
import { LeavePolicyImpactDrawer } from './LeavePolicyImpactDrawer';
import {
  getLeavePolicyTitle,
  isLeavePolicyArchived,
  getLeavePolicyLeaveTypeName,
  buildLeavePolicyImpactReview,
} from '../leave-policy-workspace-utils';

import type { LeavePolicyImpactReview } from '../leave-policy-workspace-utils';

export function LeavePoliciesPanel() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [editData, setEditData] = useState<ILeavePolicy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [impactReview, setImpactReview] = useState<LeavePolicyImpactReview | null>(null);
  const [impactOpen, setImpactOpen] = useState(false);

  const {
    data: leavePolicyData,
    isLoading,
    refetch,
    error,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeavePoliciesQuery,
    params: { academicYearId: currentYear?.id },
  });

  const [archiveLeavePolicy, archiveState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteLeavePolicyMutation,
  });

  const [setDefaultLeavePolicy, defaultState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetDefaultLeavePolicyMutation,
  });

  const tableData = useMemo<ILeavePolicy[]>(
    () =>
      (leavePolicyData?.items || []).filter(
        (policy: ILeavePolicy) => !isLeavePolicyArchived(policy)
      ),
    [leavePolicyData?.items]
  );

  const archivedCount = useMemo(
    () =>
      (leavePolicyData?.items || []).filter((policy: ILeavePolicy) => isLeavePolicyArchived(policy))
        .length,
    [leavePolicyData?.items]
  );

  const openCreateDialog = () => {
    setEditData(null);
    setDialogOpen(true);
  };

  const openEditDialog = (policy: ILeavePolicy) => {
    setEditData(policy);
    setDialogOpen(true);
  };

  const closeDialog = (_e?: unknown, isSubmit?: boolean) => {
    setDialogOpen(false);
    window.setTimeout(() => setEditData(null), 200);
    if (isSubmit) {
      refetch();
    }
  };

  const previewArchive = (policy: ILeavePolicy) => {
    if (policy.isDefault) {
      shikshaMitraToast.error({
        message: 'Set another active leave policy as default before archiving this one.',
      });
      return;
    }
    setEditData(policy);
    setImpactReview(buildLeavePolicyImpactReview(policy, 'archive'));
    setImpactOpen(true);
  };

  const confirmSetDefault = useCallback(
    async (policy: ILeavePolicy) => {
      if (!policy.id || policy.isDefault) {
        return;
      }

      try {
        await setDefaultLeavePolicy(policy.id).unwrap();
        shikshaMitraToast.success({
          message: `${getLeavePolicyTitle(policy)} is now the default leave policy`,
        });
        refetch();
      } catch (defaultError) {
        console.error('Failed to set default leave policy:', defaultError);
        shikshaMitraToast.error({ message: 'Failed to set default leave policy' });
      }
    },
    [refetch, setDefaultLeavePolicy]
  );

  const closeImpact = () => {
    if (archiveState.isLoading) {
      return;
    }
    setImpactOpen(false);
    setImpactReview(null);
    setEditData(null);
  };

  const confirmArchive = async () => {
    if (!editData?.id) {
      return;
    }

    try {
      await archiveLeavePolicy(editData.id).unwrap();
      shikshaMitraToast.success({
        message: `${getLeavePolicyTitle(editData)} archived successfully`,
      });
      closeImpact();
      refetch();
    } catch (archiveError) {
      console.error('Failed to archive leave policy:', archiveError);
      shikshaMitraToast.error({ message: 'Failed to archive leave policy' });
    }
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'policyTitle',
        label: 'Name',
        minWidth: 180,
        sticky: true,
        render: (_value, row) => getLeavePolicyTitle(row.policyItem),
      },
      {
        id: 'leaveType',
        label: 'Leave Type',
        minWidth: 150,
        render: (_value, row) => getLeavePolicyLeaveTypeName(row.policyItem),
      },
      { id: 'accrualPolicyType', label: 'Accrual', minWidth: 120 },
      { id: 'leaveCount', label: 'Entitlement', minWidth: 120 },
      {
        id: 'rules.0.carryForward',
        label: 'Carry Forward',
        minWidth: 130,
        render: (value) => (value ? 'Yes' : 'No'),
      },
      {
        id: 'rules.0.encashmentAllowed',
        label: 'Encashable',
        minWidth: 120,
        render: (value) => (value ? 'Yes' : 'No'),
      },
      {
        id: 'rules.0.requiresApproval',
        label: 'Approval',
        minWidth: 120,
        render: (value) => (value ? 'Required' : 'Not required'),
      },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        render: (_value, row) => (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label="Active" color="success" />
            {row.policyItem?.isDefault ? (
              <Chip size="small" label="Default" color="primary" variant="outlined" />
            ) : null}
            {row.encashmentAllowed ? (
              <Chip size="small" label="Payroll impact" color="warning" variant="outlined" />
            ) : null}
          </Stack>
        ),
      },
      { id: 'updatedAt', label: 'Updated', minWidth: 140 },
      {
        id: 'actions',
        label: 'Actions',
        align: 'right',
        width: 120,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) => {
          const policy = row.policyItem as ILeavePolicy;

          return (
            <ThreeDotsActions
              showViewIcon
              handleViewClick={() => {
                setImpactReview(buildLeavePolicyImpactReview(policy, 'update'));
                setImpactOpen(true);
              }}
              showEditIcon
              handleEditClick={() => openEditDialog(policy)}
              actions={({ popover }) => (
                <MenuList>
                  {!policy.isDefault ? (
                    <MenuItem
                      disabled={defaultState.isLoading}
                      onClick={() => {
                        popover.onClose();
                        confirmSetDefault(policy);
                      }}
                    >
                      <Iconify icon="mdi:star-outline" />
                      Set as default
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    disabled={policy.isDefault}
                    onClick={() => {
                      popover.onClose();
                      previewArchive(policy);
                    }}
                  >
                    <Iconify icon="mdi:archive-outline" />
                    Archive
                  </MenuItem>
                </MenuList>
              )}
            />
          );
        },
      },
    ],
    [confirmSetDefault, defaultState.isLoading]
  );

  const rows = tableData.map((policy) => ({
    ...policy,
    id: policy.id,
    policyItem: policy,
    policyTitle: getLeavePolicyTitle(policy),
    leaveType: getLeavePolicyLeaveTypeName(policy),
    accrualPolicyType: policy.accrualPolicyType || policy.accuralPolicyType || '-',
    updatedAt: formatDate(policy.lastModificationTime || policy.creationTime),
  }));

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Card sx={{ p: 1.25 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label="Policies & Rules" color="primary" variant="outlined" />
              <Chip size="small" label={`${archivedCount} archived`} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Entitlements, accrual, carry-forward, encashment, and approval rules live here. Leave
              Management Settings keeps only leave types.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
            disabled={!currentYear?.id}
            size="small"
            sx={{ borderRadius: 1, flexShrink: 0 }}
          >
            New Leave Policy
          </Button>
        </Stack>
        {error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            Could not load leave policies.
          </Alert>
        ) : null}
      </Card>

      <CustomizableTable
        tableId="hr-leave-policies-workspace"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isSearch={false}
        isFilter
        isPagination
        noDataText="No active leave policies. Create one from Policies & Rules."
      />

      <CustomDialog
        maxWidth="md"
        title={
          <Stack
            component="span"
            direction="row"
            spacing={0.75}
            alignItems="center"
            display="inline-flex"
          >
            <span>{editData ? 'Update Leave Policy' : 'Add Leave Policy'}</span>
            <InfoTooltipIcon
              title={
                editData
                  ? 'Update the rules for leave entitlement, accrual type, carry forward options, and approval workflows.'
                  : 'Define new rules for leave entitlement, accrual type, carry forward options, and approval workflows.'
              }
            />
          </Stack>
        }
        open={dialogOpen}
        handleClose={() => closeDialog()}
      >
        <LeavePolicyForm handleClose={closeDialog} editData={editData} />
      </CustomDialog>

      <LeavePolicyImpactDrawer
        open={impactOpen}
        review={impactReview}
        loading={archiveState.isLoading}
        onClose={closeImpact}
        onConfirm={confirmArchive}
      />
    </Stack>
  );
}
