import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Box, Chip, Link, Stack, Switch, TextField, Typography } from '@mui/material';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import AccountCategoryVersionDrawer from 'src/screens/finance/settings/components/AccountCategoryVersionDrawer';
import {
  useGetBankAccountVersionsQuery,
  usePatchBankAccountStatusMutation,
} from 'src/redux/finance/BankAccountManage/bankAccountApi';

import { BankAccountType, type IBankAccount, type IBankAccountTableProps } from './type';

const BankAccountTable: React.FC<IBankAccountTableProps> = ({
  data,
  onAddBankAccount,
  editData,
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  onView,
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
  const [patchBankAccountStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchBankAccountStatusMutation,
  });
  const access = useAccountSettingPermissions('BankAccount');

  const statusConfirm = useBoolean();
  const [statusData, setStatusData] = useState<null | IBankAccount>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [historyItem, setHistoryItem] = useState<IBankAccount | null>(null);
  const history = useGetBankAccountVersionsQuery(historyItem?.id || '', { skip: !historyItem });

  const handleOpenStatusConfirm = (row: IBankAccount) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'bankName',
        isFilter: true,
        label: 'Bank Name',
        filterType: 'string' as const,
        minWidth: 120,
        sticky: true,
        stickyPosition: 'left',
        align: 'left',
        render: (value, row) => (
          <Link
            component="button"
            variant="body2"
            onClick={(event) => {
              event.stopPropagation();
              onView(row as IBankAccount);
            }}
          >
            {value}
          </Link>
        ),
      },
      {
        id: 'branchName',
        isFilter: true,
        label: 'Branch Name',
        filterType: 'string' as const,
        minWidth: 130,
        align: 'left',
        render: (value) => <Typography variant="body2">{value}</Typography>,
      },
      {
        id: 'branchAddress',
        isFilter: true,
        label: 'Branch Address',
        filterType: 'string' as const,
        minWidth: 150,
        align: 'left',
        render: (value) => (
          <Typography
            variant="body2"
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
        id: 'accountHolderName',
        isFilter: true,
        label: 'Account Holder Name',
        filterType: 'string' as const,
        minWidth: 190,
        align: 'left',
        render: (value) => <Typography variant="body2">{value}</Typography>,
      },
      {
        id: 'accountType',
        isFilter: true,
        label: 'Type',
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Saving', value: 0 },
          { label: 'Current', value: 1 },
        ],
        align: 'left',
        minWidth: 80,
        render: (value) => (
          <Typography variant="body2">
            {value === BankAccountType.Saving ? 'Saving' : 'Current'}
          </Typography>
        ),
      },
      {
        id: 'maskedAccountNumber',
        isFilter: true,
        label: 'Account Number',
        filterType: 'string' as const,
        align: 'left',
        minWidth: 160,
        render: (value) => <Typography variant="body2">{value}</Typography>,
      },
      {
        id: 'purpose',
        isFilter: true,
        label: 'Purpose',
        filterType: 'string' as const,
        align: 'left',
        minWidth: 100,
        render: (value, row) => (
          <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
            <Typography
              variant="inherit"
              noWrap
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                maxWidth: 0,
                minWidth: '100%',
              }}
            >
              {value}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        id: 'ifscCode',
        isFilter: true,
        label: 'IFSC Code',
        filterType: 'string' as const,
        minWidth: 120,
        align: 'left',
        render: (value) => <Typography variant="body2">{value}</Typography>,
      },
      {
        id: 'maskedUpiId',
        isFilter: true,
        label: 'UPI ID',
        filterType: 'string' as const,
        align: 'left',
        minWidth: 90,
        render: (value) => <Typography variant="body2">{value || '-'}</Typography>,
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
          const bank = row as IBankAccount;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={bank.isActive ? 'Active' : 'Inactive'}
                color={bank.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                slotProps={{
                  input: {
                    'aria-label': `${bank.isActive ? 'Deactivate' : 'Activate'} ${bank.bankName}`,
                  },
                }}
                size="small"
                disabled={!access.canChangeStatus}
                checked={bank.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(bank)}
              />
            </Stack>
          );
        },
      },
      {
        excludeFromExport: true,
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        isFilter: false,
        render(value, row) {
          return (
            <Box onClick={(event) => event.stopPropagation()}>
              <AdaptiveThreeDotsActions
                directActionLimit={2}
                actions={[
                  {
                    id: 'view',
                    label: 'View activity',
                    icon: GlobalIcons.eye,
                    onClick: () => onView(row as IBankAccount),
                  },
                  {
                    id: 'history',
                    label: 'Version history',
                    icon: 'solar:history-bold',
                    onClick: () => setHistoryItem(row as IBankAccount),
                  },
                  {
                    id: 'edit',
                    label: 'Edit',
                    icon: GlobalIcons.edit,
                    onClick: () => {
                      onEdit(row as IBankAccount);
                    },
                    disabled: !access.canEdit,
                  },
                  {
                    id: 'delete',
                    label: 'Delete',
                    icon: GlobalIcons.delete,
                    onClick: () => {
                      onDelete(row as IBankAccount);
                    },
                    disabled: !access.canDelete || !(row as IBankAccount).canDelete,
                    tooltip: (row as IBankAccount).isActive
                      ? 'Deactivate this record before deleting it.'
                      : 'This record is referenced by other Finance records and cannot be deleted.',
                    color: 'error.main',
                  },
                ]}
                placement="right-top"
              />
            </Box>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access.canChangeStatus, access.canDelete, access.canEdit, onView, onEdit, onDelete]
  );

  return (
    <>
      <CustomizableTable
        tableId="bank-account-data-table"
        handleRowClick={(row) => onView(row as IBankAccount)}
        getRowAction={(row) => ({
          label: 'View activity',
          onClick: () => onView(row as IBankAccount),
        })}
        tableTitle="Bank Accounts"
        searchFieldProps={{ placeholder: 'Search bank, branch or holder...' }}
        noDataText={
          <>
            Bank Account Data Not Found{' '}
            <Box
              onClick={() => {
                onAddBankAccount.onTrue();
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
              Add Bank Account
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
        }}
        title={nextStatus ? 'Activate Bank Account' : 'Deactivate Bank Account'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Activate' : 'Deactivate'}{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {statusData?.bankName} ({statusData?.maskedAccountNumber})
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
                await patchBankAccountStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason || null,
                    concurrencyStamp: statusData.concurrencyStamp,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Bank Account ${nextStatus ? 'activated' : 'deactivated'} successfully`,
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
      <AccountCategoryVersionDrawer
        open={Boolean(historyItem)}
        title={historyItem?.bankName || 'Bank account'}
        recordType="Bank account"
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

export default BankAccountTable;
