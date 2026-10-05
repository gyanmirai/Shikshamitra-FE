'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Card, Chip, Stack, Alert, Button, MenuItem, MenuList, Typography } from '@mui/material';
import {
  useGetLeavePoliciesQuery,
  useDeleteLeavePolicyMutation,
  useUnarchiveLeavePolicyMutation,
  useSetDefaultLeavePolicyMutation,
} from 'src/redux/hr/leaveApi';

import { LeavePolicyForm } from './LeavePolicyForm';
import { InfoTooltipIcon } from './HRPolicySharedUI';
import { LeavePolicyImpactDrawer } from './LeavePolicyImpactDrawer';
import { formatDate, getErrorMessage } from '../hr-policy-workspace-utils';
import { LeaveYearEndSettlementsPanel } from './LeaveYearEndSettlementsPanel';
import {
  getLeavePolicyTitle,
  isLeavePolicyArchived,
  buildLeavePolicyImpactReview,
} from '../leave-policy-workspace-utils';

import type { LeavePolicyImpactReview } from '../leave-policy-workspace-utils';
import type { ILeavePolicy, LeavePaidType, ILeavePolicyRule } from '../leave-policy-types';

const getActivePolicyRules = (policy: ILeavePolicy) =>
  (policy.rules || []).filter((rule) => rule?.isActive !== false);

const getRuleBucket = (rule: ILeavePolicyRule) =>
  String(rule.paidType || '').toLowerCase() === 'unpaid' ? 'Unpaid' : 'Paid';

const getRuleByBucket = (policy: ILeavePolicy, bucket: LeavePaidType) =>
  getActivePolicyRules(policy).find((rule) => getRuleBucket(rule) === bucket);

const formatRuleEntitlement = (rule?: ILeavePolicyRule) => {
  if (!rule) return '-';
  if (rule.isUnlimited || rule.entitlementMode === 'Unlimited') return 'Unlimited';
  return `${rule.leaveCount ?? 0} ${rule.accrualPolicyType || 'Yearly'}`;
};

