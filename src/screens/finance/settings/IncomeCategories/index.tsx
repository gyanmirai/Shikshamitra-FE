'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Alert, Stack, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import {
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
  const [filters, setFilters] = useState<IParams['filters']>([]);

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
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
      ...queryParams,
      filters: serializeFinanceTableFilters(filters),
    },
  });

  // DELETE mutation
  const [deleteIncomeCategory, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteIncomeCategoryMutation,
    popupConfig: { error: false },
  });

  // Dialog control states
  const deleteIncomeCategoryDialog = useBoolean();
  const addIncomeCategoryDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<IIncomeCategory | null>(
    null
  );
  const [deleteError, setDeleteError] = useState('');
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
          if (!access.canDelete || !data.canDelete || data.isUsedInDownstream) return;
          setDeleteError('');
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
        filters={filters}
        page={queryParams.page - 1}
        rowsPerPage={queryParams.pageSize}
        onServerFilter={(next) => {
          setFilters(next);
          setQueryParams((current) => ({ ...current, page: 1 }));
        }}
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
          if (isDeleting) return;
          setSelectedIncomeCategory(null);
          setDeleteError('');
          deleteIncomeCategoryDialog.onFalse();
        }}
        disableBackdropClick
        disableEscapeKeyDown={isDeleting}
        disableCancel={isDeleting}
        title="Delete Income Category"
        content={
          <Stack spacing={2}>
            <Box>
              Delete income category <strong>{selectedIncomeCategory?.name}</strong>?
            </Box>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
          </Stack>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={
              isDeleting ||
              !access.canDelete ||
              !selectedIncomeCategory?.canDelete ||
              selectedIncomeCategory.isUsedInDownstream
            }
            onClick={async () => {
              if (
                isDeleting ||
                !access.canDelete ||
                !selectedIncomeCategory?.canDelete ||
                selectedIncomeCategory.isUsedInDownstream
              )
                return;
              setDeleteError('');
              try {
                await deleteIncomeCategory(selectedIncomeCategory.id).unwrap();
                deleteIncomeCategoryDialog.onFalse();
                setSelectedIncomeCategory(null);
                shikshaMitraToast.success({ message: 'Income category deleted successfully' });
              } catch (error) {
                const problem = parseApiProblemDetail(error);
                setDeleteError(
                  problem.errorCode === 'Finance:Accounts:Settings:CategoryInUse'
                    ? 'This income category is now referenced by other Finance records and cannot be deleted.'
                    : problem.detail
                );
              }
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
