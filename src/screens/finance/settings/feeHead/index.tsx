'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';

import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';

import { FinanceSettingDeleteDialog } from 'src/screens/finance/settings/components/FinanceSettingDeleteDialog';
import { financePermissions } from 'src/constants/finance-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import {
  useGetFeeHeadsQuery,
  useDeleteFeeHeadMutation,
} from 'src/redux/feeHeadManage/feeHeadManageApi';

import FeeHeadForm from './Components/FeeHeadForm';
import FeeHeadTable from './Components/FeeHeadTable';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';

import type { IFeeHead } from './Components/type';
import CustomTooltip from 'src/components/custom-tooltip';

const FeeHeadCreation = () => {
  const access = useFinancePermissions(financePermissions.fees.settings.feeHead);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });
  const [filters, setFilters] = useState<IParams['filters']>([]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // Custom hook to fetch fee head data
  const {
    data: feeHeadData,
    isLoading: isFeeHeadLoading,
    isFetching: isFeeHeadFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: {
      academicYearId: currentYear?.id,
      ...queryParams,
      filters: serializeFinanceTableFilters(filters),
    },
    options: { skip: !access.canView || !currentYear?.id },
  });

  // DELETE mutation
  const [deleteFeeHead] = useDeleteFeeHeadMutation();

  // Dialog control states
  const addFeeHeadDialog = useBoolean(); // Controls add/edit fee head dialog
  const deleteDialog = useBoolean(); // Controls delete confirmation dialog

  // State management
  const [selectedFeeHead, setSelectedFeeHead] = useState<IFeeHead | null>(null); // Currently selected fee head for edit/delete
  const [selectedEntry, setSelectedEntry] = useState<IFeeHead | null>(null);

  /**
   * Handles closing of the fee head form dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addFeeHeadDialog.value,
    () => {
      addFeeHeadDialog.onFalse();
      setSelectedFeeHead(null);
    }
  );

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {discardConfirmation}
      <CustomBreadcrumbs
        description="Manage all fee heads such as Tuition Fee, Exam Fee, and more. Use the actions to edit or delete existing heads. Click '+ Fee Head' to create a new one."
        heading="Fee Head"

        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Fee Head' },
        ]}
        action={
          <Button
            disabled={!access.canAdd}
            onClick={() => addFeeHeadDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Fee Head
          </Button>
        }
      />

      <FeeHeadTable
        onEdit={(data) => {
          if (!access.canAdd) return;
          setSelectedFeeHead(data);
          addFeeHeadDialog.onTrue();
        }}
        onDelete={(data) => {
          if (!access.canDelete || data.isUsedInDownstream) return;
          setSelectedEntry(data);
          deleteDialog.onTrue();
        }}
        isLoading={isFeeHeadLoading || isFeeHeadFetching}
        onAddFeeHead={addFeeHeadDialog}
        editData={selectedFeeHead}
        setEditData={setSelectedFeeHead}
        data={feeHeadData?.items}
        totalCount={feeHeadData?.totalCount}
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

      {/* Add/Edit Fee Head Dialog */}
      <CustomDialog
        open={addFeeHeadDialog.value && access.canAdd}
        guardUnsavedChanges={false}
        handleClose={() => handleClose()}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedFeeHead ? 'Update Fee Head' : 'Add Fee Head'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedFeeHead
                  ? 'You can update the fee head details including name, category, and description.'
                  : 'Add a new fee head by selecting a category and entering a name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {addFeeHeadDialog.value && (
          <FeeHeadForm open={addFeeHeadDialog} onClose={handleClose} editData={selectedFeeHead} />
        )}
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <FinanceSettingDeleteDialog
        open={deleteDialog.value && access.canDelete}
        title="Delete Fee Head"
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedEntry(null);
        }}
        onDelete={
          access.canDelete && selectedEntry && !selectedEntry.isUsedInDownstream
            ? () => deleteFeeHead({ id: selectedEntry.id }).unwrap()
            : undefined
        }
        successMessage="Fee head deleted successfully."
      >
        Delete fee head <strong>{selectedEntry?.name}</strong>?
      </FinanceSettingDeleteDialog>
    </Box>
  );
};

export default FeeHeadCreation;
