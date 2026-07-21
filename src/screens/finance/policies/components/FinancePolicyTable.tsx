'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Chip, MenuItem, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetCollectionPoliciesQuery,
  useArchiveCollectionPolicyMutation,
  useUnarchiveCollectionPolicyMutation,
} from 'src/redux/finance/collectionPolicy';
import {
  useGetFinancePoliciesQuery,
  useGetFinancePolicyByIdQuery,
  usePatchFinancePolicyMutation,
  useCloneFinancePolicyMutation,
  useDeleteFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';

import FinancePolicyAuditDrawer from './FinancePolicyAuditDrawer';
import FinancePolicyDetailsDrawer from './FinancePolicyDetailsDrawer';
import FinancePolicyVersionDrawer from './FinancePolicyVersionDrawer';

import type {
  IFinancePolicyRow,
  FinancePolicyStatus,
  IFinancePolicyTableProps,
} from '../types/finance-policy.types';

// ─── Status label colour map ───────────────────────────────────────────────────

const STATUS_COLOR: Record<FinancePolicyStatus, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Published: 'success',
  Draft: 'warning',
  Inactive: 'error',
  Archived: 'default',
};

// Collection Policy's status is restricted to Active/Archived and never reaches Draft
// (see finance-policy.types.ts ICollectionPolicy.status), so the delete-eligibility rule
// can't be a single hardcoded 'Draft' check across all policy kinds — it's resolved
// per policy type instead. For Collection Policy, Archived is the terminal "safe to
// hard-delete" state; for every other kind, an unpublished Draft is.
const isPolicyDeletable = (
  policyType: IFinancePolicyTableProps['policyType'],
  status: FinancePolicyStatus
): boolean => (policyType === 'collection' ? status === 'Archived' : status === 'Draft');

// ─── Component ────────────────────────────────────────────────────────────────

