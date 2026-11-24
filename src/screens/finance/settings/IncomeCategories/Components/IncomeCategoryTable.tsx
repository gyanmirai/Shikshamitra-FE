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
import AccountCategoryVersionDrawer from 'src/screens/finance/settings/components/AccountCategoryVersionDrawer';
import { useAccountSettingHistoryPage } from 'src/screens/finance/settings/components/useAccountSettingHistoryPage';
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
  isRefreshing,
  error,
  onRetry,
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
  const historyPage = useAccountSettingHistoryPage(historyItem?.id);
  const history = useGetIncomeCategoryVersionsQuery(historyPage.query, { skip: !historyItem || !access.canView });

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
                disabled={!access.canChangeStatus || income.isSystemCategory}
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
          const category = row as IIncomeCategory;
          const canDelete =
            category.canDelete && !category.isActive && !category.isUsedInDownstream;
          const deletionTooltip =
            category.deletionBlockedReason ||
            (category.isUsedInDownstream
              ? 'This income category is referenced by other Finance records and cannot be deleted.'
              : category.isActive
                ? 'Deactivate this category before deleting it.'
                : canDelete
                  ? `Delete ${category.name}`
                  : 'Deletion is unavailable for this income category. Refresh and try again.');
          return (
            <AdaptiveThreeDotsActions
              directActionLimit={3}
              actions={[
                {
                  id: 'history',
                  label: 'Version history',
                  icon: 'solar:history-bold',
                  onClick: () => setHistoryItem(category),
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: 'solar:pen-bold',
                  onClick: () => {
                    onEdit(category);
                  },
                  disabled: !access.canEdit || category.isSystemCategory,
                  tooltip: category.isSystemCategory
                    ? 'None is a built-in category and cannot be changed.'
                    : undefined,
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: 'solar:trash-bin-trash-bold',
                  onClick: () => {
                    onDelete(category);
                  },
                  disabled: !access.canDelete || category.isSystemCategory || !canDelete,
                  tooltip: category.isSystemCategory
                    ? 'None is a built-in category and cannot be deleted.'
                    : !access.canDelete
                      ? 'You do not have permission to delete income categories.'
                      : deletionTooltip,
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
        searchFieldProps={{ placeholder: 'Search' }}
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
        isRefreshing={isRefreshing}
        error={error}
        onRetry={onRetry}
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
              } catch (statusUpdateError) {
                const problem = parseApiProblemDetail(statusUpdateError);
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
      <AccountCategoryVersionDrawer
        key={historyItem?.id}
        open={Boolean(historyItem)}
        title={historyItem?.name || 'Income category'}
        recordType="Income category"
        data={history.currentData}
        page={historyPage.page}
        pageSize={historyPage.pageSize}
        onPageChange={historyPage.onPageChange}
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
