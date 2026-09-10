import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import AccountSettingVersionDialog from 'src/screens/finance/settings/components/AccountSettingVersionDialog';
import {
  useGetAccountHeadVersionsQuery,
  usePatchAccountHeadStatusMutation,
} from 'src/redux/finance/accountHeadApi';

import type { IAccountHead, IAccountHeadTableProps } from './type';

const AccountHeadTable = ({
  data,
  onAddAccountHead,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  isLoading,
  totalCount,
  onServerPagination,
  onServerSearch,
}: IAccountHeadTableProps) => {
  const [patchStatus, statusState] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchAccountHeadStatusMutation,
  });
  const access = useAccountSettingPermissions('AccountHead');
  const confirm = useBoolean();
  const [selected, setSelected] = useState<IAccountHead | null>(null);
  const [reason, setReason] = useState('');
  const [historyItem, setHistoryItem] = useState<IAccountHead | null>(null);
  const history = useGetAccountHeadVersionsQuery(historyItem?.id || '', { skip: !historyItem });
  const nextStatus = selected ? !selected.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'headName',
        label: 'Account Head',
        minWidth: 180,
        render: (value, row) => (
          <Stack>
            <Typography variant="caption" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(row as IAccountHead).parentAccountHeadName || 'Root account'}
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'headType',
        label: 'Type',
        minWidth: 100,
        render: (value) => <Chip size="small" variant="outlined" label={value} />,
      },
      { id: 'nature', label: 'Nature', minWidth: 80 },
      { id: 'version', label: 'Version', minWidth: 70, render: (value) => `v${value}` },
      {
        id: 'isActive',
        label: 'Status',
        minWidth: 135,
        sticky: true,
        render: (_value, row) => {
          const item = row as IAccountHead;
          return (
            <Stack direction="row" alignItems="center">
              <Chip
                size="small"
                label={item.isActive ? 'Active' : 'Inactive'}
                color={item.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                size="small"
                disabled={!access.canChangeStatus}
                checked={item.isActive}
                onChange={() => {
                  setSelected(item);
                  setReason('');
                  confirm.onTrue();
                }}
              />
            </Stack>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 70,
        sticky: true,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const item = row as IAccountHead;
          return (
            <ThreeDotsActions
              showThreeDots={false}
              showViewIcon
              viewLabel="Version history"
              viewIcon="solar:history-bold"
              showEditIcon
              showDeleteIcon
              handleViewClick={() => setHistoryItem(item)}
              disableEditIcon={!access.canEdit}
              disableDeleteIcon={!access.canDelete || !item.canDelete}
              handleEditClick={() => onEdit(item)}
              handleDeleteClick={() => onDelete(item)}
            />
          );
        },
      },
    ],
    [access.canChangeStatus, access.canDelete, access.canEdit, confirm, onDelete, onEdit]
  );

  return (
    <>
      <CustomizableTable
        tableId="account-head-master-table"
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        serverSidePagination
        serverSideSearch
        totalCount={totalCount}
        onServerPagination={onServerPagination}
        onServerSearch={onServerSearch}
        noDataText={
          <>
            Account Heads Not Found{' '}
            <Box
              component="span"
              color="primary.main"
              fontWeight={600}
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                onAddAccountHead.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }}
            >
              Add Account Head
            </Box>
          </>
        }
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={() => confirm.onFalse()}
        title={nextStatus ? 'Activate Account Head' : 'Deactivate Account Head'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Activate' : 'Deactivate'} <strong>{selected?.headName}</strong>?
            </Typography>
            {!nextStatus && (
              <TextField
                size="small"
                multiline
                minRows={2}
                required
                label="Deactivation reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            loading={statusState.isLoading}
            disabled={!nextStatus && !reason.trim()}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!selected) return;
              try {
                await patchStatus({
                  id: selected.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : reason.trim(),
                    concurrencyStamp: selected.concurrencyStamp,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Account head ${nextStatus ? 'activated' : 'deactivated'}`,
                });
                confirm.onFalse();
                setSelected(null);
              } catch {
                /* API toast handles details */
              }
            }}
          >
            {nextStatus ? 'Activate' : 'Deactivate'}
          </LoadingButton>
        }
      />
      <AccountSettingVersionDialog
        open={Boolean(historyItem)}
        title={historyItem?.headName || 'Account head'}
        data={history.data}
        isLoading={history.isLoading}
        onClose={() => setHistoryItem(null)}
      />
    </>
  );
};

export default AccountHeadTable;