const FinancePolicyTable: React.FC<IFinancePolicyTableProps> = ({ policyType, onAdd, onEdit }) => {
  const deleteDialog = useBoolean();
  const detailsDialog = useBoolean();
  const auditDialog = useBoolean();
  const versionDialog = useBoolean();

  const [selected, setSelected] = React.useState<IFinancePolicyRow | null>(null);
  const [queryParams, setQueryParams] = React.useState({
    page: 1,
    pageSize: 10,
    search: '',
    status: '' as FinancePolicyStatus | '',
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id || '';

  // ── Queries / Mutations ──────────────────────────────────────────────────────
  // Collection Policy has a real backend (Phase 1); every other kind still calls
  // the generic, not-yet-implemented `/finance-policies` slice. Both queries are
  // called unconditionally (React hooks can't branch) and gated with `skip` —
  // only the one matching `policyType` actually fires.
  const isCollectionKind = policyType === 'collection';

  const {
    data: genericPolicyData,
    isLoading: isGenericLoading,
    isFetching: isGenericFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinancePoliciesQuery,
    params: { policyType, ...queryParams },
    options: { skip: isCollectionKind },
  });

  const {
    data: collectionPolicyData,
    isLoading: isCollectionLoading,
    isFetching: isCollectionFetching,
  } = useGetCollectionPoliciesQuery(
    {
      academicYearId,
      status: queryParams.status || undefined,
      search: queryParams.search || undefined,
      skipCount: (queryParams.page - 1) * queryParams.pageSize,
      maxResultCount: queryParams.pageSize,
    },
    { skip: !isCollectionKind || !academicYearId }
  );

  const policyData = isCollectionKind
    ? collectionPolicyData && {
        items: collectionPolicyData.items,
        totalCount: collectionPolicyData.totalCount,
      }
    : genericPolicyData;
  const isLoading = isCollectionKind ? isCollectionLoading : isGenericLoading;
  const isFetching = isCollectionKind ? isCollectionFetching : isGenericFetching;

  const [archiveCollectionPolicy] = useArchiveCollectionPolicyMutation();
  const [unarchiveCollectionPolicy] = useUnarchiveCollectionPolicyMutation();

  const { data: policyDetails, isLoading: isDetailsLoading } = useGetFinancePolicyByIdQuery(
    selected?.id || '',
    { skip: !selected?.id || !detailsDialog.value }
  );

  const [deletePolicy, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteFinancePolicyMutation,
  });

  const [patchPolicy] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFinancePolicyMutation,
  });

  const [clonePolicy, { isLoading: isCloning }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCloneFinancePolicyMutation,
  });

  // ── Column definitions ───────────────────────────────────────────────────────

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'policyName',
        label: 'Policy Name',
        align: 'left',
        sticky: true,
        render: (value, row) => (
          <Box>
            <Typography variant="caption" fontWeight={600} fontSize="13px">
              {value}
            </Typography>
            {(row as IFinancePolicyRow).isDefault && (
              <Chip
                label="Default"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1, height: 18, fontSize: '10px' }}
              />
            )}
          </Box>
        ),
      },
      // ── Policy Specific Columns ──
      ...(policyType === 'payment'
        ? [
            {
              id: 'allowPartialPayment',
              label: 'Partial Payment',
              align: 'left' as const,
              render: (_: any, row: any) => (
                <Chip
                  label={row.allowPartialPayment ? 'Allowed' : 'Not Allowed'}
                  color={row.allowPartialPayment ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              id: 'allocationMethod',
              label: 'Allocation Method',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value
                    ? String(value)
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                    : '-'}
                </Typography>
              ),
            },
            {
              id: 'receiptPrefix',
              label: 'Receipt Prefix',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px" color="text.secondary">
                  {value || '-'}
                </Typography>
              ),
            },
          ]
        : []),
      ...(policyType === 'concession'
        ? [
            {
              id: 'eligibilityType',
              label: 'Eligibility Type',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value
                    ? String(value)
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                    : '-'}
                </Typography>
              ),
            },
            {
              id: 'discountType',
              label: 'Discount Type',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'}
                </Typography>
              ),
            },
            {
              id: 'discountValue',
              label: 'Discount Value',
              align: 'right' as const,
              render: (_: any, row: any) => (
                <Typography variant="caption" fontSize="13px" fontWeight="600">
                  {row.discountType === 'Percentage'
                    ? `${row.discountValue}%`
                    : `₹${row.discountValue}`}
                </Typography>
              ),
            },
          ]
        : []),
      ...(policyType === 'refund'
        ? [
            {
              id: 'refundMethod',
              label: 'Refund Method',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value
                    ? String(value)
                        .replace(/([A-Z])/g, ' $1')
                        .trim()
                    : '-'}
                </Typography>
              ),
            },
            {
              id: 'processingDays',
              label: 'Processing Days',
              align: 'center' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value != null ? `${value} days` : '-'}
                </Typography>
              ),
            },
            {
              id: 'allowPartialRefund',
              label: 'Partial Refund',
              align: 'center' as const,
              render: (value: any) => (
                <Chip
                  label={value ? 'Yes' : 'No'}
                  color={value ? 'primary' : 'default'}
                  size="small"
                  variant="outlined"
                />
              ),
            },
          ]
        : []),
      ...(policyType === 'collection'
        ? [
            {
              id: 'enableLateFee',
              label: 'Late Fee',
              align: 'center' as const,
              render: (value: any) => (
                <Chip
                  label={value ? 'Enabled' : 'Disabled'}
                  color={value ? 'warning' : 'default'}
                  size="small"
                  variant="outlined"
                />
              ),
            },
            {
              id: 'lateFeeType',
              label: 'Late Fee Type',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'}
                </Typography>
              ),
            },
            {
              id: 'gracePeriodDays',
              label: 'Grace Days',
              align: 'center' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value != null ? `${value} days` : '-'}
                </Typography>
              ),
            },
            {
              id: 'allowOnlineCollection',
              label: 'Online Pay',
              align: 'center' as const,
              render: (value: any) => (
                <Chip
                  label={value ? 'Yes' : 'No'}
                  color={value ? 'success' : 'default'}
                  size="small"
                  variant="outlined"
                />
              ),
            },
          ]
        : []),
      ...(policyType === 'proration'
        ? [
            {
              id: 'feeHeadRules',
              label: 'Fee Heads Configured',
              align: 'center' as const,
              render: (_: any, row: any) => {
                const rules: any[] = row.feeHeadRules ?? [];
                const enabled = rules.filter((r: any) => r.prorationApplicable).length;
                const total = rules.length;
                return (
                  <Chip
                    label={total > 0 ? `${enabled} / ${total}` : '-'}
                    size="small"
                    color={enabled > 0 ? 'primary' : 'default'}
                    variant={enabled > 0 ? 'filled' : 'outlined'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                );
              },
            },
            {
              id: 'usedByCount',
              label: 'Used By',
              align: 'center' as const,
              render: (_: any, row: any) => (
                <Typography variant="caption" fontSize="13px">
                  {row.usedByCount != null
                    ? `${row.usedByCount} structure${row.usedByCount !== 1 ? 's' : ''}`
                    : '-'}
                </Typography>
              ),
            },
          ]
        : []),
      {
        id: 'effectiveFrom',
        label: 'Effective From',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value ? new Date(value).toLocaleDateString('en-IN') : '-'}
          </Typography>
        ),
      },
      {
        id: 'updatedBy',
        label: 'Updated By',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'updatedAt',
        label: 'Last Updated',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value ? new Date(value).toLocaleDateString('en-IN') : '-'}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        filterType: 'enum',
        sticky: true,
        enumOptions: [
          { label: 'Active', value: 'Active' },
          { label: 'Archived', value: 'Archived' },
        ],
        render: (value) => (
          <Label color={STATUS_COLOR[value as FinancePolicyStatus] ?? 'default'}>{value}</Label>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 80,
        render: (_, row) => {
          const policy = row as IFinancePolicyRow;
          return (
            <ThreeDotsActions
              showThreeDots
              showViewIcon
              handleViewClick={() => {
                setSelected(policy);
                detailsDialog.onTrue();
              }}
              showEditIcon={policy.status !== 'Archived'}
              handleEditClick={() => onEdit(policy)}
              showDeleteIcon={isPolicyDeletable(policyType, policy.status)}
              disableDeleteIcon={policy.isUsedInDownstream}
              handleDeleteClick={() => {
                setSelected(policy);
                deleteDialog.onTrue();
              }}
              actions={({ popover }) => (
                <>
                  <MenuItem
                    disabled={isCloning}
                    onClick={async () => {
                      popover.onClose();
                      try {
                        await clonePolicy({
                          sourcePolicyId: policy.id,
                          targetAcademicYearId: academicYearId || policy.academicYearId,
                        }).unwrap();
                        shikshaMitraToast.success({
                          message: `Policy "${policy.policyName}" cloned successfully.`,
                        });
                      } catch {
                        shikshaMitraToast.error({ message: 'Failed to clone policy.' });
                      }
                    }}
                  >
                    <Iconify icon="mdi:content-copy" sx={{ mr: 1, width: 18, height: 18 }} />
                    Clone
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setSelected(policy);
                      auditDialog.onTrue();
                    }}
                  >
                    <Iconify icon="mdi:history" sx={{ mr: 1, width: 18, height: 18 }} />
                    Audit Trail
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      setSelected(policy);
                      versionDialog.onTrue();
                    }}
                  >
                    <Iconify
                      icon="mdi:timeline-clock-outline"
                      sx={{ mr: 1, width: 18, height: 18 }}
                    />
                    Version History
                  </MenuItem>

                  <MenuItem
                    onClick={async () => {
                      popover.onClose();
                      const isRestoring = policy.status === 'Archived';
                      try {
                        if (isCollectionKind) {
                          if (isRestoring) {
                            await unarchiveCollectionPolicy(policy.id).unwrap();
                          } else {
                            await archiveCollectionPolicy(policy.id).unwrap();
                          }
                        } else {
                          const newStatus: FinancePolicyStatus = isRestoring
                            ? 'Active'
                            : 'Archived';
                          await patchPolicy({ id: policy.id, body: { status: newStatus } });
                        }
                        shikshaMitraToast.success({
                          message: `Policy ${policy.policyName} ${
                            isRestoring ? 'restored' : 'archived'
                          } successfully.`,
                        });
                      } catch {
                        shikshaMitraToast.error({ message: 'Failed to update policy status.' });
                      }
                    }}
                  >
                    <Iconify
                      icon={
                        policy.status === 'Archived'
                          ? 'mdi:archive-arrow-up-outline'
                          : 'mdi:archive-outline'
                      }
                      sx={{ mr: 1, width: 18, height: 18 }}
                    />
                    {policy.status === 'Archived' ? 'Restore' : 'Archive'}
                  </MenuItem>
                </>
              )}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      onEdit,
      isCloning,
      academicYearId,
      isCollectionKind,
      archiveCollectionPolicy,
      unarchiveCollectionPolicy,
    ]
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <CustomizableTable
        tableId={`finance-${policyType}-policy-table`}
        isLoading={isLoading || isFetching}
        columns={columns}
        data={policyData?.items || []}
        serverSidePagination
        serverSideSearch
        serverSideFilter
        totalCount={policyData?.totalCount}
        onServerPagination={(page, pageSize) =>
          setQueryParams((prev) => ({ ...prev, page, pageSize }))
        }
        onServerSearch={(search) => setQueryParams((prev) => ({ ...prev, search, page: 1 }))}
        onServerFilter={(filters) => {
          const statusFilter = filters.find((f) => f.column === 'status');
          setQueryParams((prev) => ({
            ...prev,
            status: statusFilter ? (statusFilter.value as FinancePolicyStatus) : '',
            page: 1,
          }));
        }}
        noDataText={
          <>
            No policy found.{' '}
            <Box
              component="span"
              onClick={onAdd}
              color="primary.main"
              fontWeight={600}
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Add Policy
            </Box>
          </>
        }
      />

      {/* Details Dialog */}
      <FinancePolicyDetailsDrawer
        open={detailsDialog.value}
        onClose={() => {
          detailsDialog.onFalse();
          setSelected(null);
        }}
        policy={selected}
        policyDetails={policyDetails}
        isLoading={isDetailsLoading}
      />

      {/* Audit Drawer */}
      <FinancePolicyAuditDrawer
        open={auditDialog.value}
        onClose={() => {
          auditDialog.onFalse();
          setSelected(null);
        }}
        policy={selected}
      />

      {/* Version History Drawer */}
      <FinancePolicyVersionDrawer
        open={versionDialog.value}
        onClose={() => {
          versionDialog.onFalse();
          setSelected(null);
        }}
        policy={selected}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteDialog.value}
        icon="warning"
        onClose={() => {
          deleteDialog.onFalse();
          setTimeout(() => setSelected(null), 200);
        }}
        title="Delete Policy"
        content={
          <>
            Are you sure you want to delete policy <strong>{selected?.policyName}</strong>?
            {selected?.isUsedInDownstream && (
              <Box mt={1} color="error.main" fontSize="12px">
                This policy is currently in use and cannot be deleted.
              </Box>
            )}
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={selected?.isUsedInDownstream}
            onClick={async () => {
              try {
                await deletePolicy(selected?.id as string);
                shikshaMitraToast.success({
                  message: `Policy ${selected?.policyName} deleted successfully.`,
                });
              } catch {
                shikshaMitraToast.error({ message: 'Failed to delete policy.' });
              }
              deleteDialog.onFalse();
              setSelected(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
    </>
  );
};

export default FinancePolicyTable;
