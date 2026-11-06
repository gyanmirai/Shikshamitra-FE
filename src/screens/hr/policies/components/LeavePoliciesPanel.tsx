'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { formatHrAuditDateTime } from 'src/utils/hr-audit-format';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';
import {
  Card,
  Chip,
  Stack,
  Alert,
  Button,
  Drawer,
  Divider,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import {
  useGetLeavePoliciesQuery,
  useDeleteLeavePolicyMutation,
  useUnarchiveLeavePolicyMutation,
  useSetDefaultLeavePolicyMutation,
} from 'src/redux/hr/leaveApi';

import { DrawerHeader } from './HRPolicySharedUI';
import { LeavePolicyForm } from './LeavePolicyForm';
import { policyImpactRequest } from '../leave-impact.types';
import { getErrorMessage } from '../hr-policy-workspace-utils';
import { LeavePolicyDetailsDrawer } from './LeavePolicyDetailsDrawer';
import { LeaveYearEndSettlementsPanel } from './LeaveYearEndSettlementsPanel';
import { useLeavePolicyImpactReview } from '../hooks/useLeavePolicyImpactReview';
import { getLeavePolicyTitle, isLeavePolicyArchived } from '../leave-policy-workspace-utils';

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

export function LeavePoliciesPanel({ onHistory }: { onHistory?: (policy: ILeavePolicy) => void }) {
  const dispatch = useDispatch();
  const formCloseState = useRef({ dirty: false, busy: false });
  const [discardOpen, setDiscardOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const updateCloseState = useCallback((state: { dirty: boolean; busy: boolean }) => {
    formCloseState.current = state;
    setFormBusy(state.busy);
  }, []);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, hrLeavePolicyPermissions.create);
  const canEdit = hasGrantedPermission(permissions, hrLeavePolicyPermissions.edit);
  const canArchive = hasGrantedPermission(permissions, hrLeavePolicyPermissions.archive);
  const canSetDefault = hasGrantedPermission(permissions, hrLeavePolicyPermissions.setDefault);
  const [viewPolicy, setViewPolicy] = useState<ILeavePolicy | null>(null);
  const [editData, setEditData] = useState<ILeavePolicy | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const impactReview = useLeavePolicyImpactReview(currentYear?.id);
  const [archiveView, setArchiveView] = useState<'current' | 'archived'>('current');
  const [tableQuery, setTableQuery] = useState({ page: 1, pageSize: 10, search: '' });

  const exportTable = useHrTableExport('hr-policy-leave', {
    academicYearId: currentYear?.id,
    search: tableQuery.search,
    archivedOnly: archiveView === 'archived',
  });
  const {
    currentData: leavePolicyData,
    isFetching: isLoading,
    refetch,
    error,
    tableProps: operationalTableProps,
  } = useHrTableQuery(
    {
      table: 'hr-policy-leave',
      query: {
        academicYearId: currentYear?.id,
        search: tableQuery.search,
        archivedOnly: archiveView === 'archived',
      },
      page: tableQuery.page - 1,
      size: tableQuery.pageSize,
      resetPage: () => setTableQuery((current) => ({ ...current, page: 1 })),
      skip: !currentYear?.id,
    },
    useGetLeavePoliciesQuery(
      {
        academicYearId: currentYear?.id,
        page: tableQuery.page,
        pageSize: tableQuery.pageSize,
        search: tableQuery.search || undefined,
        archivedOnly: archiveView === 'archived',
      },
      { skip: !currentYear?.id }
    )
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

  const openCreateDrawer = () => {
    if (!canCreate) return;
    setEditData(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = useCallback(
    (policy: ILeavePolicy) => {
      if (!canEdit) return;
      setEditData(policy);
      setDrawerOpen(true);
    },
    [canEdit]
  );

  const openDuplicateDrawer = useCallback(
    (policy: ILeavePolicy) => {
      if (!canCreate) return;
      // Strip the id so the form treats it as a brand-new creation (same pattern as FeeHeadForm).
      // Pre-fill all fields from the source policy; prefix the title so the user can distinguish it.
      setEditData({
        ...policy,
        id: undefined as any,
        policyTitle: `Copy of ${policy.policyTitle || policy.title || ''}`.trim(),
        title: `Copy of ${policy.policyTitle || policy.title || ''}`.trim(),
        isDefault: false,
      });
      setDrawerOpen(true);
    },
    [canCreate]
  );

  const closeDrawer = (_e?: unknown, isSubmit?: boolean) => {
    if (!isSubmit && formCloseState.current.busy) return;
    if (!isSubmit && formCloseState.current.dirty) {
      setDiscardOpen(true);
      return;
    }
    formCloseState.current = { dirty: false, busy: false };
    dispatch(setIsChanges(false));
    setDrawerOpen(false);
    setEditData(null);
    if (isSubmit) {
      refetch();
    }
  };

  const previewArchive = useCallback(
    async (policy: ILeavePolicy) => {
      if (!canArchive || !currentYear?.id) return;
      if (policy.isDefault) {
        shikshaMitraToast.error({
          message: 'Choose another default before archiving',
        });
        return;
      }
      const approval = await impactReview.requestReview(
        policyImpactRequest(policy, 'archive', currentYear)
      );
      if (!approval) return;
      try {
        await archiveLeavePolicy({ id: policy.id, ...approval }).unwrap();
        shikshaMitraToast.success({
          message: `${getLeavePolicyTitle(policy)} archived successfully`,
        });
        refetch();
      } catch (failure) {
        shikshaMitraToast.error({
          message: getErrorMessage(failure, 'Could not archive leave policy.'),
        });
      }
    },
    [canArchive, currentYear, impactReview, archiveLeavePolicy, refetch]
  );

  const confirmSetDefault = useCallback(
    async (policy: ILeavePolicy) => {
      if (!canSetDefault || !policy.id || policy.isDefault || !currentYear?.id) {
        return;
      }

      try {
        const approval = await impactReview.requestReview(
          policyImpactRequest(policy, 'set-default', currentYear)
        );
        if (!approval) return;
        await setDefaultLeavePolicy({ id: policy.id, ...approval }).unwrap();
        shikshaMitraToast.success({
          message: `${getLeavePolicyTitle(policy)} is now the default leave policy`,
        });
        refetch();
      } catch (defaultError) {
        console.error('Failed to set default leave policy:', defaultError);
        shikshaMitraToast.error({
          message: getErrorMessage(defaultError, 'Failed to set default leave policy'),
        });
      }
    },
    [canSetDefault, refetch, setDefaultLeavePolicy, currentYear, impactReview]
  );

  const confirmUnarchive = useCallback(
    async (policy: ILeavePolicy) => {
      if (!canArchive || !policy.id) {
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
    [canArchive, refetch, unarchiveLeavePolicy]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'policyTitle',
        label: 'Name',
        minWidth: 180,
        sticky: true,
        stickyOnMobile: false,
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
        stickyOnMobile: false,
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
        isSort: false,
        excludeFromExport: true,
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
              viewLabel={`View ${String(row.policyTitle || row.id)}`}
              editLabel={`Edit ${String(row.policyTitle || row.id)}`}
              deleteLabel={`Delete ${String(row.policyTitle || row.id)}`}
              moreLabel={`More actions for ${String(row.policyTitle || row.id)}`}
              showViewIcon
              handleViewClick={() => {
                setViewPolicy(policy);
              }}
              showEditIcon={!isArchived && canEdit}
              handleEditClick={() => openEditDrawer(policy)}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      if (currentYear)
                        impactReview.requestReview(
                          policyImpactRequest(policy, 'inspect', currentYear)
                        );
                    }}
                  >
                    Review impact
                  </MenuItem>
                  {onHistory ? (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        onHistory(policy);
                      }}
                    >
                      Version history
                    </MenuItem>
                  ) : null}
                  {isArchived && canArchive ? (
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
                  {!isArchived && !policy.isDefault && canSetDefault ? (
                    <MenuItem
                      disabled={
                        defaultState.isLoading || String(policy.status).toLowerCase() !== 'active'
                      }
                      title={
                        String(policy.status).toLowerCase() !== 'active'
                          ? 'Only an active policy can be the default.'
                          : undefined
                      }
                      onClick={() => {
                        popover.onClose();
                        confirmSetDefault(policy);
                      }}
                    >
                      <Iconify icon="mdi:star-outline" />
                      Set as default
                    </MenuItem>
                  ) : null}
                  {!isArchived && canCreate ? (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        openDuplicateDrawer(policy);
                      }}
                    >
                      <Iconify icon="mdi:content-copy" />
                      Duplicate
                    </MenuItem>
                  ) : null}
                  {!isArchived && canArchive ? (
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
    [
      canCreate,
      canEdit,
      canArchive,
      canSetDefault,
      confirmSetDefault,
      confirmUnarchive,
      defaultState.isLoading,
      unarchiveState.isLoading,
      openEditDrawer,
      openDuplicateDrawer,
      previewArchive,
      currentYear,
      impactReview,
      onHistory,
    ]
  );

  const rows = tableData.map((policy) => ({
    ...policy,
    id: policy.id,
    policyItem: policy,
    policyTitle: getLeavePolicyTitle(policy),
    ruleCount: getActivePolicyRules(policy).length,
    encashmentAllowed: getActivePolicyRules(policy).some((rule) => rule.encashmentAllowed),
    updatedAt: formatHrAuditDateTime(policy.lastModificationTime || policy.creationTime),
  }));

  return (
    <Stack spacing={1} sx={{ width: 1, minWidth: 0, minHeight: 0, flex: 1 }}>
      <Card sx={{ p: 1, flexShrink: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
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
          </Stack>
          {archiveView === 'current' && canCreate ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreateDrawer}
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
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        tableId="hr-leave-policies-workspace"
        tableTitle="Leave policies"
        onExport={exportTable}
        columns={columns}
        data={rows}
        error={error}
        onRetry={refetch}
        isRefreshing={isLoading && Boolean(leavePolicyData)}
        paginationDisabled={isLoading}
        isLoading={isLoading && !leavePolicyData}
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
        {...operationalTableProps}
      />

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => closeDrawer()}
        PaperProps={{
          'aria-label': editData?.id ? 'Update Leave Policy' : 'Add Leave Policy',
          sx: { width: { xs: '100%', sm: 'min(1180px, 92vw)' }, maxWidth: '100%' },
        }}
      >
        <DrawerHeader
          title={editData?.id ? 'Update Leave Policy' : 'Add Leave Policy'}
          helpText="Configure leave entitlement, accrual, carry forward, and approval rules."
          onClose={() => closeDrawer()}
          closeDisabled={formBusy}
        />
        <Divider />
        <LeavePolicyForm
          handleClose={closeDrawer}
          editData={editData}
          onCloseStateChange={updateCloseState}
        />
      </Drawer>
      <ConfirmDialog
        open={discardOpen}
        title="Discard Unsaved Changes?"
        content="Your leave policy changes have not been saved. Discarding them closes this editor."
        icon="warning"
        cancelText="Keep editing"
        disableCancel={formBusy}
        disableEscapeKeyDown={formBusy}
        onClose={() => {
          if (!formBusy) setDiscardOpen(false);
        }}
        action={
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={formBusy}
            onClick={() => {
              if (formCloseState.current.busy) return;
              formCloseState.current.dirty = false;
              setDiscardOpen(false);
              closeDrawer();
            }}
          >
            Discard changes
          </Button>
        }
      />

      {impactReview.drawer}
      <LeavePolicyDetailsDrawer policy={viewPolicy} onClose={() => setViewPolicy(null)} />
    </Stack>
  );
}
