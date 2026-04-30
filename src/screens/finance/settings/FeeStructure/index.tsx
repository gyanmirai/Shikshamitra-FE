'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Card } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGenerateFeeStructureMutation,
  useUpdateFeeStructureStatusMutation,
} from 'src/redux/finance/financeFeeStructure';

import FeeStructureTable from './Components/FeeStructureTable';
import FeeStructureEditForm from './Components/FeeStructureEditForm';
import ViewFeeStructure from './Components/ViewDetails/ViewFeeStructure';

import type { IFeeStructure } from './type';

const FeeStructure = () => {
  // State to track the currently selected fee structure
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<IFeeStructure | null>(null);
  // Custom hook to manage dialog open/close state
  const editFeeStructureDialog = useBoolean();
  const confirmDialog = useBoolean();
  const viewFeeStructureDialog = useBoolean();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // POST mutation for generating fee structure
  const [generateFeeStructure, { isLoading: isGenerating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGenerateFeeStructureMutation,
  });

  // PATCH mutation for status change
  const [patchFeeStructureStatus, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeStructureStatusMutation,
  });

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch function for dispatching actions to update the store
  const dispatch = useDispatch();
  /**
   * Handles closing the fee structure edit form
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      editFeeStructureDialog.onFalse();
      setSelectedFeeStructure(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      editFeeStructureDialog.onFalse();
      setSelectedFeeStructure(null);
    }
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Custom breadcrumbs component for navigation and page header */}
      {editFeeStructureDialog.value ? (
        <CustomBreadcrumbs
          heading="Edit Fee Structure"
          description="Modify the selected fee structure by updating categories, amounts, schedules, and student groups. Your changes will affect how fees are calculated and collected."
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            {
              name: 'Settings',
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
              name: 'Edit Fee Structure',
            },
          ]}
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
            { name: 'Fees', href: '/finance/fee-collection' },
            {
              name: 'Settings',
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
        />
      ) : (
        <CustomBreadcrumbs
          heading="Fee Structure"
          description="Define and organize fee structures by configuring categories, amounts and payment schedules to ensure effective fee management."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/fee-collection' },
            {
              name: 'Settings',
              href: '/finance/settings/fee-category',
              onClick(e) {
                handleClose(null, false);
              },
            },
            { name: 'Fee Structure' },
          ]}
          action={
            <LoadingButton
              variant="contained"
              loading={isGenerating}
              startIcon={<Iconify icon="mdi:plus" />}
              onClick={async () => {
                if (!currentYear?.id) {
                  shikshaMitraToast.error({
                    message: 'Please select an academic year before generating fee structure.',
                  });
                  return;
                }
                try {
                  await generateFeeStructure({ academicYearId: currentYear.id }).unwrap();
                  shikshaMitraToast.success({
                    message: 'Fee structure generated successfully.',
                  });
                } catch (error) {
                  console.error('Failed to generate fee structure:', error);
                  shikshaMitraToast.error({
                    message: 'Failed to generate fee structure.',
                  });
                }
              }}
              size="small"
            >
              Generate Fee Structure
            </LoadingButton>
          }
        />
      )}
      <>
        {/* Fee Structure edit form card */}
        {editFeeStructureDialog.value && selectedFeeStructure ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <FeeStructureEditForm editData={selectedFeeStructure} onClose={handleClose} />
          </Card>
        ) : !viewFeeStructureDialog.value ? (
          <FeeStructureTable
            addFeeStructure={editFeeStructureDialog}
            editData={selectedFeeStructure}
            setEditData={setSelectedFeeStructure}
            onEdit={(data) => {
              editFeeStructureDialog.onTrue();
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
        <Box sx={{ height: '100%' }}>
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
        </Box>
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
          selectedFeeStructure && Array.isArray(selectedFeeStructure.name) ? (
            <>
              Are you sure you want move <strong>{selectedFeeStructure.name}</strong> Fee Structure
              to {selectedFeeStructure.status === 0 ? 'lock' : 'unlock'} ?
              {selectedFeeStructure.status === 1 && (
                <div style={{ marginTop: '8px', color: '#d32f2f' }}>
                  Note: Please take approval from admin before unlocking the fee structure.
                </div>
              )}
            </>
          ) : (
            <>
              Are you sure you want move <strong>{selectedFeeStructure?.name}</strong> Fee Structure
              to {selectedFeeStructure?.status === 0 ? 'lock' : 'unlock'} ?
              {selectedFeeStructure?.status === 1 && (
                <div style={{ marginTop: '8px', color: '#d32f2f' }}>
                  Note: Please take approval from admin before unlocking the fee structure.
                </div>
              )}
            </>
          )
        }
        action={
          <LoadingButton
            variant="contained"
            size="small"
            loading={isUpdating}
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
                      Fee Structure: <strong>{selectedFeeStructure?.name}</strong> moved to{' '}
                      {statusLabel} successfully
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
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FeeStructure;
