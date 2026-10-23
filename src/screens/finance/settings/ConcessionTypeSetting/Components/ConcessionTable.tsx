import type { IColumn } from 'src/components/customizabaleTable/types';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { usePatchConcessionTypeStatusMutation } from 'src/redux/finance/concessionType';
import { Box, Chip, Stack, Button, TextField, Typography } from '@mui/material';

import type { IConcessionTypeForm, IConcessionTableProps } from '../type';

function TruncatedText({ value, width = 240 }: { value: unknown; width?: number }) {
  const text = typeof value === 'string' && value ? value : '-';
  return (
    <CustomTooltip title={text === '-' ? '' : text}>
      <Typography
        variant="body2"
        noWrap
        tabIndex={text === '-' ? undefined : 0}
        sx={{ maxWidth: width }}
      >
        {text}
      </Typography>
    </CustomTooltip>
  );
}

const ConcessionTypeTable: React.FC<IConcessionTableProps> = ({
  archived,
  canView,
  canAdd = false,
  canEdit,
  canChangeStatus,
  canDelete,
  data,
  isLoading,
  addConcessionType,
  setEditData,
  onEdit,
  onDelete,
  onView,
  onVersionHistory,
  totalCount,
  page,
  rowsPerPage,
  searchTerm,
  onServerPagination,
  onServerSearch,
  filters,
  onServerFilter,
}) => {
  const [patchConcessionTypeStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchConcessionTypeStatusMutation,
  });

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IConcessionTypeForm>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  const handleOpenStatusConfirm = (row: IConcessionTypeForm) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const tableData = useMemo(
    () =>
      (data || []).map((row: any) => ({
        ...row,
      })),
    [data]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        isFilter: true,
        label: 'Concession Type Name',
        filterType: 'string' as const,
        align: 'left',
        width: 190,
        minWidth: 180,
        sticky: true,
        stickyPosition: 'left',
      },
      {
        id: 'description',
        isFilter: true,
        label: 'Description',
        filterType: 'string' as const,
        align: 'left',
        width: 240,
        minWidth: 180,
        cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        render: (value) => <TruncatedText value={value} />,
      },
      {
        id: 'documents',
        isFilter: true,
        label: 'Documents',
        filterType: 'string' as const,
        align: 'left',
        width: 200,
        minWidth: 160,
        cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        render: (value) => (
          <TruncatedText
            value={Array.isArray(value) ? value.map((doc: any) => doc.documentName).join(', ') : ''}
            width={200}
          />
        ),
        exportValue: (value) =>
          Array.isArray(value) ? value.map((doc: any) => doc.documentName).join(', ') : '',
      },
      {
        id: 'deactivationReason',
        isFilter: true,
        label: 'Deactivation Reason',
        filterType: 'string' as const,
        align: 'left',
        width: 200,
        minWidth: 170,
        render: (value) => <TruncatedText value={value} width={200} />,
      },
      {
        id: 'isActive',
        filterType: 'enum' as const,
        isFilter: true,
        enumOptions: [
          { label: 'Active', value: 1 },
          { label: 'Archived', value: 0 },
        ],
        label: 'Status',
        width: 110,
        minWidth: 100,
        align: 'left',
        sticky: true,
        stickyPosition: 'right',
        render(value, row) {
          const concession = row as IConcessionTypeForm;
          return (
            <Chip
              size="small"
              label={concession.isActive ? 'Active' : 'Archived'}
              color={concession.isActive ? 'success' : 'default'}
              variant="soft"
            />
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'left',
        isSort: false,
        isFilter: false,
        sticky: true,
        width: 128,
        minWidth: 128,
        stickyPosition: 'right',
        excludeFromExport: true,
        render: (value, row) => {
          const concessionType = row as IConcessionTypeForm;
          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              moreLabel={`More actions for ${concessionType.name}`}
              actions={[
                ...(canEdit && !archived
                  ? [
                      {
                        id: 'edit',
                        label: `Edit ${concessionType.name}`,
                        icon: 'solar:pen-bold',
                        onClick: () => onEdit?.(concessionType),
                      },
                    ]
                  : []),
                ...(canDelete && archived
                  ? [
                      {
                        id: 'delete',
                        label: `Delete ${concessionType.name}`,
                        icon: 'solar:trash-bin-trash-bold',
                        color: 'error.main',
                        disabled: !canDeleteConcessionType(concessionType),
                        tooltip:
                          'This item cannot be deleted because it is already used in other parts of the system. Please remove all references first.',
                        onClick: () => onDelete?.(concessionType),
                      },
                    ]
                  : []),
                ...(canView
                  ? [
                      {
                        id: 'history',
                        label: 'Version History',
                        icon: 'mdi:timeline-clock-outline',
                        onClick: () => onVersionHistory?.(concessionType),
                      },
                    ]
                  : []),
                ...(canChangeStatus
                  ? [
                      {
                        id: 'status',
                        label: archived ? 'Restore' : 'Archive',
                        icon: archived ? 'mdi:archive-arrow-up-outline' : 'mdi:archive-outline',
                        onClick: () => handleOpenStatusConfirm(concessionType),
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
      archived,
      canChangeStatus,
      canDelete,
      canEdit,
      canView,
      onDelete,
      onEdit,
      onVersionHistory,
      onView,
    ]
  );

  return (
    <>
      <CustomizableTable
        getRowAction={(row) =>
          canView && onView
            ? {
                label: `Open ${row.name || 'record'}`,
                onClick: () => {
                  onView?.(row as IConcessionTypeForm);
                },
              }
            : undefined
        }
        tableId="concession-table"
        tableTitle="Concession Types"
        wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
        isLoading={isLoading}
        noDataText={
          <>
            {archived ? 'No archived concession types.' : 'No concession types found.'}
            {!archived && canAdd ? (
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  addConcessionType.onTrue();
                  setEditData(null);
                }}
              >
                Add Concession Type
              </Button>
            ) : null}
          </>
        }
        columns={columns}
        data={tableData || []}
        serverSideFilter
        filters={filters}
        onServerFilter={onServerFilter}
        serverSidePagination
        serverSideSearch
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchTerm={searchTerm}
        onServerPagination={onServerPagination}
        onServerSearch={onServerSearch}
      />
      <ConfirmDialog
        open={statusConfirm.value}
        onClose={() => {
          statusConfirm.onFalse();
          setStatusData(null);
          setDeactivationReason('');
        }}
        title={nextStatus ? 'Restore Concession Type' : 'Archive Concession Type'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Restore' : 'Archive'}{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {statusData?.name}
              </Box>
              ?
            </Typography>
            {!nextStatus && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Archive reason"
                value={deactivationReason}
                onChange={(event) => setDeactivationReason(event.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon={nextStatus ? 'mdi:restore' : 'mdi:archive-outline'} />}
            loading={isStatusLoading}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              if (!nextStatus && !deactivationReason.trim()) {
                shikshaMitraToast.error({ message: 'Archive reason is required' });
                return;
              }
              try {
                await patchConcessionTypeStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason.trim(),
                    concurrencyStamp: statusData.concurrencyStamp,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Concession Type ${nextStatus ? 'restored' : 'archived'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
              } catch (error) {
                // Keep the dialog open so the user can correct the reason or refresh
                // after a concurrency/status conflict.
                const parsed = parseApiProblemDetail(error);
                shikshaMitraToast.error({
                  message: parsed.detail || 'Unable to change concession type status.',
                });
              }
            }}
          >
            {nextStatus ? 'Restore' : 'Archive'}
          </LoadingButton>
        }
      />
    </>
  );
};

export default ConcessionTypeTable;

export const canDeleteConcessionType = (concessionType: IConcessionTypeForm) =>
  concessionType.isActive === false &&
  (concessionType.canDelete ?? !concessionType.isUsedInDownstream);
