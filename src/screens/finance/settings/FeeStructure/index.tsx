'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetFinanceFeeStructureQuery,
  usePatchFeeStructureStatusMutation,
} from 'src/redux/finance/financeFeeStructure';

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

  const { data: feeStructure } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceFeeStructureQuery,
  });

  // PATCH mutation for status change
  const { patchFeeStructureStatus } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFeeStructureStatusMutation,
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
          heading={selectedFeeStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
          description={
            selectedFeeStructure
              ? 'Modify the selected fee structure by updating categories, amounts, schedules, and student groups. Your changes will affect how fees are calculated and collected.'
              : addFeeStructureDialog.value
                ? 'Create a new fee structure by defining categories, setting amounts, configuring payment schedules, and assigning student groups. This will establish how fees are collected.'
                : 'Browse and manage existing fee structures. View complete details, make modifications, or remove structures as needed. Create new structures to expand fee configurations.'
          }
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Setting',
              href: '/finance/settings/fee-category',
              onClick(e) {
                handleClose(null, false);
              },
            },
            {
              name: 'Fee Structure',
              href: '/finance/settings/create-fee-structure',
              onClick(e) {
                handleClose(null, false);
              },
            },
            {
              name: selectedFeeStructure ? 'Edit Fee Structure' : 'Add Fee Structure',
            },
          ]}
          sx={{ mb: 2 }}
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
            {
              name: 'Setting',
              href: '/finance/settings/fee-category',
              onClick(e) {
                handleClose(null, false);
              },
            },
            {
              name: 'Fee Structure',
              href: '/finance/settings/create-fee-structure',
              onClick(e) {
                viewFeeStructureDialog.onFalse();
                setSelectedFeeStructure(null);
              },
            },
            { name: 'View Fee Structure', href: '' },
          ]}
          sx={{ px: 1, mb: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Fee Structure"
          description="Define and organize fee structures by configuring categories, amounts and payment schedules to ensure effective fee management."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Setting',
              href: '/finance/settings/fee-category',
              onClick(e) {
                handleClose(null, false);
              },
            },
            { name: 'Fee Structure' },
          ]}
          action={
            <Button
              onClick={() => addFeeStructureDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Fee Structure
            </Button>
          }
          sx={{ px: 1, mb: 1 }}
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
        <Card sx={{ height: '100%', boxShadow: 'none' }}>
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
        </Card>
      )}

      <ConfirmDialog
        open={confirmDialog.value}
        icon="error"
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
              {selectedFeeStructure.status === 1 && (
                <div style={{ marginTop: '8px', color: '#d32f2f' }}>
                  Note: Please take approval from admin before unlocking the fee structure.
                </div>
              )}
            </>
          ) : (
            <>
              Are you sure you want move <strong>{selectedFeeStructure?.feeStructureName}</strong>{' '}
              Fee Structure to {selectedFeeStructure?.status === 0 ? 'lock' : 'unlock'} ?
              {selectedFeeStructure?.status === 1 && (
                <div style={{ marginTop: '8px', color: '#d32f2f' }}>
                  Note: Please take approval from admin before unlocking the fee structure.
                </div>
              )}
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
                  selectedFeeStructure?.status === 0 ? 'mdi:lock-outline' : 'mdi:lock-open-outline'
                }
              />
            }
            onClick={async () => {
              try {
                const newStatus = selectedFeeStructure?.status === 0 ? 1 : 0;
                await patchFeeStructureStatus({
                  feeStructureId: selectedFeeStructure?.id,
                  body: { status: newStatus },
                }).unwrap();

                const statusLabel = newStatus === 1 ? 'Lock' : 'Unlock';
                shikshaMitraToast.success({
                  message: (
                    <>
                      Fee Structure: <strong>{selectedFeeStructure?.feeStructureName}</strong> moved
                      to {statusLabel} successfully
                    </>
                  ),
                });
                confirmDialog.onFalse();
                setTimeout(() => {
                  setSelectedFeeStructure(null);
                }, 200);
              } catch (error) {
                console.error('Failed to update fee structure status:', error);
                shikshaMitraToast.error({
                  message: 'Failed to update fee structure status',
                });
              }
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
