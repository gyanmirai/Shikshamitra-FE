import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import AccountSettingVersionDialog from 'src/screens/finance/settings/components/AccountSettingVersionDialog';
import {
  useGetExpenseCategoryVersionsQuery,
  usePatchExpenseCategoryStatusMutation,
} from 'src/redux/finance/expenseCategory';

import type { IExpenseCategory, IExpenseCategoryTableProps } from './type';

const ExpenseCategoryTable: React.FC<IExpenseCategoryTableProps> = ({
  data,
  onAddExpenseCategory,
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
  const [patchExpenseCategoryStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchExpenseCategoryStatusMutation,
  });
  const access = useAccountSettingPermissions('ExpenseCategory');

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IExpenseCategory>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [historyItem, setHistoryItem] = useState<IExpenseCategory | null>(null);
  const history = useGetExpenseCategoryVersionsQuery(historyItem?.id || '', { skip: !historyItem });

  const handleOpenStatusConfirm = (row: IExpenseCategory) => {
    setStatusData(row);
    setDeactivationReason('');
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
          const expense = row as IExpenseCategory;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={expense.isActive ? 'Active' : 'Inactive'}
                color={expense.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                slotProps={{
                  input: {
                    'aria-label': `${expense.isActive ? 'Deactivate' : 'Activate'} ${expense.name}`,
                  },
                }}
                size="small"
                disabled={!access.canChangeStatus}
                checked={expense.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(expense)}
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
                  onClick: () => setHistoryItem(row as IExpenseCategory),
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: 'solar:pen-bold',
                  onClick: () => {
                    onEdit(row as IExpenseCategory);
                  },
                  disabled: !access.canEdit,
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: 'solar:trash-bin-trash-bold',
                  onClick: () => {
                    onDelete(row as IExpenseCategory);
                  },
                  disabled: !access.canDelete || !(row as IExpenseCategory).canDelete,
                  tooltip: (row as IExpenseCategory).isActive
                    ? 'Deactivate this record before deleting it.'
                    : 'This record is referenced by other Finance records and cannot be deleted.',
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
        tableId="expense-category-data-table"
        tableTitle="Expense Categories"
        searchFieldProps={{ placeholder: 'Search name...' }}
        noDataText={
          <>
            Expense Category Data Not Found{' '}
            <Box
              onClick={() => {
                onAddExpenseCategory.onTrue();
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
              Add Expense Category
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
        }}
        title={nextStatus ? 'Activate Expense Category' : 'Deactivate Expense Category'}
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
            startIcon={<Iconify icon={nextStatus ? 'mdi:check-circle-outline' : 'mdi:cancel'} />}
            loading={isStatusLoading}
            disabled={!nextStatus && !deactivationReason.trim()}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              try {
                await patchExpenseCategoryStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason || null,
                    concurrencyStamp: statusData.concurrencyStamp,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Expense Category ${nextStatus ? 'activated' : 'deactivated'} successfully`,
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
      <AccountSettingVersionDialog
        open={Boolean(historyItem)}
        title={historyItem?.name || 'Expense category'}
        recordType="Expense category"
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

export default ExpenseCategoryTable;
