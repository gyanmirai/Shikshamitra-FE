'use client';

import type { RootState } from 'src/redux/store';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
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
  concessionTypeApi,
  useGetConcessionTypesQuery,
  useDeleteConcessionTypeMutation,
} from 'src/redux/finance/concessionType';

import ConcessionTypeTable from './Components/ConcessionTable';
import ConcessionTypeForm from './Components/ConcessionTypeForm';
import ConcessionDocumentTable from './Components/ConcessionDocuments';

import type { IConcessionTypeForm } from './type';

const ConcessionType = () => {
  // State to track the currently selected concession type
  const [selectedConcessionType, setSelectedConcessionType] = useState<IConcessionTypeForm | null>(
    null
  );
  // Custom hook to manage dialog open/close state
  const addConcessionTypeDialog = useBoolean();
  const deleteConcessionTypeDialog = useBoolean();
  const viewConcessionTypeDialog = useBoolean();

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  const apiParams = {
    academicYearId: currentYear?.id,
    skipCount: (queryParams.page - 1) * queryParams.pageSize,
    maxResultCount: queryParams.pageSize,
    searchTerm: queryParams.search || undefined,
  };

  // Fetch concession type data
  const {
    data: concessionTypes,
    isLoading,
    isFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: apiParams,
  });

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Delete mutation
  const [deleteConcessionType, { isLoading: isLoadingDelete }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionTypeMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

  /**
   * Handles closing the concession type dialog
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addConcessionTypeDialog.onFalse();
      setSelectedConcessionType(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addConcessionTypeDialog.onFalse();
      setSelectedConcessionType(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Concession Type"
        description={
          addConcessionTypeDialog.value
            ? 'Access detailed information on the selected concession type such as discount rules and applicable conditions.'
            : 'Define and manage concession types by linking them with student categories and fee structures.'
        }
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/concession' },
          { name: 'Settings' },
          { name: 'Concession Type' },
        ]}
        action={
          <Button
            onClick={() => addConcessionTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Concession Type
          </Button>
        }
      />
      <>
        {/* Form card for creating/editing concession types */}

        <CustomDialog
          open={addConcessionTypeDialog.value}
          handleClose={() => {
            addConcessionTypeDialog.onFalse();
            setSelectedConcessionType(null);
          }}
          maxWidth="md"
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {selectedConcessionType ? 'Update Concession Type' : 'Add Concession Type'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title={
                  selectedConcessionType
                    ? 'Update existing concession details including percentage, amount and applicable fee heads'
                    : 'Define a new fee concession and specify how it applies to selected fee heads'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <ConcessionTypeForm
            open={addConcessionTypeDialog}
            onClose={handleClose}
            editData={selectedConcessionType}
          />
        </CustomDialog>

        <ConcessionTypeTable
          data={concessionTypes?.data?.items ?? []}
          isLoading={Boolean(currentYear?.id) && (isLoading || isFetching)}
          addConcessionType={addConcessionTypeDialog}
          setEditData={setSelectedConcessionType}
          onEdit={(data) => {
            addConcessionTypeDialog.onTrue();
            setSelectedConcessionType(data);
          }}
          onDelete={(data) => {
            deleteConcessionTypeDialog.onTrue();
            setSelectedConcessionType(data);
          }}
          onView={(data) => {
            viewConcessionTypeDialog.onTrue();
            setSelectedConcessionType(data);
          }}
          totalCount={concessionTypes?.data?.totalCount}
          onServerPagination={handleServerPagination}
          onServerSearch={handleServerSearch}
        />

        <ConfirmDialog
          open={deleteConcessionTypeDialog.value}
          icon="error"
          onClose={() => {
            deleteConcessionTypeDialog.onFalse();
            setTimeout(() => {
              setSelectedConcessionType(null);
            }, 200);
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete concession type{' '}
              <strong>
                {selectedConcessionType?.name || (selectedConcessionType as any)?.concessionName}
              </strong>
              ?
            </>
          }
          action={
            <LoadingButton
              variant="contained"
              color="error"
              size="small"
              loading={isLoadingDelete}
              onClick={() => {
                confirmWithUndo({
                  item: selectedConcessionType,
                  onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                    dispatchFn(
                      concessionTypeApi.util.updateQueryData(
                        'getConcessionTypes',
                        apiParams,
                        (draft: any) => {
                          const index = draft.data?.items?.findIndex(
                            (b: any) => b.id === (selectedConcessionType as any)?.id
                          );
                          setDeleteIndex(index);
                          if (index !== -1) {
                            draft.data.items.splice(index, 1);
                          }
                        }
                      )
                    ),
                  onUndoRestore: () => refetch(),
                  onCommit: () =>
                    deleteConcessionType({
                      concessionTypeId: selectedConcessionType?.id,
                    }),
                });
                deleteConcessionTypeDialog.onFalse();
                setSelectedConcessionType(null);
              }}
            >
              Yes
            </LoadingButton>
          }
        />

        <CustomDialog
          open={viewConcessionTypeDialog.value}
          handleClose={() => {
            viewConcessionTypeDialog.onFalse();
            setSelectedConcessionType(null);
          }}
          maxWidth="md"
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">View Concession Type Details</Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="View detailed information about this concession type including applicable rules and conditions"
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <ConcessionDocumentTable data={selectedConcessionType} />
        </CustomDialog>
      </>
    </Box>
  );
};

export default ConcessionType;
