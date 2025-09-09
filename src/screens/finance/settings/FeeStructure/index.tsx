'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetFinanceFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';

import FeeStructureTable from './Components/FeeStructureTable';
import FeeStructureFormStepper from './Components/NewStructureForm';
import ViewFeeStructure from './Components/ViewDetails/ViewFeeStructure';

import type { IFeeStructure } from './type';

const FeeStructure = () => {
  // State to track the currently selected fee structure
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<IFeeStructure | null>(null);
  // Custom hook to manage dialog open/close state
  const addFeeStructureDialog = useBoolean();
  const confirmDialog = useBoolean();
  const viewFeeStructureDialog = useBoolean();

  const { data: feeStructure, isLoading: feeStructureLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceFeeStructureQuery,
  });

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch function for dispatching actions to update the store
  const dispatch = useDispatch();
  /**
   * Handles closing the fee structure dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addFeeStructureDialog.onFalse();
      setSelectedFeeStructure(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addFeeStructureDialog.onFalse();
      setSelectedFeeStructure(null);
    }
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {addFeeStructureDialog.value ? (
        <CustomBreadcrumbs
          heading="Fee Structure"
          description={
            selectedFeeStructure
              ? 'Update existing fee structure details including fee categories, amounts, payment schedules, and applicable student groups to ensure accurate fee management.'
              : 'View and manage all created fee structures. Use the actions to view details, make changes, or delete a structure. Click "Create New Fee Structure" to define a new fee configuration.'
          }
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fee Structure', href: '/finance/fee-structure' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      ) : viewFeeStructureDialog.value ? (
        <CustomBreadcrumbs
          heading="View Fee Structure"
          description="View detailed information about the selected fee structure including categories, amounts and applicable groups."
          isBack
          onBack={() => {
            viewFeeStructureDialog.onFalse();
            setSelectedFeeStructure(null);
          }}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fee Structure', href: '/finance/fee-structure' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Fee Structure"
          description="Define and organize fee structures by configuring categories, amounts and payment schedules to ensure effective fee management."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fee Structure', href: '/finance/fee-structure' },
          ]}
          action={
            <Button
              onClick={() => addFeeStructureDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
            >
              Fee Structure
            </Button>
          }
          sx={{ px: 1, mb: 2 }}
        />
      )}
      <>
        {/* Subject form card for creating/editing subjects */}
        {addFeeStructureDialog.value ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <FeeStructureFormStepper
              open={addFeeStructureDialog}
              onClose={handleClose}
              editData={selectedFeeStructure}
            />
          </Card>
        ) : !viewFeeStructureDialog.value ? (
          <FeeStructureTable
            data={feeStructure}
            addFeeStructure={addFeeStructureDialog}
            editData={selectedFeeStructure}
            setEditData={setSelectedFeeStructure}
            onEdit={(data) => {
              addFeeStructureDialog.onTrue();
              setSelectedFeeStructure(data);
            }}
            onToggle={(data) => {
              confirmDialog.onTrue();
              setSelectedFeeStructure(data);
            }}
            onView={(data) => {
              viewFeeStructureDialog.onTrue();
              setSelectedFeeStructure(data);
            }}
          />
        ) : null}
      </>

      {viewFeeStructureDialog.value && (
        <ViewFeeStructure
          open={viewFeeStructureDialog}
          onClose={() => {
            viewFeeStructureDialog.onFalse();
            setTimeout(() => {
              setSelectedFeeStructure(null);
            }, 200);
          }}
          data={selectedFeeStructure}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.value}
        icon={selectedFeeStructure?.status === 0 ? 'warning' : 'success'}
        onClose={() => {
          confirmDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeStructure(null);
          }, 200); // Adjust the delay based on your dialog transition duration
        }}
        title={selectedFeeStructure?.status === 0 ? 'Lock' : 'Unlock'}
        content={
          selectedFeeStructure && Array.isArray(selectedFeeStructure.feeStructureName) ? (
            <>
              Are you sure you want move <strong>{selectedFeeStructure.feeStructureName}</strong>{' '}
              Fee Structure to {selectedFeeStructure.status === 0 ? 'lock' : 'unlock'} ?
            </>
          ) : (
            <>
              Are you sure you want move <strong>{selectedFeeStructure?.feeStructureName}</strong>{' '}
              Fee Structure to {selectedFeeStructure?.status === 0 ? 'lock' : 'unlock'} ?
            </>
          )
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={
                  selectedFeeStructure?.status === 0 ? GlobalIcons.lockIcon : GlobalIcons.lockIcon
                }
              />
            }
            onClick={() => {
              const status = selectedFeeStructure?.status === 0 ? 'Lock' : 'Unlock';

              shikshaMitraToast.success({
                message: (
                  <>
                    Fee Structure: <strong>{selectedFeeStructure?.feeStructureName}</strong> moved
                    to {status} successfully.
                  </>
                ),
              });
              confirmDialog.onFalse();
            }}
          >
            {selectedFeeStructure?.status === 0 ? 'Lock' : 'Unlock'}
          </Button>
        }
      />
    </Box>
  );
};

export default FeeStructure;