export function LeavePoliciesPanel() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [editData, setEditData] = useState<ILeavePolicy | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [impactReview, setImpactReview] = useState<LeavePolicyImpactReview | null>(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<ILeavePolicy | null>(null);
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 10, search: '' });

  const {
    data: leavePolicyData,
    isFetching: isLoading,
    refetch,
    error,
  } = useGetLeavePoliciesQuery(
    {
      academicYearId: currentYear?.id,
      page: tableQuery.page,
      pageSize: tableQuery.pageSize,
      search: tableQuery.search || undefined,
      archivedOnly: archiveView === 'archived',
    },
    { skip: !currentYear?.id }
  );
  const { data: archivedSummary } = useGetLeavePoliciesQuery(
    {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 1,
      archivedOnly: true,
    },
    { skip: !currentYear?.id }
  );

  const [archiveLeavePolicy, archiveState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteLeavePolicyMutation,
  });

  const [setDefaultLeavePolicy, defaultState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSetDefaultLeavePolicyMutation,
  });

  const [unarchiveLeavePolicy, unarchiveState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUnarchiveLeavePolicyMutation,
  });

  const tableData = (leavePolicyData?.items || []) as ILeavePolicy[];
  const archivedCount = archivedSummary?.totalCount || 0;

  const openCreateDialog = () => {
    setEditData(null);
    setDialogOpen(true);
  };

  const openEditDialog = (policy: ILeavePolicy) => {
    setEditData(policy);
    setDialogOpen(true);
  };

  const openDuplicateDialog = (policy: ILeavePolicy) => {
    // Strip the id so the form treats it as a brand-new creation (same pattern as FeeHeadForm).
    // Pre-fill all fields from the source policy; prefix the title so the user can distinguish it.
    setEditData({
      ...policy,
      id: undefined as any,
      policyTitle: `Copy of ${policy.policyTitle || policy.title || ''}`.trim(),
      title: `Copy of ${policy.policyTitle || policy.title || ''}`.trim(),
      isDefault: false,
    });
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
        message: 'Choose another default before archiving',
      });
      return;
    }
    setArchiveTarget(policy);
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
    if (!archiveTarget?.id) {
      return;
    }

    try {
      await archiveLeavePolicy(archiveTarget.id).unwrap();
      shikshaMitraToast.success({
        message: `${getLeavePolicyTitle(archiveTarget)} archived successfully`,
      });
      setArchiveTarget(null);
      refetch();
    } catch (archiveError) {
      console.error('Failed to archive leave policy:', archiveError);
      shikshaMitraToast.error({ message: 'Failed to archive leave policy' });
    }
  };

  const confirmUnarchive = useCallback(
    async (policy: ILeavePolicy) => {
      if (!policy.id) {
        return;
      }

      try {
        await unarchiveLeavePolicy(policy.id).unwrap();
        shikshaMitraToast.success({
          message: `${getLeavePolicyTitle(policy)} restored as draft`,
        });
        refetch();
      } catch (restoreError) {
        console.error('Failed to restore leave policy:', restoreError);
        shikshaMitraToast.error({
          message: getErrorMessage(restoreError, 'Failed to restore leave policy'),
        });
      }
    },
    [refetch, unarchiveLeavePolicy]
  );

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
        id: 'ruleCount',
        label: 'Rules',
        minWidth: 90,
        render: (_value, row) => {
          const rules = getActivePolicyRules(row.policyItem);
          const hasPaid = rules.some((rule) => getRuleBucket(rule) === 'Paid');
          const hasUnpaid = rules.some((rule) => getRuleBucket(rule) === 'Unpaid');
          return (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Label color="default" variant="soft">
                {rules.length}/2
              </Label>
              {hasPaid ? (
                <Label color="success" variant="soft">
                  Paid
                </Label>
              ) : null}
              {hasUnpaid ? (
                <Label color="warning" variant="soft">
                  Unpaid
                </Label>
              ) : null}
            </Stack>
          );
        },
      },
      {
        id: 'buckets',
        label: 'Buckets',
        minWidth: 220,
        render: (_value, row) => {
          const paid = getRuleByBucket(row.policyItem, 'Paid');
          const unpaid = getRuleByBucket(row.policyItem, 'Unpaid');
          return (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Label color="success" variant="soft">
                Paid: {formatRuleEntitlement(paid)}
              </Label>
              <Label color="warning" variant="soft">
                Unpaid: {formatRuleEntitlement(unpaid)}
              </Label>
            </Stack>
          );
        },
      },
      {
        id: 'entitlements',
        label: 'Entitlement',
        minWidth: 240,
        render: (_value, row) => {
          const paid = getRuleByBucket(row.policyItem, 'Paid');
          const unpaid = getRuleByBucket(row.policyItem, 'Unpaid');
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">Paid: {formatRuleEntitlement(paid)}</Typography>
              <Typography variant="body2">Unpaid: {formatRuleEntitlement(unpaid)}</Typography>
            </Stack>
          );
        },
      },
      {
        id: 'controls',
        label: 'Controls',
        minWidth: 230,
        render: (_value, row) => {
          const rules = getActivePolicyRules(row.policyItem);
          const flags = [
            rules.some((rule) => rule.requiresApproval) ? 'Approval' : null,
            rules.some((rule) => rule.carryForward) ? 'Carry forward' : null,
            rules.some((rule) => rule.encashmentAllowed) ? 'Encashment' : null,
          ].filter((flag): flag is string => Boolean(flag));

          return (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              {flags.map((flag) => (
                <Chip
                  key={flag}
                  size="small"
                  label={flag}
                  color={flag === 'Encashment' ? 'warning' : 'default'}
                  variant="outlined"
                />
              ))}
              {!flags.length ? <Chip size="small" label="Basic" variant="outlined" /> : null}
            </Stack>
          );
        },
      },
      { id: 'updatedAt', label: 'Updated', minWidth: 140 },
      {
        id: 'status',
        label: 'Status',
        minWidth: 120,
        sticky: true,
        stickyPosition: 'right',
        render: (_value, row) => {
          const policyStatus = String(row.policyItem?.status || 'Draft');
          const normalizedStatus = policyStatus.toLowerCase();
          const statusColor =
            normalizedStatus === 'active'
              ? 'success'
              : normalizedStatus === 'archived'
                ? 'default'
                : 'warning';

          return (
            <Stack spacing={0.75}>
              <Label color={statusColor} variant="soft">
                {policyStatus}
              </Label>
              {row.policyItem?.isDefault ? (
                <Label color="primary" variant="soft">
                  Default
                </Label>
              ) : null}
              {row.encashmentAllowed ? (
                <Label color="warning" variant="soft">
                  Payroll impact
                </Label>
              ) : null}
            </Stack>
          );
        },
      },
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
          const isArchived = isLeavePolicyArchived(policy);

          return (
            <ThreeDotsActions
              showViewIcon
              handleViewClick={() => {
                setImpactReview(buildLeavePolicyImpactReview(policy, 'update'));
                setImpactOpen(true);
              }}
              showEditIcon={!isArchived}
              handleEditClick={() => openEditDialog(policy)}
              actions={({ popover }) => (
                <MenuList>
                  {isArchived ? (
                    <MenuItem
                      disabled={unarchiveState.isLoading}
                      onClick={() => {
                        popover.onClose();
                        confirmUnarchive(policy);
                      }}
                    >
                      <Iconify icon="mdi:archive-arrow-up-outline" />
                      Restore as draft
                    </MenuItem>
                  ) : null}
                  {!isArchived && !policy.isDefault ? (
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
                  {!isArchived ? (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        openDuplicateDialog(policy);
                      }}
                    >
                      <Iconify icon="mdi:content-copy" />
                      Duplicate
                    </MenuItem>
                  ) : null}
                  {!isArchived ? (
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
                  ) : null}
                </MenuList>
              )}
            />
          );
        },
      },
    ],
    [confirmSetDefault, confirmUnarchive, defaultState.isLoading, unarchiveState.isLoading]
  );

  const rows = tableData.map((policy) => ({
    ...policy,
    id: policy.id,
    policyItem: policy,
    policyTitle: getLeavePolicyTitle(policy),
    ruleCount: getActivePolicyRules(policy).length,
    encashmentAllowed: getActivePolicyRules(policy).some((rule) => rule.encashmentAllowed),
    updatedAt: formatDate(policy.lastModificationTime || policy.creationTime),
  }));

  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <Card sx={{ p: 1.25 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label="Policies & Rules" color="primary" variant="outlined" />
              <Button
                size="small"
                variant={archiveView === 'current' ? 'contained' : 'outlined'}
                onClick={() => {
                  setTableQuery((current) => ({ ...current, page: 1 }));
                  setArchiveView('current');
                }}
              >
                Current
              </Button>
              <Button
                size="small"
                variant={archiveView === 'archived' ? 'contained' : 'outlined'}
                onClick={() => {
                  setTableQuery((current) => ({ ...current, page: 1 }));
                  setArchiveView('archived');
                }}
              >
                Archived ({archivedCount})
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Entitlements, accrual, carry-forward, encashment, and approval rules live here. Each
              policy contains one Paid bucket and one Unpaid bucket.
            </Typography>
          </Stack>
          {archiveView === 'current' ? (
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
          ) : null}
        </Stack>
        {error ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            Could not load leave policies.
          </Alert>
        ) : null}
      </Card>

      <LeaveYearEndSettlementsPanel />

      <CustomizableTable
        tableId="hr-leave-policies-workspace"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        isSearch
        serverSidePagination
        serverSideSearch
        totalCount={leavePolicyData?.totalCount || 0}
        page={tableQuery.page - 1}
        rowsPerPage={tableQuery.pageSize}
        searchTerm={tableQuery.search}
        onServerPagination={(page, pageSize) =>
          setTableQuery((current) => ({ ...current, page, pageSize }))
        }
        onServerSearch={(search) => setTableQuery((current) => ({ ...current, page: 1, search }))}
        isFilter={false}
        isPagination
        noDataText={
          archiveView === 'archived'
            ? 'No archived leave policies.'
            : 'No current leave policies. Create one from Policies & Rules.'
        }
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
            <span>{editData?.id ? 'Update Leave Policy' : 'Add Leave Policy'}</span>
            <InfoTooltipIcon
              title={
                editData?.id
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
      />
      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        title="Archive leave policy?"
        icon="warning"
        content={`Archive "${archiveTarget ? getLeavePolicyTitle(archiveTarget) : 'this leave policy'}"? Historical requests keep their policy and reporting context.`}
        action={
          <Button
            color="warning"
            variant="contained"
            size="small"
            loading={archiveState.isLoading}
            onClick={confirmArchive}
          >
            Archive Policy
          </Button>
        }
      />
    </Stack>
  );
}
