'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useSearchParams } from 'next/navigation';
import { Box, Alert, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import {
  bankAccountApi,
  useGetBankAccountQuery,
  useDeleteBankAccountMutation,
  useLazyGetBankAccountByIdQuery,
} from 'src/redux/finance/BankAccountManage/bankAccountApi';

import BankAccountForm from './Components/BankManageForm';
import BankAccountTable from './Components/BankAccountTable';
import BankAccountActivityDrawer from './Components/BankAccountActivityDrawer';

import type { IBankAccount } from './Components/type';

function replaceActivitySelection(bankId?: string) {
  const url = new URL(window.location.href);
  if (bankId) url.searchParams.set('bankActivity', bankId);
  else url.searchParams.delete('bankActivity');
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
}

const BankAccountManagement: React.FC = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const access = useAccountSettingPermissions('BankAccount');
  const searchParams = useSearchParams();
  const [activityBank, setActivityBank] = useState<IBankAccount | null>(null);
  const openActivity = useCallback((bank: IBankAccount) => {
    replaceActivitySelection(bank.id);
    setActivityBank(bank);
  }, []);

  const [queryParams, setQueryParams] = useState(() => ({
    page: Math.max(1, Number(searchParams.get('bankListPage')) || 1),
    pageSize: [10, 25, 50, 100].includes(Number(searchParams.get('bankListPageSize')))
      ? Number(searchParams.get('bankListPageSize'))
      : 10,
    search: searchParams.get('bankListSearch') || '',
  }));
  const [filters, setFilters] = useState<IParams['filters']>(() => {
    try {
      const saved = JSON.parse(searchParams.get('bankListFilters') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!activityBank) return;
    const url = new URL(window.location.href);
    url.searchParams.set('bankListPage', String(queryParams.page));
    url.searchParams.set('bankListPageSize', String(queryParams.pageSize));
    url.searchParams.set('bankListSearch', queryParams.search);
    url.searchParams.set('bankListFilters', JSON.stringify(filters));
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`);
  }, [activityBank, queryParams, filters]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Get bank accounts data
  const {
    currentData: bankAccountData,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountFetching,
    error: bankAccountError,
    refetch,
  } = useGetBankAccountQuery(
    {
      academicYearId: currentYear?.id,
      ...queryParams,
      filters: serializeFinanceTableFilters(filters),
    },
    { skip: !currentYear?.id, refetchOnMountOrArgChange: true }
  );

  // DELETE mutation
  const [deleteBankAccount, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBankAccountMutation,
  });
  const [getBankAccountDetail] = useLazyGetBankAccountByIdQuery();

  useEffect(() => {
    const id = searchParams.get('bankActivity');
    if (!id) {
      setActivityBank(null);
      return;
    }
    const bank = bankAccountData?.items?.find((item: IBankAccount) => item.id === id);
    if (bank) setActivityBank(bank);
  }, [searchParams, bankAccountData]);

  const previousYear = useRef(currentYear?.id);
  useEffect(() => {
    if (previousYear.current !== currentYear?.id) {
      const hadYear = Boolean(previousYear.current);
      previousYear.current = currentYear?.id;
      if (!hadYear) return;
      setActivityBank(null);
      if (new URLSearchParams(window.location.search).has('bankActivity'))
        replaceActivitySelection();
    }
  }, [currentYear?.id]);

  const closeActivity = () => {
    replaceActivitySelection();
    setActivityBank(null);
  };

  // Dialog control states
  const deleteBankAccountDialog = useBoolean();
  const addBankAccountDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // Global state for tracking unsaved changes

  // State to store currently selected bank account for edit/delete operations
  const [selectedBankAccount, setSelectedBankAccount] = useState<IBankAccount | null>(null);
  const { confirmWithUndo } = useConfirmWithUndo();
  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit bank account dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addBankAccountDialog.value,
    () => {
      addBankAccountDialog.onFalse();
      setSelectedBankAccount(null);
    }
  );

  return (
    <Box height="100%" minHeight={0} display="flex" flexDirection="column">
      {discardConfirmation}
      <CustomBreadcrumbs
        description="Manage bank accounts used by the school. Add, edit or delete bank account details and link payment methods or branches."
        heading="Bank Accounts"

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
            color="inherit"
          >
            Bank Account
          </Button>
        }
        sx={{ px: 1 }}
      />

      {searchParams.get('bankActivity') &&
        !bankAccountFetching &&
        bankAccountData &&
        !activityBank && (
          <Alert severity="info">
            The selected bank account is unavailable in the current academic year or list filters.
          </Alert>
        )}
      {!currentYear?.id ? (
        <Alert severity="info">Select an academic year to load bank accounts.</Alert>
      ) : (
        <BankAccountTable
          onView={openActivity}
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
          isLoading={bankAccountsLoading || (bankAccountFetching && !bankAccountData)}
          isRefreshing={bankAccountFetching && Boolean(bankAccountData)}
          error={bankAccountError}
          onRetry={() => refetch()}
          totalCount={bankAccountData?.totalCount}
          onServerPagination={handleServerPagination}
          onServerSearch={handleServerSearch}
          filters={filters}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.pageSize}
          onServerFilter={(next) => {
            setFilters(next);
            setQueryParams((current) => ({ ...current, page: 1 }));
          }}
        />
      )}

      {activityBank && currentYear?.id && previousYear.current === currentYear.id && (
        <BankAccountActivityDrawer
          open
          bank={activityBank}
          academicYearId={currentYear.id}
          onClose={closeActivity}
        />
      )}

      <CustomDialog
        titleInfo="Maintain bank, account, and payment details used by Finance."
        open={addBankAccountDialog.value}
        guardUnsavedChanges={false}
        handleClose={() => handleClose()}
        title={selectedBankAccount ? 'Edit Bank Account' : 'Add Bank Account'}

        maxWidth="sm"
      >
        {addBankAccountDialog.value && (
          <BankAccountForm
            open={addBankAccountDialog}
            onClose={handleClose}
            editData={selectedBankAccount}
          />
        )}
      </CustomDialog>

      <ConfirmDialog
        open={deleteBankAccountDialog.value}
        onClose={() => {
          setSelectedBankAccount(null);
          deleteBankAccountDialog.onFalse();
        }}
        title="Delete Bank Account"
        content={
          <>
            Delete <strong>{selectedBankAccount?.bankName}</strong> (
            {selectedBankAccount?.branchName},{' '}
            <strong>{selectedBankAccount?.maskedAccountNumber}</strong>)?
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={() => {
              if (!selectedBankAccount?.id) return;

              confirmWithUndo({
                message: 'Deletion pending',
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
                          if (typeof draft?.totalCount === 'number')
                            draft.totalCount = Math.max(0, draft.totalCount - 1);
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
            Delete
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default BankAccountManagement;
