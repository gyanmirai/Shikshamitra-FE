import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import { usePatchFeeHeadMutation } from 'src/redux/feeHeadManage/feeHeadManageApi';

import type { IFeeHead, IFeeHeadTableProps } from './type';

const FeeHeadTable: React.FC<IFeeHeadTableProps> = ({
  data,
  isLoading,
  onAddFeeHead,
  setEditData,
  onEdit,
  onDelete,
  totalCount,
  onServerPagination,
  onServerSearch,
}) => {
  const [patchFeeHead, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFeeHeadMutation,
  });

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IFeeHead>(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  const handleOpenStatusConfirm = (row: IFeeHead) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        align: 'left',
        sticky: true,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'feeCategoryName',
        label: 'Fee Category',
        align: 'left',
      },
      {
        id: 'incomeCategoryName',
        label: 'Income Category',
        align: 'left',
        render: (value, row) => (
          <Stack spacing={0.25}>
            <Typography variant="caption" fontSize="13px">
              {value || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(row as IFeeHead).incomeAccountHeadName || 'No account head'}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography
            variant="caption"
            fontSize="13px"
            sx={{
              maxWidth: 300,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'isActive',
        label: 'Status',
        minWidth: 140,
        sticky: true,
        render(value, row) {
          const head = row as IFeeHead;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={head.isActive ? 'Active' : 'Inactive'}
                color={head.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                size="small"
                checked={head.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(head)}
              />
            </Stack>
          );
        },
      },
      {
        id: 'action',
        label: 'Action',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showEditIcon
              showDeleteIcon
              disableDeleteIcon={row?.isUsedInDownstream}
              handleEditClick={() => {
                onEdit(row as IFeeHead);
              }}
              handleDeleteClick={() => {
                onDelete(row as IFeeHead);
              }}
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
        tableId="fee-head-data-table"
        isLoading={isLoading}
        noDataText={
          <>
            Fee Head Data Not Found{' '}
            <Box
              onClick={() => {
                onAddFeeHead.onTrue();
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
              Add Fee Head
            </Box>
          </>
        }
        columns={columns}
        data={data || []}
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
        title={nextStatus ? 'Activate Fee Head' : 'Deactivate Fee Head'}
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
                required
                error={!!deactivationReason && !deactivationReason.trim()}
                helperText={
                  deactivationReason && !deactivationReason.trim()
                    ? 'Enter a reason containing text.'
                    : undefined
                }
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
            disabled={!nextStatus && !deactivationReason.trim()}
            onClick={async () => {
              if (!statusData) return;
              try {
                await patchFeeHead({
                  feeHeadId: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason.trim(),
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Fee Head ${nextStatus ? 'activated' : 'deactivated'} successfully`,
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

export default FeeHeadTable;
