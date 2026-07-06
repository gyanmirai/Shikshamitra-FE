'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import { Box, Tab, Tabs, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  accountHeadApi,
  useGetAccountHeadsQuery,
  useDeleteAccountHeadMutation,
} from 'src/redux/finance/accountHeadApi';

import AccountHeadForm from './Components/AccountHeadForm';
import AccountHeadTable from './Components/AccountHeadTable';

import type { IAccountHead } from './Components/type';

const AccountHeadMaster: React.FC = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });
  const [headTypeFilter, setHeadTypeFilter] = useState<string>('All');

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Get account heads data
  const {
    data: accountHeadData,
    isLoading: accountHeadsLoading,
    isFetching: accountHeadFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAccountHeadsQuery,
    params: {
      academicYearId: currentYear?.id,
      headType: headTypeFilter === 'All' ? undefined : headTypeFilter,
      ...queryParams,
    },
  });

  // DELETE mutation
  const [deleteAccountHead, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAccountHeadMutation,
  });

  // Dialog control states
  const deleteDialog = useBoolean();
  const addDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const [selectedItem, setSelectedItem] = useState<IAccountHead | null>(null);
  const { confirmWithUndo } = useConfirmWithUndo();
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedItem(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addDialog.onFalse();
      setTimeout(() => {
        setSelectedItem(null);
      }, 200);
    }
  };

  const TABS = [
    { value: 'All', label: 'All' },
    { value: 'Income', label: 'Income' },
    { value: 'Expense', label: 'Expense' },
    { value: 'Bank-Cash', label: 'Bank-Cash' },
    { value: 'Liability', label: 'Liability' },
  ];

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Account Heads"
        description="Manage financial account heads. Create Income, Expense, Asset, and Liability heads to track your school's finances."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Settings' },
          { name: 'Account Heads' },
        ]}
        action={
          <Button
            onClick={() => addDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Account Head
          </Button>
        }
        sx={{ px: 1 }}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, mb: 2 }}>
        <Tabs
          value={headTypeFilter}
          onChange={(_e, newValue) => setHeadTypeFilter(newValue)}
          aria-label="Account Head Type Tabs"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      <AccountHeadTable
        onDelete={(data) => {
          setSelectedItem(data);
          deleteDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedItem(data);
          addDialog.onTrue();
        }}
        open={open}
        onAddAccountHead={addDialog}
        setOpenDialog={setOpen}
        editData={selectedItem}
        setEditData={setSelectedItem}
        data={accountHeadData?.items || []}
        isLoading={accountHeadsLoading || accountHeadFetching}
        totalCount={accountHeadData?.totalCount}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setTimeout(() => {
            setSelectedItem(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedItem ? 'Update Account Head' : 'Add Account Head'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedItem
                  ? 'Update existing account head details.'
                  : 'Create a new account head to track income, expense, assets, or liabilities.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <AccountHeadForm open={addDialog} onClose={handleClose} editData={selectedItem} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedItem(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete account head <strong>{selectedItem?.headName}</strong>?
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
              if (!selectedItem?.id) return;

              confirmWithUndo({
                item: selectedItem,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    accountHeadApi.util.updateQueryData(
                      'getAccountHeads',
                      {
                        academicYearId: currentYear?.id,
                        headType: headTypeFilter === 'All' ? undefined : headTypeFilter,
                        ...queryParams,
                      },
                      (draft: any) => {
                        const list = Array.isArray(draft) ? draft : draft?.items || [];
                        const index = list.findIndex(
                          (c: any) => c.id === (selectedItem as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          list.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deleteAccountHead(selectedItem.id),
              });
              deleteDialog.onFalse();
              setSelectedItem(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default AccountHeadMaster;
