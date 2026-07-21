import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, Typography } from '@mui/material';
import { usePatchAccountHeadStatusMutation } from 'src/redux/finance/accountHeadApi';

import { type IAccountHead, type IAccountHeadTableProps } from './type';

const AccountHeadTable: React.FC<IAccountHeadTableProps> = ({
  data,
  onAddAccountHead,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  isLoading,
  totalCount,
  onServerPagination,
  onServerSearch,
}) => {
  const [patchStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchAccountHeadStatusMutation,
  });

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IAccountHead>(null);

  const handleOpenStatusConfirm = useCallback(
    (row: IAccountHead) => {
      setStatusData(row);
      statusConfirm.onTrue();
    },
    [statusConfirm]
  );

  const nextStatus = statusData ? !statusData.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'headName',
        label: 'Head Name',
        minWidth: 150,
        sticky: true,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px" fontWeight={500}>
            {value}
          </Typography>
        ),
      },
      {
        id: 'headType',
        label: 'Type',
        minWidth: 120,
        align: 'left',
        render: (value) => <Chip label={value} size="small" variant="outlined" />,
      },
      {
        id: 'nature',
        label: 'Nature',
        minWidth: 100,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'linkedSources',
        label: 'Linked Sources',
        minWidth: 200,
        align: 'left',
        render: (value: string[]) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {value?.slice(0, 2).map((src) => (
              <Chip key={src} label={src} size="small" sx={{ height: 20, fontSize: '11px' }} />
            ))}
            {value?.length > 2 && (
              <CustomTooltip title={value.join(', ')}>
                <Chip
                  label={`+${value.length - 2}`}
                  size="small"
                  sx={{ height: 20, fontSize: '11px' }}
                />
              </CustomTooltip>
            )}
          </Stack>
        ),
      },
      {
        id: 'runningBalance',
        label: 'Balance',
        minWidth: 70,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px" fontWeight={600}>
            {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '-'}
          </Typography>
        ),
      },
      {
        id: 'isActive',
        label: 'Status',
        minWidth: 100,
        sticky: true,
        render(value, row) {
          const accHead = row as IAccountHead;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                size="small"
                checked={accHead.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(accHead)}
              />
            </Stack>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => onDelete(row as IAccountHead)}
              handleEditClick={() => onEdit(row as IAccountHead)}
            />
          );
        },
      },
    ],
    [handleOpenStatusConfirm, onDelete, onEdit]
  );

  return (
    <>
      <CustomizableTable
        tableId="account-head-master-table"
        noDataText={
          <>
            Account Heads Not Found{' '}
            <Box
              onClick={() => {
                onAddAccountHead.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Account Head
            </Box>
          </>
        }
        columns={columns}
        data={data || []}
        isLoading={isLoading}
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
        }}
        title={nextStatus ? 'Activate Account Head' : 'Deactivate Account Head'}
        content={
          <Typography variant="body2">
            Are you sure you want to {nextStatus ? 'activate' : 'deactivate'} Account Head{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {statusData?.headName}
            </Box>
            ?
          </Typography>
        }
        action={
          <LoadingButton
            loading={isStatusLoading}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              try {
                await patchStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Account Head ${nextStatus ? 'activated' : 'deactivated'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
              } catch {
                // Ignore error
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

export default AccountHeadTable;
