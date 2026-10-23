'use client';

import type { RootState } from 'src/redux/store';
import type { IData, IColumn, IParams } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';

import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Typography,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  useGetRefundPoliciesQuery,
  useGetRefundPolicyByIdQuery,
  useCloneRefundPolicyMutation,
  useArchiveRefundPolicyMutation,
  useUnarchiveRefundPolicyMutation,
} from 'src/redux/finance/refundPolicy';
import {
  useGetFinancePoliciesQuery,
  useGetFinancePolicyByIdQuery,
  usePatchFinancePolicyMutation,
  useCloneFinancePolicyMutation,
  useDeleteFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';
import {
  useGetProrationPoliciesQuery,
  useGetProrationPolicyByIdQuery,
  useCloneProrationPolicyMutation,
  useArchiveProrationPolicyMutation,
  useUnarchiveProrationPolicyMutation,
} from 'src/redux/finance/prorationPolicy';
import {
  useGetCollectionPoliciesQuery,
  useGetCollectionPolicyByIdQuery,
  useCloneCollectionPolicyMutation,
  useArchiveCollectionPolicyMutation,
  useUnarchiveCollectionPolicyMutation,
} from 'src/redux/finance/collectionPolicy';
import {
  useGetConcessionPoliciesQuery,
  useGetConcessionPolicyByIdQuery,
  useCloneConcessionPolicyMutation,
  useArchiveConcessionPolicyMutation,
  useUnarchiveConcessionPolicyMutation,
} from 'src/redux/finance/concessionPolicy';

import { policyTableFilterArgs } from './policyTableQuery';
import FinancePolicyAuditDrawer from './FinancePolicyAuditDrawer';
import FinancePolicyDetailsDrawer from './FinancePolicyDetailsDrawer';
import FinancePolicyVersionDrawer from './FinancePolicyVersionDrawer';
import {
  concessionFilterArgs,
  normalizeConcessionFilters,
} from './concession/concessionTableQuery';
import {
  policyDateLabel,
  CONCESSION_SCOPES,
  CONCESSION_METHODS,
  concessionValueLabel,
  concessionOptionLabel,
  CONCESSION_VALUE_SOURCES,
} from './concession/concessionPresentation';

import type {
  IFinancePolicyRow,
  FinancePolicyStatus,
  IFinancePolicyTableProps,
} from '../types/finance-policy.types';
import CustomTooltip from 'src/components/custom-tooltip';

// ─── Status label colour map ───────────────────────────────────────────────────

const STATUS_COLOR: Record<FinancePolicyStatus, 'success' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Published: 'success',
  Draft: 'warning',
  Inactive: 'error',
  Archived: 'default',
};

const BOOLEAN_OPTIONS = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

const LATE_FEE_TYPES = [
  'Flat',
  'Percentage',
  'PerDay',
  'PerWeek',
  'PerMonth',
  'Compound',
  'Slab',
].map((value) => ({ label: value.replace(/([a-z])([A-Z])/g, '$1 $2'), value }));

const REFUND_AMOUNT_MODES = [
  { label: 'Staff-entered amount', value: 'ManualUpToEligible' },
  { label: 'Full eligible balance', value: 'RemainingPaidAmount' },
  { label: 'Fixed amount', value: 'FixedAmount' },
  { label: 'Percentage of eligible balance', value: 'Percentage' },
];

const REFUND_FEE_SCOPES = [
  { label: 'All fee heads', value: 'AllFeeHeads' },
  { label: 'Selected fee heads', value: 'SelectedFeeHeads' },
];

