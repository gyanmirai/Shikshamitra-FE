'use client';

import type { LabelColor } from 'src/components/label';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { PaymentTermListItem } from 'src/redux/finance/paymentTerm';

import React, { useMemo, useState } from 'react';
import { Label } from 'src/components/label';

import CustomizableTable from 'src/components/customizabaleTable';
import { Chip, Stack, Typography, Button, Drawer, Box } from '@mui/material';
import FinancePolicyDrawerHeader from 'src/screens/finance/policies/components/FinancePolicyDrawerHeader';
import { PaymentTermUsageBreakdown } from './PaymentTermUsage';

import type { IPaymentTermTableProps } from '../type';

export type PaymentTermDisplayStatus = PaymentTermListItem['status'];

export const getPaymentTermDisplayStatus = (term: PaymentTermListItem): PaymentTermDisplayStatus =>
  term.status;

export const canDeletePaymentTerm = (term: PaymentTermListItem) =>
  term.status !== 'Archived' &&
  term.hasDraft &&
  !term.hasPublishedVersion &&
  term.currentVersionNumber === 1 &&
  term.referencedStructureCount === 0;

const statusColor = (status: PaymentTermDisplayStatus): LabelColor => {
  if (status === 'Active') return 'success';
  if (status === 'Draft') return 'warning';
  return 'default';
};

