import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Alert, Box, Button, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import FeeHeadDependencies from '../../components/FeeHeadDependencies';
import {
  useGetFeeHeadByIdQuery,
  usePatchFeeHeadMutation,
} from 'src/redux/feeHeadManage/feeHeadManageApi';

import { useFinancePermissions } from '../../../hooks/useFinancePermissions';

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
  const access = useFinancePermissions(financePermissions.fees.settings.feeHead);
  const [patchFeeHead, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFeeHeadMutation,
  });

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IFeeHead>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const dependencyCheck = useGetFeeHeadByIdQuery(statusData?.id ?? '', {
    skip: !statusConfirm.value || !statusData?.isActive,
    refetchOnMountOrArgChange: true,
  });
  const dependencies = dependencyCheck.currentData?.dependencies;
  const blocked = dependencies?.isBlocked || dependencyCheck.currentData?.isUsedInDownstream;

  const handleOpenStatusConfirm = (row: IFeeHead) => {
    if (!access.canAdd) return;
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        stickyPosition: 'left',
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
        stickyPosition: 'right',
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
                disabled={!access.canAdd}
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
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Action',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <AdaptiveThreeDotsActions
              directActionLimit={2}
              actions={[
                {
                  id: 'edit',
                  label: 'Edit',
                  disabled: !access.canAdd,
                  icon: 'solar:pen-bold',
                  onClick: () => {
                    onEdit(row as IFeeHead);
                  },
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: 'solar:trash-bin-trash-bold',
                  onClick: () => {
                    onDelete(row as IFeeHead);
                  },
                  disabled: !access.canDelete || row?.isUsedInDownstream,
                  tooltip:
                    'This item cannot be deleted because it is already used in other parts of the system. Please remove all references first.',
                  color: 'error.main',
                },
              ]}
              placement="right-top"
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canAdd, access.canDelete, onEdit, onDelete]
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
                if (!access.canAdd) return;
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
        disableCancel={isStatusLoading}
        disableEscapeKeyDown={isStatusLoading}
        disableBackdropClick={isStatusLoading}
        onClose={() => {
          if (isStatusLoading) return;
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
            {!nextStatus && dependencyCheck.isFetching && (
              <Typography role="status">Checking fee head dependencies…</Typography>
            )}
            {!nextStatus && dependencyCheck.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => dependencyCheck.refetch()}>
                    Retry
                  </Button>
                }
              >
                Could not verify dependencies. Retry before deactivating.
              </Alert>
            )}
            {!nextStatus && blocked && (
              <FeeHeadDependencies
                name={statusData?.name ?? 'Fee head'}
                feeHeadId={statusData?.id}
                dependencies={dependencies}
              />
            )}
            {!nextStatus && !blocked && (
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
            startIcon={<Iconify icon={nextStatus ? 'mdi:check-circle-outline' : 'mdi:cancel'} />}
            loading={isStatusLoading}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            disabled={
              !access.canAdd ||
              (!nextStatus &&
                (!deactivationReason.trim() ||
                  dependencyCheck.isFetching ||
                  dependencyCheck.isError ||
                  !dependencyCheck.currentData ||
                  Boolean(blocked)))
            }
            onClick={async () => {
              if (!access.canAdd || !statusData) return;
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
