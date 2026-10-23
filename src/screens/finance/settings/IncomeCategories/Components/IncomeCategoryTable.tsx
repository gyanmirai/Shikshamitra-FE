import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { Box, Chip, Alert, Stack, Switch, TextField, Typography } from '@mui/material';
import AccountSettingVersionDialog from 'src/screens/finance/settings/components/AccountSettingVersionDialog';
import {
  useGetIncomeCategoryVersionsQuery,
  usePatchIncomeCategoryStatusMutation,
} from 'src/redux/finance/incomeCategory';

import type { IIncomeCategory, IIncomeCategoryTableProps } from './type';

const IncomeCategoryTable: React.FC<IIncomeCategoryTableProps> = ({
  data,
  onAddIncomeCategory,
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
  filters,
  onServerFilter,
  page,
  rowsPerPage,
}) => {
  const [patchIncomeCategoryStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchIncomeCategoryStatusMutation,
    popupConfig: { error: false },
  });
  const access = useAccountSettingPermissions('IncomeCategory');

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IIncomeCategory>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [statusError, setStatusError] = useState('');
  const [historyItem, setHistoryItem] = useState<IIncomeCategory | null>(null);
  const history = useGetIncomeCategoryVersionsQuery(historyItem?.id || '', { skip: !historyItem });

  const handleOpenStatusConfirm = (row: IIncomeCategory) => {
    setStatusData(row);
    setDeactivationReason('');
    setStatusError('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        isFilter: true,
        label: 'Name',
        filterType: 'string' as const,
        align: 'left',
        sticky: true,
        stickyPosition: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'tags',
        isFilter: true,
        label: 'Tags',
        filterType: 'string' as const,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {Array.isArray(value) && value.length > 0
              ? value.map((tag) => `${tag}`).join(', ')
              : '-'}
          </Typography>
        ),
      },
      {
        id: 'description',
        isFilter: true,
        label: 'Description',
        filterType: 'string' as const,
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
        isFilter: true,
        label: 'Status',
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Active', value: 1 },
          { label: 'Inactive', value: 0 },
        ],
        minWidth: 140,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        render(value, row) {
          const income = row as IIncomeCategory;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={income.isActive ? 'Active' : 'Inactive'}
                color={income.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                slotProps={{
                  input: {
                    'aria-label': `${income.isActive ? 'Deactivate' : 'Activate'} ${income.name}`,
                  },
                }}
                size="small"
                disabled={!access.canChangeStatus}
                checked={income.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(income)}
              />
            </Stack>
          );
        },
      },
      {
        excludeFromExport: true,
        id: 'action',
        label: 'Actions',
        minWidth: 60,
        align: 'left',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        isFilter: false,
        render(value, row) {
          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              actions={[
                {
                  id: 'history',
                  label: 'Version history',
                  icon: 'solar:history-bold',
                  onClick: () => setHistoryItem(row as IIncomeCategory),
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: 'solar:pen-bold',
                  onClick: () => {
                    onEdit(row as IIncomeCategory);
                  },
                  disabled: !access.canEdit,
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: 'solar:trash-bin-trash-bold',
                  onClick: () => {
                    onDelete(row as IIncomeCategory);
                  },
                  disabled: !access.canDelete || !(row as IIncomeCategory).canDelete,
                  tooltip: !access.canDelete
                    ? 'You do not have permission to delete income categories.'
                    : (row as IIncomeCategory).isUsedInDownstream
                      ? (row as IIncomeCategory).deletionBlockedReason ||
                        'This income category is referenced by other Finance records and cannot be deleted.'
                      : (row as IIncomeCategory).canDelete
                        ? `Delete ${(row as IIncomeCategory).name}`
                        : 'Deletion is unavailable for this income category. Refresh and try again.',
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
    [access.canChangeStatus, access.canDelete, access.canEdit]
  );

  return (
    <>
      <CustomizableTable
        tableId="income-category-data-table"
        tableTitle="Income Categories"
        searchFieldProps={{ placeholder: 'Search name...' }}
        noDataText={
          <>
            Income Category Data Not Found{' '}
            <Box
              onClick={() => {
                onAddIncomeCategory.onTrue();
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
              Add Income Category
            </Box>
          </>
        }
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        serverSideFilter
        filters={filters}
        onServerFilter={onServerFilter}
        page={page}
        rowsPerPage={rowsPerPage}
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
          setStatusError('');
        }}
        title={nextStatus ? 'Activate Income Category' : 'Deactivate Income Category'}
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
            {statusError && <Alert severity="error">{statusError}</Alert>}
          </Stack>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon={nextStatus ? 'mdi:check-circle-outline' : 'mdi:cancel'} />}
            loading={isStatusLoading}
            disabled={!nextStatus && !deactivationReason.trim()}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              setStatusError('');
              try {
                await patchIncomeCategoryStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason || null,
                    concurrencyStamp: statusData.concurrencyStamp,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Income Category ${nextStatus ? 'activated' : 'deactivated'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
                setStatusError('');
              } catch (error) {
                const problem = parseApiProblemDetail(error);
                setStatusError(
                  problem.errorCode === 'Finance:Accounts:Settings:CategoryInUse' &&
                    problem.detail === 'One or more business rules were violated.'
                    ? 'Deactivate or remap the active Fee Heads using this Income Category first.'
                    : problem.detail
                );
              }
            }}
          >
            {nextStatus ? 'Activate' : 'Deactivate'}
          </LoadingButton>
        }
      />
      <AccountSettingVersionDialog
        open={Boolean(historyItem)}
        title={historyItem?.name || 'Income category'}
        recordType="Income category"
        data={history.currentData}
        isLoading={history.isFetching}
        isError={history.isError}
        onRetry={() => {
          history.refetch();
        }}
        onClose={() => setHistoryItem(null)}
      />
    </>
  );
};

export default IncomeCategoryTable;