const REFUND_PAYOUT_METHODS = [
  { label: 'Cash', value: 'Cash' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Demand draft', value: 'DemandDraft' },
  { label: 'Bank transfer', value: 'BankTransfer' },
  { label: 'UPI', value: 'Upi' },
];

// Collection policies use archive/restore as their lifecycle and are never hard-deleted
// from this table because fee structures and historical version snapshots may reference them.
const isPolicyDeletable = (
  policyType: IFinancePolicyTableProps['policyType'],
  status: FinancePolicyStatus
): boolean =>
  !['collection', 'concession', 'refund', 'proration'].includes(policyType) && status === 'Draft';

// ─── Component ────────────────────────────────────────────────────────────────

const FinancePolicyTable: React.FC<IFinancePolicyTableProps> = ({
  policyType,
  onAdd,
  onEdit,
  archived = false,
}) => {
  const lifecycleDialog = useBoolean();
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
  const [policyFilters, setPolicyFilters] = React.useState<IParams['filters']>([]);
  const [policySorts, setPolicySorts] = React.useState<IParams['sorts']>([]);

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const academicYearId = currentYear?.id || '';

  useEffect(() => {
    setQueryParams((previous) => ({ ...previous, page: 1, status: '' }));
    setPolicyFilters([]);
    setPolicySorts([]);
  }, [archived]);

  // ── Queries / Mutations ──────────────────────────────────────────────────────
  // Each policy workspace uses its own list API. Hooks are gated with `skip` so
  // only the selected policy type requests rows.
  const isCollectionKind = policyType === 'collection';
  const isConcessionKind = policyType === 'concession';
  const isRefundKind = policyType === 'refund';
  const isProrationKind = policyType === 'proration';
  const policyQueryFilters = policyTableFilterArgs(policyFilters);
  const concessionQueryFilters = concessionFilterArgs(policyFilters);
  const policySorting = policySorts[0]
    ? `${policySorts[0].column} ${policySorts[0].direction}`
    : undefined;
  const usesArchiveTabs = isCollectionKind || isConcessionKind || isRefundKind || isProrationKind;
  const concessionPermissions = financePermissions.policies.concessionPolicyActions;
  const collectionPermissions = financePermissions.policies.collectionPolicyActions;
  const refundPermissions = financePermissions.policies.refundPolicyActions;
  const prorationPermissions = financePermissions.policies.prorationPolicyActions;
  const canCreatePolicy = isCollectionKind
    ? hasGrantedPermission(permissions, collectionPermissions.create)
    : isConcessionKind
      ? hasGrantedPermission(permissions, concessionPermissions.create)
      : isRefundKind
        ? hasGrantedPermission(permissions, refundPermissions.create)
        : !isProrationKind || hasGrantedPermission(permissions, prorationPermissions.create);
  const canEditPolicy = isCollectionKind
    ? hasGrantedPermission(permissions, collectionPermissions.edit)
    : isConcessionKind
      ? hasGrantedPermission(permissions, concessionPermissions.edit)
      : isRefundKind
        ? hasGrantedPermission(permissions, refundPermissions.edit)
        : !isProrationKind || hasGrantedPermission(permissions, prorationPermissions.edit);
  const canClonePolicy = isCollectionKind
    ? hasGrantedPermission(permissions, [collectionPermissions.clone, collectionPermissions.create])
    : isConcessionKind
      ? hasGrantedPermission(permissions, concessionPermissions.clone)
      : isRefundKind
        ? hasGrantedPermission(permissions, refundPermissions.clone)
        : !isProrationKind || hasGrantedPermission(permissions, prorationPermissions.clone);
  const canArchivePolicy = isCollectionKind
    ? hasGrantedPermission(permissions, collectionPermissions.archive)
    : isConcessionKind
      ? hasGrantedPermission(permissions, concessionPermissions.archive)
      : isRefundKind
        ? hasGrantedPermission(permissions, refundPermissions.archive)
        : !isProrationKind || hasGrantedPermission(permissions, prorationPermissions.archive);
  const canRestorePolicy = isCollectionKind
    ? hasGrantedPermission(permissions, [
        collectionPermissions.restore,
        collectionPermissions.archive,
      ])
    : isConcessionKind
      ? hasGrantedPermission(permissions, concessionPermissions.restore)
      : isRefundKind
        ? hasGrantedPermission(permissions, refundPermissions.restore)
        : !isProrationKind || hasGrantedPermission(permissions, prorationPermissions.restore);
  const canViewPolicyVersions = isCollectionKind
    ? hasGrantedPermission(permissions, collectionPermissions.viewVersions)
    : isConcessionKind
      ? hasGrantedPermission(permissions, concessionPermissions.viewVersions)
      : isRefundKind
        ? hasGrantedPermission(permissions, refundPermissions.viewVersions)
        : !isProrationKind || hasGrantedPermission(permissions, prorationPermissions.viewVersions);

  const {
    data: genericPolicyData,
    isLoading: isGenericLoading,
    isFetching: isGenericFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinancePoliciesQuery,
    params: { policyType, ...queryParams },
    options: { skip: isCollectionKind || isConcessionKind || isRefundKind || isProrationKind },
  });

  const {
    currentData: collectionPolicyData,
    isError: isCollectionError,
    refetch: refetchCollectionPolicies,
    isLoading: isCollectionLoading,
    isFetching: isCollectionFetching,
  } = useGetCollectionPoliciesQuery(
    {
      academicYearId,
      status: archived ? 'Archived' : queryParams.status || undefined,
      includeArchived: archived,
      search: queryParams.search || undefined,
      ...policyQueryFilters,
      sorting: policySorting,
      skipCount: (queryParams.page - 1) * queryParams.pageSize,
      maxResultCount: queryParams.pageSize,
    },
    { skip: !isCollectionKind || !academicYearId }
  );

  const {
    currentData: concessionPolicyData,
    isError: isConcessionError,
    refetch: refetchConcessionPolicies,
    isLoading: isConcessionLoading,
    isFetching: isConcessionFetching,
  } = useGetConcessionPoliciesQuery(
    {
      academicYearId,
      status: archived ? 'Archived' : queryParams.status || undefined,
      search: queryParams.search || undefined,
      ...concessionQueryFilters,
      sorting: policySorting,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    },
    { skip: !isConcessionKind || !academicYearId }
  );

  const {
    currentData: refundPolicyData,
    isError: isRefundError,
    refetch: refetchRefundPolicies,
    isLoading: isRefundLoading,
    isFetching: isRefundFetching,
  } = useGetRefundPoliciesQuery(
    {
      academicYearId,
      status: archived ? 'Archived' : queryParams.status || undefined,
      search: queryParams.search || undefined,
      ...policyQueryFilters,
      sorting: policySorting,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    },
    { skip: !isRefundKind || !academicYearId }
  );

  const {
    currentData: prorationPolicyData,
    isError: isProrationError,
    refetch: refetchProrationPolicies,
    isLoading: isProrationLoading,
    isFetching: isProrationFetching,
  } = useGetProrationPoliciesQuery(
    {
      academicYearId,
      status: archived ? 'Archived' : queryParams.status || undefined,
      search: queryParams.search || undefined,
      ...policyQueryFilters,
      sorting: policySorting,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    },
    { skip: !isProrationKind || !academicYearId }
  );

  const policyData = isCollectionKind
    ? collectionPolicyData && {
        items: collectionPolicyData.items,
        totalCount: collectionPolicyData.totalCount,
      }
    : isConcessionKind
      ? concessionPolicyData
      : isRefundKind
        ? refundPolicyData
        : isProrationKind
          ? prorationPolicyData
          : genericPolicyData;
  const isLoading = isCollectionKind
    ? isCollectionLoading
    : isConcessionKind
      ? isConcessionLoading
      : isRefundKind
        ? isRefundLoading
        : isProrationKind
          ? isProrationLoading
          : isGenericLoading;
  const isFetching = isCollectionKind
    ? isCollectionFetching
    : isConcessionKind
      ? isConcessionFetching
      : isRefundKind
        ? isRefundFetching
        : isProrationKind
          ? isProrationFetching
          : isGenericFetching;

  const [archiveCollectionPolicy] = useArchiveCollectionPolicyMutation();
  const [unarchiveCollectionPolicy] = useUnarchiveCollectionPolicyMutation();
  const [cloneCollectionPolicy, { isLoading: isCollectionCloning }] =
    useCloneCollectionPolicyMutation();
  const [archiveConcessionPolicy, { isLoading: isConcessionArchiving }] =
    useArchiveConcessionPolicyMutation();
  const [unarchiveConcessionPolicy, { isLoading: isConcessionRestoring }] =
    useUnarchiveConcessionPolicyMutation();
  const [cloneConcessionPolicy, { isLoading: isConcessionCloning }] =
    useCloneConcessionPolicyMutation();
  const [archiveRefundPolicy] = useArchiveRefundPolicyMutation();
  const [unarchiveRefundPolicy] = useUnarchiveRefundPolicyMutation();
  const [cloneRefundPolicy, { isLoading: isRefundCloning }] = useCloneRefundPolicyMutation();
  const [archiveProrationPolicy] = useArchiveProrationPolicyMutation();
  const [unarchiveProrationPolicy] = useUnarchiveProrationPolicyMutation();
  const [cloneProrationPolicy, { isLoading: isProrationCloning }] =
    useCloneProrationPolicyMutation();

  const { data: genericPolicyDetails, isLoading: isGenericDetailsLoading } =
    useGetFinancePolicyByIdQuery(selected?.id || '', {
      skip:
        !selected?.id ||
        !detailsDialog.value ||
        isCollectionKind ||
        isConcessionKind ||
        isRefundKind ||
        isProrationKind,
    });
  const { data: collectionPolicyDetails, isLoading: isCollectionDetailsLoading } =
    useGetCollectionPolicyByIdQuery(selected?.id || '', {
      skip: !selected?.id || !detailsDialog.value || !isCollectionKind,
    });
  const { currentData: concessionPolicyDetails, isFetching: isConcessionDetailsLoading } =
    useGetConcessionPolicyByIdQuery(selected?.id || '', {
      skip: !selected?.id || !detailsDialog.value || !isConcessionKind,
    });
  const {
    currentData: refundPolicyDetails,
    isFetching: isRefundDetailsLoading,
    isError: isRefundDetailsError,
    refetch: refetchRefundDetails,
  } = useGetRefundPolicyByIdQuery(selected?.id || '', {
    skip: !selected?.id || !detailsDialog.value || !isRefundKind,
  });
  const { data: prorationPolicyDetails, isLoading: isProrationDetailsLoading } =
    useGetProrationPolicyByIdQuery(selected?.id || '', {
      skip: !selected?.id || !detailsDialog.value || !isProrationKind,
    });
  const policyDetails = isCollectionKind
    ? collectionPolicyDetails
    : isConcessionKind
      ? concessionPolicyDetails
      : isRefundKind
        ? refundPolicyDetails
        : isProrationKind
          ? prorationPolicyDetails
          : genericPolicyDetails;
  const isDetailsLoading = isCollectionKind
    ? isCollectionDetailsLoading
    : isConcessionKind
      ? isConcessionDetailsLoading
      : isRefundKind
        ? isRefundDetailsLoading ||
          Boolean(selected && detailsDialog.value && !refundPolicyDetails && !isRefundDetailsError)
        : isProrationKind
          ? isProrationDetailsLoading
          : isGenericDetailsLoading;

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
        label: isRefundKind ? 'Policy name' : 'Policy Name',
        align: 'left',
        filterType: usesArchiveTabs ? 'string' : undefined,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: !isRefundKind,
        minWidth: isRefundKind ? 180 : 240,
        render: (value, row) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 0.75,
            }}
          >
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {value}
            </Typography>
            {(row as IFinancePolicyRow).isDefault && (
              <Chip
                label="Default"
                size="small"
                color="primary"
                variant={isRefundKind ? 'soft' : 'outlined'}
                sx={{ height: 20, flexShrink: 0, ...(isRefundKind && { fontSize: 11 }) }}
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
              id: 'valueSource',
              label: 'Value source',
              align: 'left' as const,
              minWidth: 155,
              filterType: 'enum' as const,
              enumOptions: CONCESSION_VALUE_SOURCES,
              render: (value: string) => (
                <Typography variant="body2">
                  {concessionOptionLabel(CONCESSION_VALUE_SOURCES, value)}
                </Typography>
              ),
            },
            {
              id: 'calculationMethod',
              label: 'Calculation',
              align: 'left' as const,
              minWidth: 140,
              filterType: 'enum' as const,
              enumOptions: CONCESSION_METHODS,
              render: (value: string) => (
                <Typography variant="body2">
                  {concessionOptionLabel(CONCESSION_METHODS, value)}
                </Typography>
              ),
            },
            {
              id: 'policyLimit',
              label: 'Value / limit',
              align: 'left' as const,
              minWidth: 140,
              filterType: 'number' as const,
              renderColumn: () => (
                <CustomTooltip
                  title="Filter the displayed number. Use Calculation to choose percentage or rupee policies."
                  arrow
                >
                  <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>
                    <Iconify icon="solar:info-circle-linear" width={14} />
                  </Box>
                </CustomTooltip>
              ),
              render: (_: unknown, row: any) => (
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {concessionValueLabel(row)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.valueSource === 'PolicyFixed' ? 'Fixed value' : 'Maximum'}
                  </Typography>
                </Box>
              ),
            },
            {
              id: 'applyOn',
              label: 'Apply on',
              align: 'left' as const,
              minWidth: 195,
              filterType: 'enum' as const,
              enumOptions: CONCESSION_SCOPES,
              render: (value: string) => (
                <Typography variant="body2">
                  {concessionOptionLabel(CONCESSION_SCOPES, value)}
                </Typography>
              ),
            },
          ]
        : []),
      ...(policyType === 'refund'
        ? [
            {
              id: 'amountMode',
              label: 'Amount rule',
              minWidth: 170,
              align: 'left' as const,
              filterType: 'enum' as const,
              enumOptions: REFUND_AMOUNT_MODES,
              render: (value: any) => (
                <Typography variant="body2">
                  {(
                    {
                      ManualUpToEligible: 'Staff-entered amount',
                      RemainingPaidAmount: 'Full eligible balance',
                      FixedAmount: 'Fixed amount',
                      Percentage: 'Percentage of eligible balance',
                    } as Record<string, string>
                  )[value] ||
                    value ||
                    '—'}
                </Typography>
              ),
            },
            {
              id: 'feeHeadScope',
              label: 'Refundable fees',
              minWidth: 140,
              align: 'left' as const,
              filterType: 'enum' as const,
              enumOptions: REFUND_FEE_SCOPES,
              render: (value: any, row: any) => (
                <Typography variant="body2">
                  {value === 'SelectedFeeHeads'
                    ? `${row.applicableFeeHeadIds?.length ?? 0} fee head${row.applicableFeeHeadIds?.length === 1 ? '' : 's'}`
                    : 'All fee heads'}
                </Typography>
              ),
            },
            {
              id: 'allowedPayoutMethods',
              label: 'Payout methods',
              align: 'left' as const,
              minWidth: 150,
              filterType: 'enum' as const,
              enumOptions: REFUND_PAYOUT_METHODS,
              renderColumn: () => (
                <CustomTooltip title="Filter policies that allow a payout method." arrow>
                  <Box component="span" sx={{ display: 'inline-flex', ml: 0.5 }}>
                    <Iconify icon="solar:info-circle-linear" width={14} />
                  </Box>
                </CustomTooltip>
              ),
              render: (value: string[], row: IData) => {
                const methods = Array.isArray(value)
                  ? value.map(
                      (method) =>
                        (
                          ({
                            BankTransfer: 'Bank transfer',
                            DemandDraft: 'Demand draft',
                            Upi: 'UPI',
                          }) as Record<string, string>
                        )[method] || method
                    )
                  : [];
                return (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="body2">
                      {methods.length > 1 ? `${methods.length} methods` : methods[0] || '—'}
                    </Typography>
                    {methods.length > 1 && (
                      <CustomTooltip
                        arrow
                        title={
                          <Typography variant="body2" sx={{ p: 1.5 }}>
                            {methods.join(', ')}
                          </Typography>
                        }
                      >
                        <IconButton
                          size="small"
                          aria-label={`Payout methods for ${row.policyName}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} />
                        </IconButton>
                      </CustomTooltip>
                    )}
                  </Stack>
                );
              },
            },
            {
              id: 'allowPartialRefund',
              label: 'Partial refund',
              align: 'left' as const,
              minWidth: 130,
              filterType: 'enum' as const,
              enumOptions: [
                { label: 'Allowed', value: 'true' },
                { label: 'Full only', value: 'false' },
              ],
              render: (value: any) => (
                <Label color={value ? 'primary' : 'default'}>
                  {value ? 'Allowed' : 'Full only'}
                </Label>
              ),
            },
          ]
        : []),
      ...(policyType === 'collection'
        ? [
            {
              cellSx: { textAlign: 'center' as const },
              id: 'enableLateFee',
              label: 'Late Fee',
              align: 'left' as const,
              filterType: 'enum' as const,
              enumOptions: [
                { label: 'Enabled', value: 'true' },
                { label: 'Disabled', value: 'false' },
              ],
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
              filterType: 'enum' as const,
              enumOptions: LATE_FEE_TYPES,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value || '-'}
                </Typography>
              ),
            },
            {
              cellSx: { textAlign: 'center' as const },
              id: 'gracePeriodDays',
              label: 'Grace Days',
              align: 'left' as const,
              filterType: 'number' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value != null ? `${value} days` : '-'}
                </Typography>
              ),
            },
            {
              cellSx: { textAlign: 'center' as const },
              id: 'allowOnlineCollection',
              label: 'Online Pay',
              align: 'left' as const,
              filterType: 'enum' as const,
              enumOptions: BOOLEAN_OPTIONS,
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
              cellSx: { textAlign: 'center' as const },
              id: 'feeHeadRules',
              label: 'Fee Heads Configured',
              align: 'left' as const,
              filterType: 'number' as const,
              render: (_: any, row: any) => {
                const rules: any[] = row.feeHeadRules ?? [];
                const total = rules.length;
                return (
                  <Chip
                    label={total}
                    size="small"
                    color={total > 0 ? 'primary' : 'default'}
                    variant={total > 0 ? 'filled' : 'outlined'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                );
              },
            },
          ]
        : []),
      ...(policyType === 'payment'
        ? [
            {
              id: 'effectiveFrom',
              label: 'Effective From',
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value ? new Date(value).toLocaleDateString('en-IN') : '-'}
                </Typography>
              ),
            },
          ]
        : []),
      ...(!usesArchiveTabs
        ? [
            {
              id: 'updatedBy',
              label: isRefundKind ? 'Updated by' : 'Updated By',
              defaultHidden: isRefundKind,
              align: 'left' as const,
              render: (value: any) => (
                <Typography variant="caption" fontSize="13px">
                  {value && value !== '-' ? value : '—'}
                </Typography>
              ),
            },
          ]
        : []),
      {
        id: 'updatedAt',
        label: isRefundKind ? 'Last updated' : 'Last Updated',
        defaultHidden: isRefundKind,
        align: 'left',
        minWidth: isConcessionKind ? 140 : undefined,
        filterType: usesArchiveTabs ? 'date' : undefined,
        render: (value, row: any) => (
          <Typography variant="caption" fontSize="13px">
            {policyDateLabel(row.updatedAt || row.lastModificationTime || row.creationTime)}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: 100,
        filterType: 'enum',
        isFilter: !(usesArchiveTabs && archived),
        isSort: !(usesArchiveTabs && archived),
        sticky: true,
        stickyPosition: 'right',
        enumOptions: usesArchiveTabs
          ? archived
            ? [{ label: 'Archived', value: 'Archived' }]
            : [
                { label: 'Draft', value: 'Draft' },
                { label: 'Active', value: 'Active' },
              ]
          : [
              { label: 'Draft', value: 'Draft' },
              { label: 'Active', value: 'Active' },
              { label: 'Archived', value: 'Archived' },
            ],
        render: (value) => (
          <Label
            color={
              isRefundKind && value === 'Draft'
                ? 'default'
                : (STATUS_COLOR[value as FinancePolicyStatus] ?? 'default')
            }
          >
            {value}
          </Label>
        ),
      },
      {
        id: 'action',
        label: 'Actions',
        align: 'left',
        excludeFromExport: true,
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        minWidth: 176,
        width: 176,
        render: (_, row) => {
          const policy = row as IFinancePolicyRow;
          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              sx={{ justifyContent: 'flex-start' }}
              placement="right-top"
              moreLabel={`Actions for ${policy.policyName}`}
              actions={[
                ...(canEditPolicy && policy.status !== 'Archived'
                  ? [
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: 'solar:pen-bold',
                        onClick: () => onEdit(policy),
                      },
                    ]
                  : []),
                ...(canClonePolicy
                  ? [
                      {
                        id: 'clone',
                        label: 'Clone',
                        icon: 'mdi:content-copy',
                        disabled:
                          isCloning ||
                          isCollectionCloning ||
                          isConcessionCloning ||
                          isRefundCloning ||
                          isProrationCloning,
                        onClick: async () => {
                          try {
                            if (isCollectionKind) {
                              await cloneCollectionPolicy({
                                id: policy.id,
                                body: {
                                  targetAcademicYearId: academicYearId || policy.academicYearId,
                                },
                              }).unwrap();
                            } else if (isConcessionKind) {
                              await cloneConcessionPolicy({
                                id: policy.id,
                                body: {
                                  targetAcademicYearId: academicYearId || policy.academicYearId,
                                },
                              }).unwrap();
                            } else if (isRefundKind) {
                              await cloneRefundPolicy({
                                id: policy.id,
                                body: {
                                  targetAcademicYearId: academicYearId || policy.academicYearId,
                                },
                              }).unwrap();
                            } else if (isProrationKind) {
                              await cloneProrationPolicy({
                                id: policy.id,
                                body: {
                                  targetAcademicYearId: academicYearId || policy.academicYearId,
                                },
                              }).unwrap();
                            } else {
                              await clonePolicy({
                                sourcePolicyId: policy.id,
                                targetAcademicYearId: academicYearId || policy.academicYearId,
                              }).unwrap();
                            }
                            shikshaMitraToast.success({
                              message: `Policy "${policy.policyName}" cloned successfully.`,
                            });
                          } catch (error) {
                            shikshaMitraToast.error({
                              message: parseApiProblemDetail(error).detail,
                            });
                          }
                        },
                      },
                    ]
                  : []),
                ...(isPolicyDeletable(policyType, policy.status)
                  ? [
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'solar:trash-bin-trash-bold',
                        color: 'error.main',
                        disabled: policy.isUsedInDownstream,
                        tooltip:
                          'This item cannot be deleted because it is already used in other parts of the system. Please remove all references first.',
                        onClick: () => {
                          setSelected(policy);
                          deleteDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                ...(canViewPolicyVersions
                  ? [
                      {
                        id: 'audit-trail',
                        label: 'Audit Trail',
                        icon: 'mdi:history',
                        onClick: () => {
                          setSelected(policy);
                          auditDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                ...(canViewPolicyVersions
                  ? [
                      {
                        id: 'version-history',
                        label: 'Version History',
                        icon: 'mdi:timeline-clock-outline',
                        onClick: () => {
                          setSelected(policy);
                          versionDialog.onTrue();
                        },
                      },
                    ]
                  : []),
                ...((policy.status === 'Archived' && canRestorePolicy) ||
                (policy.status !== 'Archived' && canArchivePolicy)
                  ? [
                      {
                        id: 'status',
                        label: policy.status === 'Archived' ? 'Restore' : 'Archive',
                        icon:
                          policy.status === 'Archived'
                            ? 'mdi:archive-arrow-up-outline'
                            : 'mdi:archive-outline',
                        disabled:
                          policy.status !== 'Archived' &&
                          (policy.isDefault || policy.isUsedInDownstream),
                        tooltip:
                          policy.status !== 'Archived' && policy.isDefault
                            ? 'Designate another Active policy as Default before archiving this policy.'
                            : policy.status !== 'Archived' && policy.isUsedInDownstream
                              ? 'This policy is used by fee structures or assignments and cannot be archived.'
                              : undefined,
                        onClick: async () => {
                          const isRestoring = policy.status === 'Archived';
                          if (isConcessionKind) {
                            setSelected(policy);
                            lifecycleDialog.onTrue();
                            return;
                          }
                          try {
                            if (isCollectionKind) {
                              if (isRestoring) {
                                await unarchiveCollectionPolicy(policy.id).unwrap();
                              } else {
                                await archiveCollectionPolicy(policy.id).unwrap();
                              }
                            } else if (isConcessionKind) {
                              if (isRestoring) await unarchiveConcessionPolicy(policy.id).unwrap();
                              else await archiveConcessionPolicy(policy.id).unwrap();
                            } else if (isRefundKind) {
                              if (isRestoring) await unarchiveRefundPolicy(policy.id).unwrap();
                              else await archiveRefundPolicy(policy.id).unwrap();
                            } else if (isProrationKind) {
                              if (isRestoring) await unarchiveProrationPolicy(policy.id).unwrap();
                              else await archiveProrationPolicy(policy.id).unwrap();
                            } else {
                              const newStatus: FinancePolicyStatus = isRestoring
                                ? 'Active'
                                : 'Archived';
                              await patchPolicy({ id: policy.id, body: { status: newStatus } });
                            }
                            shikshaMitraToast.success({
                              message: `Policy ${policy.policyName} ${
                                isRestoring ? 'restored to Draft' : 'archived'
                              } successfully.`,
                            });
                          } catch (error) {
                            shikshaMitraToast.error({
                              message: parseApiProblemDetail(error).detail,
                            });
                          }
                        },
                      },
                    ]
                  : []),
              ]}
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
      isConcessionKind,
      isRefundKind,
      isProrationKind,
      archiveCollectionPolicy,
      unarchiveCollectionPolicy,
      archiveConcessionPolicy,
      unarchiveConcessionPolicy,
      cloneConcessionPolicy,
      cloneCollectionPolicy,
      archiveRefundPolicy,
      unarchiveRefundPolicy,
      cloneRefundPolicy,
      archiveProrationPolicy,
      unarchiveProrationPolicy,
      cloneProrationPolicy,
      isCollectionCloning,
      isConcessionCloning,
      isRefundCloning,
      isProrationCloning,
      canEditPolicy,
      canClonePolicy,
      canArchivePolicy,
      canRestorePolicy,
      canViewPolicyVersions,
      archived,
    ]
  );

  const listError =
    (isCollectionKind && isCollectionError) ||
    (isConcessionKind && isConcessionError) ||
    (isRefundKind && isRefundError) ||
    (isProrationKind && isProrationError);
  const policyLabel = isRefundKind
    ? 'Refund policies'
    : isConcessionKind
      ? 'Concession policies'
      : isCollectionKind
        ? 'Collection policies'
        : isProrationKind
          ? 'Proration policies'
          : 'Finance policies';
  const retryPolicies = () =>
    isRefundKind
      ? refetchRefundPolicies()
      : isConcessionKind
        ? refetchConcessionPolicies()
        : isCollectionKind
          ? refetchCollectionPolicies()
          : refetchProrationPolicies();
  const lifecycleBusy = isConcessionArchiving || isConcessionRestoring;
  const restoring = selected?.status === 'Archived';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {listError && Boolean(policyData?.items.length) && (
        <Alert
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={retryPolicies}>
              Retry
            </Button>
          }
        >
          Unable to load {policyLabel.toLowerCase()}.
        </Alert>
      )}
      {usesArchiveTabs && isFetching && Boolean(policyData) && (
        <LinearProgress aria-label={`Refreshing ${policyLabel.toLowerCase()}`} />
      )}
      <CustomizableTable
        tableId={`finance-${policyType}-policy-table`}
        isLoading={isLoading || (isFetching && !policyData)}
        errorContent={
          usesArchiveTabs && listError && !policyData?.items.length ? (
            <Stack spacing={1.5} alignItems="center">
              <Iconify
                icon="solar:danger-triangle-linear"
                width={32}
                sx={{ color: 'error.main' }}
              />
              <Typography variant="subtitle2">
                Unable to load {policyLabel.toLowerCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try again to load policies for this academic year.
              </Typography>
              <Button variant="outlined" color="inherit" size="small" onClick={retryPolicies}>
                Retry
              </Button>
            </Stack>
          ) : undefined
        }
        columns={columns}
        tableTitle={policyLabel}
        wrapperProps={{ sx: { flex: 1, height: 1, minHeight: 0 } }}
        tableContainerProps={{
          'aria-label': policyLabel,
          sx: { height: 1 },
        }}
        searchFieldProps={{
          placeholder: usesArchiveTabs ? 'Search policies by name…' : 'Search…',
        }}
        page={queryParams.page - 1}
        rowsPerPage={queryParams.pageSize}
        filters={usesArchiveTabs ? policyFilters : undefined}
        sorts={usesArchiveTabs ? policySorts : undefined}
        data={policyData?.items || []}
        handleRowClick={(row) => {
          setSelected(row as IFinancePolicyRow);
          detailsDialog.onTrue();
        }}
        rowProps={(row) => ({
          tabIndex: 0,
          'aria-label': `View policy ${row.policyName}`,
          onKeyDown: (event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              setSelected(row as IFinancePolicyRow);
              detailsDialog.onTrue();
            }
          },
          sx: {
            cursor: 'pointer',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: -2,
            },
          },
        })}
        serverSidePagination
        serverSideSearch
        serverSideFilter
        serverSideSort={usesArchiveTabs}
        serverSideSortMode="single"
        onServerSort={
          usesArchiveTabs
            ? (_column, sorts) => {
                setPolicySorts(sorts);
                setQueryParams((prev) => ({ ...prev, page: 1 }));
              }
            : undefined
        }
        totalCount={policyData?.totalCount}
        onServerPagination={(page, pageSize) =>
          setQueryParams((prev) => ({ ...prev, page, pageSize }))
        }
        onServerSearch={(search) => setQueryParams((prev) => ({ ...prev, search, page: 1 }))}
        onServerFilter={(filters) => {
          const activeFilters = usesArchiveTabs ? normalizeConcessionFilters(filters) : filters;
          if (usesArchiveTabs) setPolicyFilters(activeFilters);
          const statusFilter = activeFilters.find((f) => f.column === 'status');
          setQueryParams((prev) => ({
            ...prev,
            status:
              usesArchiveTabs && archived
                ? ''
                : statusFilter
                  ? (statusFilter.value as FinancePolicyStatus)
                  : '',
            page: 1,
          }));
        }}
        noDataText={
          listError ? (
            'Policies could not be loaded. Use Retry above.'
          ) : !academicYearId ? (
            'Select an academic year to view policies.'
          ) : queryParams.search ||
            queryParams.status ||
            (usesArchiveTabs && policyFilters.length) ? (
            'No policies match your search or filters.'
          ) : usesArchiveTabs && archived ? (
            'No archived policies.'
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No policies have been created for this academic year.
              </Typography>
              {canCreatePolicy && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onAdd}
                  sx={{ mt: 1.5 }}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  {isRefundKind ? 'Policy' : 'Create Policy'}
                </Button>
              )}
            </Box>
          )
        }
      />

      {/* Details Dialog */}
      <FinancePolicyDetailsDrawer
        open={detailsDialog.value}
        onClose={() => {
          detailsDialog.onFalse();
          setSelected(null);
        }}
        policy={
          selected
            ? {
                ...selected,
                policyType,
                academicYearName: selected.academicYearName || currentYear?.name || '',
              }
            : null
        }
        policyDetails={policyDetails}
        isLoading={isDetailsLoading}
        isError={isRefundKind && isRefundDetailsError}
        onRetry={isRefundKind ? refetchRefundDetails : undefined}
      />

      {/* Audit Drawer */}
      <FinancePolicyAuditDrawer
        open={auditDialog.value}
        onClose={() => {
          auditDialog.onFalse();
          setSelected(null);
        }}
        policy={
          selected
            ? {
                ...selected,
                policyType,
                academicYearName: selected.academicYearName || currentYear?.name || '',
              }
            : null
        }
      />

      {/* Version History Drawer */}
      <FinancePolicyVersionDrawer
        open={versionDialog.value}
        onClose={() => {
          versionDialog.onFalse();
          setSelected(null);
        }}
        policy={
          selected
            ? {
                ...selected,
                policyType,
                academicYearName: selected.academicYearName || currentYear?.name || '',
              }
            : null
        }
      />

      <ConfirmDialog
        open={lifecycleDialog.value}
        onClose={() => {
          if (!lifecycleBusy) {
            lifecycleDialog.onFalse();
            setSelected(null);
          }
        }}
        disableBackdropClick
        disableCancel={lifecycleBusy}
        disableEscapeKeyDown={lifecycleBusy}
        icon={restoring ? 'info' : 'warning'}
        title={restoring ? 'Restore Concession Policy?' : 'Archive Concession Policy?'}
        content={
          <>
            <strong>{selected?.policyName}</strong>
            {restoring
              ? ' will be restored as a draft. Review and activate it before using it on new requests.'
              : ' will move to Archived and become unavailable for new requests. Existing request history is preserved.'}
          </>
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            loading={lifecycleBusy}
            startIcon={
              <Iconify icon={restoring ? 'mdi:archive-arrow-up-outline' : 'mdi:archive-outline'} />
            }
            onClick={async () => {
              if (!selected || lifecycleBusy) return;
              try {
                if (restoring) await unarchiveConcessionPolicy(selected.id).unwrap();
                else await archiveConcessionPolicy(selected.id).unwrap();
                shikshaMitraToast.success({
                  message: restoring ? 'Policy restored to Draft.' : 'Policy archived.',
                });
                lifecycleDialog.onFalse();
                setSelected(null);
              } catch (error) {
                shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
              }
            }}
          >
            {restoring ? 'Restore as draft' : 'Archive policy'}
          </LoadingButton>
        }
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
            startIcon={<Iconify icon="mdi:delete-outline" />}
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
