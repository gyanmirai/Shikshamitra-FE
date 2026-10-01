import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import AccountSettingVersionDialog from 'src/screens/finance/settings/components/AccountSettingVersionDialog';
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
  isLoading,
  totalCount,
  onServerPagination,
  onServerSearch,
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
        label: 'Bank Name',
        minWidth: 120,
        sticky: true,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'branchName',
        label: 'Branch Name',
        minWidth: 130,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'branchAddress',
        label: 'Branch Address',
        minWidth: 150,
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
        id: 'accountHolderName',
        label: 'Account Holder Name',
        minWidth: 190,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'accountType',
        label: 'Type',
        align: 'left',
        minWidth: 80,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value === BankAccountType.Saving ? 'Saving' : 'Current'}
          </Typography>
        ),
      },
      {
        id: 'maskedAccountNumber',
        label: 'Account Number',
        align: 'left',
        minWidth: 160,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'accountHeadName',
        label: 'Asset Account Head',
        minWidth: 160,
        render: (value) => value || 'Migration required',
      },
      {
        id: 'purpose',
        label: 'Purpose',
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
        label: 'IFSC Code',
        minWidth: 120,
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'upiId',
        label: 'UPI ID',
        align: 'left',
        minWidth: 90,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
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
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <AdaptiveThreeDotsActions
              actions={[
                {
                  id: 'view',
                  label: 'Version history',
                  icon: 'solar:history-bold',
                  onClick: () => setHistoryItem(row as IBankAccount),
                },
                {
                  id: 'edit',
                  label: 'Edit',
                  icon: 'solar:pen-bold',
                  onClick: () => {
                    onEdit(row as IBankAccount);
                  },
                  disabled: !access.canEdit,
                },
                {
                  id: 'delete',
                  label: 'Delete',
                  icon: 'solar:trash-bin-trash-bold',
                  onClick: () => {
                    onDelete(row as IBankAccount);
                  },
                  disabled: !access.canDelete || !(row as IBankAccount).canDelete,
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
    [access.canChangeStatus, access.canDelete, access.canEdit]
  );

  return (
    <>
      <CustomizableTable
        tableId="bank-account-data-table"
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
      <AccountSettingVersionDialog
        open={Boolean(historyItem)}
        title={historyItem?.bankName || 'Bank account'}
        data={history.data}
        isLoading={history.isLoading}
        onClose={() => setHistoryItem(null)}
      />
    </>
  );
};

export default BankAccountTable;
