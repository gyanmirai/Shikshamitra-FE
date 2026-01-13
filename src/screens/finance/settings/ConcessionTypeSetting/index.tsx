'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetConcessionTypesQuery,
  useGetConcessionTypeByIdQuery,
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

  // Fetch concession type data
  const { data: concessionTypes, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypesQuery,
    params: {
      academicYearId: currentYear?.id,
    },
    options: { skip: !currentYear?.id },
  });

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Delete mutation
  const { deleteConcessionType, isLoading: isDeleting } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionTypeMutation,
  });

  // Fetch concession type details by ID for view dialog
  const { data: concessionTypeDetails, isLoading: isLoadingDetails } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeByIdQuery,
    params: {
      academicYearId: currentYear?.id,
      concessionTypeId: selectedConcessionType?.id,
    },
    options: {
      skip: !currentYear?.id || !selectedConcessionType?.id || !viewConcessionTypeDialog.value,
    },
  });

  /**
   * Handles deleting a concession type
   */
  const handleDelete = async () => {
    if (!selectedConcessionType?.id) return;

    try {
      await deleteConcessionType({
        academicYearId: currentYear?.id,
        concessionTypeId: selectedConcessionType.id,
      }).unwrap();

      shikshaMitraToast.success({
        message: (
          <>
            Concession Type: <strong>{selectedConcessionType?.concessionName}</strong> deleted
            successfully.
          </>
        ),
      });
      deleteConcessionTypeDialog.onFalse();
      setSelectedConcessionType(null);
    } catch (error) {
      console.error('Error deleting concession type:', error);
      shikshaMitraToast.error({
        message: 'Failed to delete concession type. Please try again.',
      });
    }
  };

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
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Concession Type', href: '/finance/concession-type' },
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
        sx={{ px: 2, mb: 1 }}
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
          data={concessionTypes}
          isLoading={isLoading}
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
              <strong>{selectedConcessionType?.concessionName}</strong>?
            </>
          }
          action={
            <Button
              variant="contained"
              color="error"
              size="small"
              loading={isDeleting}
              disabled={isDeleting}
              onClick={handleDelete}
            >
              Yes
            </Button>
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
          <ConcessionDocumentTable data={selectedConcessionType} isLoading={isLoadingDetails} />
        </CustomDialog>
      </>
    </Box>
  );
};

export default ConcessionType;
