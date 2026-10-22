'use client';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import {
  incomeCategoryApi,
  useGetIncomeCategoriesQuery,
  useDeleteIncomeCategoryMutation,
} from 'src/redux/finance/incomeCategory';

import IncomeCategoryForm from './Components/IncomeCategoryForm';
import IncomeCategoryTable from './Components/IncomeCategoryTable';

import type { IIncomeCategory } from './Components/type';

const FinanceIncomeCategoriesScreen = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const access = useAccountSettingPermissions('IncomeCategory');

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Use custom hook to fetch income categories
  const {
    data: incomeCategoryData,
    isLoading: incomeCategoryLoading,
    isFetching: incomeCategoryFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: { academicYearId: currentYear?.id, ...queryParams },
  });

  // DELETE mutation
  const [deleteIncomeCategory, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteIncomeCategoryMutation,
  });

  // Dialog control states
  const deleteIncomeCategoryDialog = useBoolean();
  const addIncomeCategoryDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<IIncomeCategory | null>(
    null
  );
  const { confirmWithUndo } = useConfirmWithUndo();
  const dispatch = useDispatch();

  /**
   * Handles closing of the income category form dialog
   */
  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addIncomeCategoryDialog.value,
    () => {
      addIncomeCategoryDialog.onFalse();
      setSelectedIncomeCategory(null);
    }
  );

  if (incomeCategoryLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {discardConfirmation}
      <CustomBreadcrumbs
        description="This screen displays all the created income categories with an option to create a new income category."
        heading="Income Category"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Accounts', href: '/finance/income-tracking' },
          { name: 'Settings' },
          { name: 'Income Category' },
        ]}
        action={
          <Button
            disabled={!access.canAdd}
            onClick={() => addIncomeCategoryDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Income Category
          </Button>
        }
      />

      <IncomeCategoryTable
        onDelete={(data) => {
          setSelectedIncomeCategory(data);
          deleteIncomeCategoryDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedIncomeCategory(data);
          addIncomeCategoryDialog.onTrue();
        }}
        open={open}
        onAddIncomeCategory={addIncomeCategoryDialog}
        setOpenDialog={setOpen}
        editData={selectedIncomeCategory}
        setEditData={setSelectedIncomeCategory}
        data={incomeCategoryData?.items || []}
        isLoading={incomeCategoryLoading || incomeCategoryFetching}
        totalCount={incomeCategoryData?.totalCount}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
      />

      <CustomDialog
        titleInfo="Maintain the category name, tags, and description used to organize Finance records."
        open={addIncomeCategoryDialog.value}
        guardUnsavedChanges={false}
        handleClose={() => handleClose()}
        title={selectedIncomeCategory ? 'Edit Income Category' : 'Add Income Category'}

        maxWidth="sm"
      >
        {addIncomeCategoryDialog.value && (
          <IncomeCategoryForm
            open={addIncomeCategoryDialog}
            onClose={handleClose}
            editData={selectedIncomeCategory}
          />
        )}
      </CustomDialog>

      <ConfirmDialog
        open={deleteIncomeCategoryDialog.value}
        onClose={() => {
          setSelectedIncomeCategory(null);
          deleteIncomeCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete income category{' '}
            <strong>{selectedIncomeCategory?.name}</strong>?
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
              if (!selectedIncomeCategory?.id) return;

              confirmWithUndo({
                message: 'Deletion pending',
                item: selectedIncomeCategory,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    incomeCategoryApi.util.updateQueryData(
                      'getIncomeCategories',
                      { academicYearId: currentYear?.id, ...queryParams },
                      (draft: any) => {
                        const list = Array.isArray(draft) ? draft : draft?.items || [];
                        const index = list.findIndex(
                          (c: any) => c.id === (selectedIncomeCategory as any)?.id
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
                onCommit: () => deleteIncomeCategory(selectedIncomeCategory.id),
              });
              deleteIncomeCategoryDialog.onFalse();
              setSelectedIncomeCategory(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FinanceIncomeCategoriesScreen;
