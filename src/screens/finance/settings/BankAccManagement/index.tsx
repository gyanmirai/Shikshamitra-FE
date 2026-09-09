'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  bankAccountApi,
  useGetBankAccountQuery,
  useLazyGetBankAccountByIdQuery,
  useDeleteBankAccountMutation,
} from 'src/redux/finance/BankAccountManage/bankAccountApi';

import BankAccountForm from './Components/BankManageForm';
import BankAccountTable from './Components/BankAccountTable';

import type { IBankAccount } from './Components/type';

const BankAccountManagement: React.FC = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const access = useAccountSettingPermissions('BankAccount');

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Get bank accounts data
  const {
    data: bankAccountData,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankAccountQuery,
    params: { academicYearId: currentYear?.id, ...queryParams },
  });

  // DELETE mutation
  const [deleteBankAccount, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBankAccountMutation,
  });
  const [getBankAccountDetail] = useLazyGetBankAccountByIdQuery();

  // Dialog control states
  const deleteBankAccountDialog = useBoolean();
  const addBankAccountDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected bank account for edit/delete operations
  const [selectedBankAccount, setSelectedBankAccount] = useState<IBankAccount | null>(null);
  const { confirmWithUndo } = useConfirmWithUndo();
  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit bank account dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedBankAccount(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addBankAccountDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addBankAccountDialog.onFalse();
      setTimeout(() => {
        setSelectedBankAccount(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Bank Accounts"
        description="Manage bank accounts used by the school. Add, edit or delete bank account details and link payment methods or branches."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts', href: '/finance/reconciliation' },
          { name: 'Settings' },
          { name: 'Bank Accounts' },
        ]}
        action={
          <Button
            disabled={!access.canAdd}
            onClick={() => addBankAccountDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Bank Account
          </Button>
        }
        sx={{ px: 1 }}
      />

      <BankAccountTable
        onDelete={(data) => {
          setSelectedBankAccount(data);
          deleteBankAccountDialog.onTrue();
        }}
        onEdit={async (data) => {
          try {
            const detail = await getBankAccountDetail(data.id).unwrap();
            setSelectedBankAccount(detail);
            addBankAccountDialog.onTrue();
          } catch {
            // Global API handler displays the error.
          }
        }}
        open={open}
        onAddBankAccount={addBankAccountDialog}
        setOpenDialog={setOpen}
        editData={selectedBankAccount}
        setEditData={setSelectedBankAccount}
        data={bankAccountData?.items || []}
        isLoading={bankAccountsLoading || bankAccountFetching}
        totalCount={bankAccountData?.totalCount}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
      />

      <CustomDialog
        open={addBankAccountDialog.value}
        handleClose={() => {
          addBankAccountDialog.onFalse();
          setTimeout(() => {
            setSelectedBankAccount(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedBankAccount ? 'Update Bank Account' : 'Add Bank Account'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedBankAccount
                  ? 'Update existing bank account details like account number, IFSC, branch and linked payment methods.'
                  : 'Create a new bank account record (bank name, account number, IFSC, branch, opening balance and linked payment methods).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <BankAccountForm
          open={addBankAccountDialog}
          onClose={handleClose}
          editData={selectedBankAccount}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteBankAccountDialog.value}
        onClose={() => {
          setSelectedBankAccount(null);
          deleteBankAccountDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete bank account{' '}
            <strong>{selectedBankAccount?.accountNumber}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={() => {
              if (!selectedBankAccount?.id) return;

              confirmWithUndo({
                item: selectedBankAccount,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    bankAccountApi.util.updateQueryData(
                      'getBankAccount',
                      { academicYearId: currentYear?.id, ...queryParams },
                      (draft: any) => {
                        const list = Array.isArray(draft) ? draft : draft?.items || [];
                        const index = list.findIndex(
                          (c: any) => c.id === (selectedBankAccount as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          list.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deleteBankAccount(selectedBankAccount.id),
              });
              deleteBankAccountDialog.onFalse();
              setSelectedBankAccount(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default BankAccountManagement;
