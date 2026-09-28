import type { IColumn } from 'src/components/customizabaleTable/types';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { usePatchConcessionTypeStatusMutation } from 'src/redux/finance/concessionType';
import { Box, Chip, Stack, TextField, Typography } from '@mui/material';

import type { IConcessionTypeForm, IConcessionTableProps } from '../type';

const ConcessionTypeTable: React.FC<IConcessionTableProps> = ({
  archived,
  canView,
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
  onServerPagination,
  onServerSearch,
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
        label: 'Concession Type Name',
        align: 'left',
        width: 150,
        minWidth: 150,
        maxWidth: 200,
        sticky: true,
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        width: 280,
        minWidth: 200,
        maxWidth: 360,
        cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      },
      {
        id: 'documents',
        label: 'Documents',
        align: 'left',
        width: 260,
        minWidth: 200,
        maxWidth: 340,
        cellSx: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        render: (value) => (value || []).map((doc: any) => doc.documentName).join(', '),
      },
      {
        id: 'deactivationReason',
        label: 'Deactivation Reason',
        align: 'left',
        width: 220,
        minWidth: 180,
        render: (value) => value || '-',
      },
      {
        id: 'isActive',
        label: 'Status',
        width: 100,
        minWidth: 120,
        maxWidth: 120,
        sticky: true,
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
        width: 96,
        minWidth: 80,
        render: (value, row) => {
          const concessionType = row as IConcessionTypeForm;
          return (
            <AdaptiveThreeDotsActions
              moreLabel={`More actions for ${concessionType.name}`}
              actions={[
                ...(canView
                  ? [
                      {
                        id: 'view',
                        label: `View ${concessionType.name}`,
                        icon: 'carbon:view-filled',
                        onClick: () => onView?.(concessionType),
                      },
                    ]
                  : []),
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
                ...(canDelete && !archived
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
        tableId="concession-table"
        isLoading={isLoading}
        noDataText={
          <>
            {archived ? 'No archived concession types.' : 'No concession types found.'}
            {!archived ? (
              <Box
                onClick={() => {
                  addConcessionType.onTrue();
                  setEditData(null);
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Add Concession
              </Box>
            ) : null}
          </>
        }
        columns={columns}
        data={tableData || []}
        serverSidePagination
        serverSideSearch
        totalCount={totalCount}
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
