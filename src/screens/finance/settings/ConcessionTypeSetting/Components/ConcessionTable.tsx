import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { usePatchConcessionTypeStatusMutation } from 'src/redux/finance/concessionType';
import { Box, Chip, Stack, Switch, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import type { IConcessionTypeForm, IConcessionTableProps } from '../type';

const ConcessionTypeTable: React.FC<IConcessionTableProps> = ({
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
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={concession.isActive ? 'Active' : 'Inactive'}
                color={concession.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                size="small"
                checked={concession.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(concession)}
              />
            </Stack>
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
            <ThreeDotsActions
              showViewIcon
              viewLabel={`View ${concessionType.name}`}
              handleViewClick={() => onView?.(concessionType)}
              showEditIcon
              editLabel={`Edit ${concessionType.name}`}
              showDeleteIcon
              disableDeleteIcon={!canDeleteConcessionType(concessionType)}
              deleteLabel={`Delete ${concessionType.name}`}
              handleEditClick={() => onEdit?.(concessionType)}
              handleDeleteClick={() => onDelete?.(concessionType)}
              showThreeDots
              moreLabel={`More actions for ${concessionType.name}`}
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      popover.onClose();
                      onVersionHistory?.(concessionType);
                    }}
                  >
                    <Iconify icon="mdi:timeline-clock-outline" />
                    Version History
                  </MenuItem>
                </MenuList>
              )}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <CustomizableTable
        tableId="concession-table"
        isLoading={isLoading}
        noDataText={
          <>
            No Concession data found
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
        title={nextStatus ? 'Activate Concession Type' : 'Deactivate Concession Type'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Activate' : 'Deactivate'}{' '}
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
                label="Deactivation reason"
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
                shikshaMitraToast.error({ message: 'Deactivation reason is required' });
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
                  message: `Concession Type ${nextStatus ? 'activated' : 'deactivated'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
              } catch {
                // Keep dialog open on error
              }
            }}
          >
            {nextStatus ? 'Activate' : 'Deactivate'}
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
