'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetConcessionTypeQuery } from 'src/redux/finance/concessionType';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ConcessionTypeTable from './Components/ConcessionTable';
import ConcessionTypeForm from './Components/ConcessionTypeForm';

import type { IConcessionTypeForm } from './type';

const ConcessionType = () => {
  // State to track the currently selected concession type
  const [selectedConcessionType, setSelectedConcessionType] = useState<IConcessionTypeForm | null>(
    null
  );

  // Custom hook to manage dialog open/close state
  const addConcessionTypeDialog = useBoolean();
  const deleteConcessionTypeDialog = useBoolean();

  // Fetch concession type data
  const { data: concessionTypes, isLoading: concessionTypesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionTypeQuery,
  });

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

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
          >
            Concession Type
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />
      <>
        {/* Form card for creating/editing concession types */}

        <CustomDialog
          open={addConcessionTypeDialog.value}
          handleClose={() => {
            addConcessionTypeDialog.onFalse();
            setSelectedConcessionType(null);
          }}
          maxWidth="sm"
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
        />

        <ConfirmDialog
          open={deleteConcessionTypeDialog.value}
          icon="warning"
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
              onClick={() => {
                // Handle delete action here
                shikshaMitraToast.success({
                  message: (
                    <>
                      Concession Type: <strong>{selectedConcessionType?.concessionName}</strong>{' '}
                      deleted successfully.
                    </>
                  ),
                });
                deleteConcessionTypeDialog.onFalse();
                setSelectedConcessionType(null);
              }}
            >
              Yes
            </Button>
          }
        />
      </>
    </Box>
  );
};

export default ConcessionType;