const PaymentTermTable: React.FC<IPaymentTermTableProps> = ({
  data,
  loading,
  totalCount,
  page,
  rowsPerPage,
  searchTerm,
  onPaginationChange,
  onSearchChange,
  filters,
  onFiltersChange,
  onView,
  onVersionHistory,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onRestore,
  canView,
  canEdit,
  canPublish,
  canArchive,
  canRestore,
  canDelete,
  actionLoading,
}) => {
  const [usageTerm, setUsageTerm] = useState<PaymentTermListItem | null>(null);
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        isFilter: true,
        filterType: 'string' as const,
        label: 'Name',
        align: 'left',
        minWidth: 220,
        sticky: true,
        stickyPosition: 'left',
        render: (value) => (
          <Typography variant="subtitle2" fontWeight={600} fontSize="13px">
            {String(value)}
          </Typography>
        ),
      },
      {
        id: 'currentVersionNumber',
        isFilter: true,
        filterType: 'number' as const,
        label: 'Version',
        align: 'left',
        minWidth: 100,
        render: (value) => (
          <Typography variant="body2">
            {typeof value === 'number' && value > 0 ? `v${value}` : '-'}
          </Typography>
        ),
      },
      {
        id: 'usage',
        filterType: 'string' as const,
        label: 'Used In',
        align: 'left',
        minWidth: 190,
        isSort: false,
        isFilter: true,
        render: (_, row) => {
          const term = row as PaymentTermListItem;
          return term.usage ? (
            <Button size="small" onClick={() => setUsageTerm(term)} disabled={!canView}>
              {term.usage.feeHeadCount} fee heads · {term.usage.classCount} classes
            </Button>
          ) : (
            <Typography variant="body2">Usage unavailable</Typography>
          );
        },
      },
      {
        id: 'status',
        isFilter: true,
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Active', value: 'Active' },
          { label: 'Draft', value: 'Draft' },
          { label: 'Archived', value: 'Archived' },
        ],
        label: 'Status',
        align: 'left',
        minWidth: 240,
        sticky: true,
        stickyPosition: 'right',
        render: (_, row) => {
          const term = row as PaymentTermListItem;
          const displayStatus = getPaymentTermDisplayStatus(term);

          return (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Label color={statusColor(displayStatus)}>{displayStatus}</Label>
              {term.isDefault ? (
                <Chip size="small" label="Default" color="primary" variant="outlined" />
              ) : null}
            </Stack>
          );
        },
      },
      {
        stickyPosition: 'right',
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        minWidth: 160,
        excludeFromExport: true,
        render: (_, row) => {
          const term = row as PaymentTermListItem;
          const archived = term.status === 'Archived';
          const canActivate = !archived && term.hasDraft && canPublish;
          const archiveDisabled = term.referencedStructureCount > 0 || actionLoading;
          const deleteDisabled = !canDeletePaymentTerm(term) || actionLoading;

          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              sx={{ justifyContent: 'flex-start' }}
              moreLabel={`More actions for ${term.name}`}
              actions={[
                ...(canEdit && !archived
                  ? [
                      {
                        id: 'edit',
                        label: `Edit ${term.name}`,
                        icon: 'solar:pen-bold',
                        disabled: actionLoading,
                        onClick: () => onEdit(term),
                      },
                    ]
                  : []),
                ...(canActivate
                  ? [
                      {
                        id: 'activate',
                        label: 'Activate',
                        icon: 'mdi:check-decagram-outline',
                        disabled: actionLoading,
                        onClick: () => onPublish(term),
                      },
                    ]
                  : []),
                ...(canView
                  ? [
                      {
                        id: 'history',
                        label: 'Version History',
                        icon: 'mdi:timeline-clock-outline',
                        onClick: () => onVersionHistory(term),
                      },
                    ]
                  : []),
                ...(!archived && canArchive
                  ? [
                      {
                        id: 'archive',
                        label: 'Archive',
                        icon: 'mdi:archive-outline',
                        disabled: archiveDisabled,
                        onClick: () => onArchive(term),
                      },
                    ]
                  : []),
                ...(archived && canRestore
                  ? [
                      {
                        id: 'restore',
                        label: 'Restore',
                        icon: 'mdi:archive-arrow-up-outline',
                        disabled: actionLoading,
                        onClick: () => onRestore(term),
                      },
                    ]
                  : []),
                ...(canDelete
                  ? [
                      {
                        id: 'delete',
                        label: 'Delete',
                        icon: 'solar:trash-bin-trash-bold',
                        color: 'error.main',
                        disabled: deleteDisabled,
                        onClick: () => onDelete(term),
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    [
      actionLoading,
      canArchive,
      canDelete,
      canEdit,
      canPublish,
      canRestore,
      canView,
      onArchive,
      onDelete,
      onEdit,
      onPublish,
      onRestore,
      onVersionHistory,
      onView,
    ]
  );

  return (
    <>
      <CustomizableTable
        getRowAction={(row) =>
          canView
            ? {
                label: `Open ${row.name || 'record'}`,
                onClick: () => {
                  onView(row as PaymentTermListItem);
                },
              }
            : undefined
        }
        tableId="payment-term-table"
        tableTitle="Payment terms"
        exportLabel="Export current page"
        columns={columns}
        data={data}
        isLoading={loading}
        isSearch
        isPagination
        serverSideFilter
        filters={filters}
        onServerFilter={onFiltersChange}
        serverSidePagination
        serverSideSearch
        totalCount={totalCount}
        page={page - 1}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        onServerPagination={onPaginationChange}
        onServerSearch={onSearchChange}
        noDataText="No payment terms found."
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: '100%' } }}
      />
      <Drawer
        open={Boolean(usageTerm)}
        onClose={() => setUsageTerm(null)}
        anchor="right"
        PaperProps={{ sx: { width: { xs: '100%', md: 800 }, maxWidth: '100%' } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <FinancePolicyDrawerHeader
            description="Assigned fee heads by class, fee structure, and term version."
            titleId="payment-term-usage-title"
            title={`${usageTerm?.name ?? 'Payment Term'} — Used In`}

            descriptionDisplay="tooltip"
            onClose={() => setUsageTerm(null)}
          />
          <Box
            sx={{
              p: 1.5,
              overflow: 'hidden',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {usageTerm?.usage && <PaymentTermUsageBreakdown usage={usageTerm.usage} />}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default PaymentTermTable;
