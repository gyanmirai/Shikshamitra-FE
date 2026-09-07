'use client';

import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { PaymentTermListItem } from 'src/redux/finance/paymentTerm';

import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Chip, Stack, MenuItem, MenuList, Typography } from '@mui/material';

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
  archived,
  onPaginationChange,
  onSearchChange,
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
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
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
        id: 'status',
        label: 'Status',
        align: 'left',
        minWidth: 240,
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
        id: 'currentVersionNumber',
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
        id: 'actions',
        label: 'Actions',
        align: 'right',
        isSort: false,
        isFilter: false,
        sticky: true,
        stickyPosition: 'right',
        minWidth: 120,
        render: (_, row) => {
          const term = row as PaymentTermListItem;
          const canActivate = !archived && term.hasDraft && canPublish;
          const archiveDisabled = term.referencedStructureCount > 0 || actionLoading;
          const deleteDisabled = !canDeletePaymentTerm(term) || actionLoading;
          const hasMenuActions = canView || canActivate || canArchive || canRestore || canDelete;

          return (
            <ThreeDotsActions
              showViewIcon={canView}
              viewLabel={`View ${term.name}`}
              handleViewClick={() => onView(term)}
              showEditIcon={canEdit && !archived}
              editLabel={`Edit ${term.name}`}
              disableEditIcon={actionLoading}
              handleEditClick={() => onEdit(term)}
              showThreeDots={hasMenuActions}
              moreLabel={`More actions for ${term.name}`}
              actions={({ popover }) => (
                <MenuList>
                  {canActivate ? (
                    <MenuItem
                      disabled={actionLoading}
                      onClick={() => {
                        popover.onClose();
                        onPublish(term);
                      }}
                    >
                      <Iconify icon="mdi:check-decagram-outline" />
                      Activate
                    </MenuItem>
                  ) : null}
                  {canView ? (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        onVersionHistory(term);
                      }}
                    >
                      <Iconify icon="mdi:timeline-clock-outline" />
                      Version History
                    </MenuItem>
                  ) : null}
                  {!archived && canArchive ? (
                    <MenuItem
                      disabled={archiveDisabled}
                      onClick={() => {
                        popover.onClose();
                        onArchive(term);
                      }}
                    >
                      <Iconify icon="mdi:archive-outline" />
                      Archive
                    </MenuItem>
                  ) : null}
                  {archived && canRestore ? (
                    <MenuItem
                      disabled={actionLoading}
                      onClick={() => {
                        popover.onClose();
                        onRestore(term);
                      }}
                    >
                      <Iconify icon="mdi:archive-arrow-up-outline" />
                      Restore
                    </MenuItem>
                  ) : null}
                  {canDelete ? (
                    <MenuItem
                      disabled={deleteDisabled}
                      onClick={() => {
                        popover.onClose();
                        onDelete(term);
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                      Delete
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
      actionLoading,
      archived,
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
    <CustomizableTable
      tableId="payment-term-table"
      columns={columns}
      data={data}
      isLoading={loading}
      isSearch
      isFilter={false}
      isPagination
      serverSidePagination
      serverSideSearch
      totalCount={totalCount}
      page={page - 1}
      rowsPerPage={rowsPerPage}
      searchTerm={searchTerm}
      onServerPagination={onPaginationChange}
      onServerSearch={onSearchChange}
      noDataText={archived ? 'No archived payment terms.' : 'No current payment terms found.'}
      wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
      tableContainerProps={{ sx: { height: '100%' } }}
    />
  );
};

export default PaymentTermTable;
