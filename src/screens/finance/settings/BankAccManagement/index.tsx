'use client';

import type { RootState } from 'src/redux/store';
import type { IParams } from 'src/components/customizabaleTable/types';

import { Add } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { Box, Alert, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { FinanceSettingDeleteDialog } from 'src/screens/finance/settings/components/FinanceSettingDeleteDialog';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import React, { lazy, Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';
import { FinanceSetupManagerHeader } from 'src/screens/finance/setup/embedding/FinanceSetupManagerHeader';
import {
  useGetBankAccountQuery,
  useDeleteBankAccountMutation,
  useLazyGetBankAccountByIdQuery,
} from 'src/redux/finance/BankAccountManage/bankAccountApi';

import BankAccountForm from './Components/BankManageForm';
import BankAccountTable from './Components/BankAccountTable';

import type { IBankAccount } from './Components/type';

const BankAccountActivityDrawer = lazy(() => import('./Components/BankAccountActivityDrawer'));

function replaceActivitySelection(bankId?: string) {
  const url = new URL(window.location.href);
  if (bankId) url.searchParams.set('bankActivity', bankId);
  else url.searchParams.delete('bankActivity');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

const BankAccountManagement: React.FC = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const access = useAccountSettingPermissions('BankAccount');
  const searchParams = useSearchParams();
  const [activityBank, setActivityBank] = useState<IBankAccount | null>(null);
  const openActivity = useCallback((bank: IBankAccount) => {
    if (!access.canView) return;
    replaceActivitySelection(bank.id);
    setActivityBank(bank);
  }, [access.canView]);
  const activityId = searchParams.get('bankActivity') || '';
  const previousYear = useRef(currentYear?.id);
  const [activitySelectionError, setActivitySelectionError] = useState<'unavailable' | 'failed' | null>(null);
  const [activitySelectionAttempt, setActivitySelectionAttempt] = useState(0);
  const [activitySelectionLoading, setActivitySelectionLoading] = useState(false);

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
    setQueryParams((prev) => prev.search === search ? prev : ({ ...prev, search, page: 1 }));
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
    { skip: !currentYear?.id || !access.canView, refetchOnMountOrArgChange: 60 }
  );

  // DELETE mutation
  const [deleteBankAccount] = useDeleteBankAccountMutation();
  const [getBankAccountDetail] = useLazyGetBankAccountByIdQuery();
  const selectedListBank = bankAccountData?.items?.find((item: IBankAccount) => item.id === activityId);

  useEffect(() => {
    let cancelled = false;
    setActivitySelectionError(null);
    if (!activityId || !currentYear?.id || !access.canView || (previousYear.current && previousYear.current !== currentYear.id)) {
      setActivityBank(null);
      setActivitySelectionLoading(false);
      return undefined;
    }
    if (selectedListBank) {
      setActivityBank(selectedListBank);
      setActivitySelectionLoading(false);
      return undefined;
    }
    setActivityBank(null);
    setActivitySelectionLoading(true);
    getBankAccountDetail(activityId, activitySelectionAttempt === 0).unwrap().then((detail) => {
      if (cancelled) return;
      if (detail.academicYearId !== currentYear.id) {
        setActivitySelectionError('unavailable');
        return;
      }
      setActivityBank(detail);
    }).catch(() => {
      if (!cancelled) setActivitySelectionError('failed');
    }).finally(() => {
      if (!cancelled) setActivitySelectionLoading(false);
    });
    return () => { cancelled = true; };
  }, [activityId, currentYear?.id, access.canView, selectedListBank, getBankAccountDetail, activitySelectionAttempt]);

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
    setActivitySelectionError(null);
    setActivitySelectionLoading(false);
  };

  // Dialog control states
  const deleteBankAccountDialog = useBoolean();
  const addBankAccountDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // Global state for tracking unsaved changes

  // State to store currently selected bank account for edit/delete operations
  const [selectedBankAccount, setSelectedBankAccount] = useState<IBankAccount | null>(null);

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
      <FinanceSetupManagerHeader
        editorOpen={addBankAccountDialog.value || deleteBankAccountDialog.value}
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

      {activitySelectionLoading && <Box role="status">Loading selected bank account…</Box>}
      {activitySelectionError && (
        <Alert
          severity={activitySelectionError === 'failed' ? 'error' : 'info'}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activitySelectionError === 'failed' && (
                <Button size="small" color="inherit" onClick={() => setActivitySelectionAttempt((attempt) => attempt + 1)}>Retry selected bank</Button>
              )}
              <Button size="small" color="inherit" onClick={closeActivity}>Clear selection</Button>
            </Box>
          }
        >
          {activitySelectionError === 'failed'
            ? 'The selected bank account could not be loaded. Please try again.'
            : 'The selected bank account is unavailable in the current academic year.'}
        </Alert>
      )}
      {!currentYear?.id ? (
        <Alert severity="info">Select an academic year to load bank accounts.</Alert>
      ) : (
        <BankAccountTable
          onView={openActivity}
          onDelete={(data) => {
            if (!access.canDelete || !data.canDelete) return;
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
          searchTerm={queryParams.search}
          filters={filters}
          page={queryParams.page - 1}
          rowsPerPage={queryParams.pageSize}
          onServerFilter={(next) => {
            setFilters(next);
            setQueryParams((current) => ({ ...current, page: 1 }));
          }}
        />
      )}

      <Suspense fallback={<Box role="status">Loading bank activity…</Box>}>
      {activityBank && currentYear?.id && previousYear.current === currentYear.id && (
        <BankAccountActivityDrawer
          open
          bank={activityBank}
          academicYearId={currentYear.id}
          onClose={closeActivity}
        />
      )}
      </Suspense>

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

      <FinanceSettingDeleteDialog
        open={deleteBankAccountDialog.value}
        title="Delete Bank Account"
        onClose={() => {
          setSelectedBankAccount(null);
          deleteBankAccountDialog.onFalse();
        }}
        onDelete={
          access.canDelete && selectedBankAccount?.canDelete
            ? () => deleteBankAccount(selectedBankAccount.id).unwrap()
            : undefined
        }
        successMessage="Bank account deleted successfully."
      >
        Delete <strong>{selectedBankAccount?.bankName}</strong> (
        {selectedBankAccount?.branchName}, <strong>{selectedBankAccount?.maskedAccountNumber}</strong>)?
      </FinanceSettingDeleteDialog>
    </Box>
  );
};

export default BankAccountManagement;
