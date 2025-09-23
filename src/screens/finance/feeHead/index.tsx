'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
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
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';

import FeeHeadForm from './Components/FeeHeadForm';
import FeeHeadTable from './Components/FeeHeadTable';

import type { IFeeHead } from './Components/type';

const FeeHeadCreation = () => {
  // Custom hook to fetch fee head data
  const { data: feeHeadData, isLoading: paymentTermsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
  });

  // Dialog control states
  const addFeeHeadDialog = useBoolean(); // Controls add/edit fee head dialog
  const activeDialog = useBoolean(); // Controls active/inactive confirmation dialog
  const [open, setOpen] = useState(false); // Controls main dialog visibility

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup); // Tracks unsaved changes
  const [selectedFeeHead, setSelectedFeeHead] = useState<IFeeHead | null>(null); // Currently selected fee head for edit/delete
  const [selectedEntry, setSelectedEntry] = useState<IFeeHead | null>(null);
  const dispatch = useDispatch();

  /**
   * Handles closing of the fee head form dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedFeeHead(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Handle different closing scenarios
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addFeeHeadDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addFeeHeadDialog.onFalse();
      setTimeout(() => {
        setSelectedFeeHead(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Fee Head"
        description="Manage all fee heads such as Tuition Fee, Exam Fee, and more. Use the actions to edit or delete existing heads. Click '+ Fee Head' to create a new one."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Fee Head', href: '/finance/fee-head' },
        ]}
        action={
          <Button
            onClick={() => addFeeHeadDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Fee Head
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <FeeHeadTable
        onEdit={(data) => {
          setSelectedFeeHead(data);
          addFeeHeadDialog.onTrue();
        }}
        open={open}
        onAddFeeHead={addFeeHeadDialog}
        setOpenDialog={setOpen}
        editData={selectedFeeHead}
        setEditData={setSelectedFeeHead}
        data={feeHeadData}
        //  New props for toggle functionality
        activeDialog={activeDialog}
        selectedEntry={selectedEntry}
        setSelectedEntry={setSelectedEntry}
      />

      {/* Add/Edit Fee Head Dialog */}
      <CustomDialog
        open={addFeeHeadDialog.value}
        handleClose={() => {
          addFeeHeadDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeHead(null);
          }, 200);
        }}
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
                  : 'This modal allows creating a new fee head by selecting the appropriate fee category and entering the fee head name. It helps in organizing the fee structure into well-defined categories and heads, ensuring clarity and accuracy in financial management.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <FeeHeadForm open={addFeeHeadDialog} onClose={handleClose} editData={selectedFeeHead} />
      </CustomDialog>

      {/* Active/Inactive Confirmation Dialog */}
      <ConfirmDialog
        open={activeDialog.value}
        onClose={() => {
          setTimeout(() => {
            setSelectedEntry(null);
          }, 200);
          activeDialog.onFalse();
        }}
        title={selectedEntry?.toggle === true ? 'Inactive' : 'Active'}
        content={
          <>
            Are you sure you want move <strong>{selectedEntry?.feeHeadName}</strong> fee head to{' '}
            {selectedEntry?.toggle === true ? 'Inactive' : 'Active'}?
          </>
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={selectedEntry?.toggle === true ? GlobalIcons.draftIcon : GlobalIcons.publish}
              />
            }
            onClick={() => {
              const status = selectedEntry?.toggle === true ? 'Inactive' : 'Active';
              shikshaMitraToast.success({
                message: (
                  <>
                    Fee Head: <strong>{selectedEntry?.feeHeadName}</strong> moved to {status}{' '}
                    successfully.
                  </>
                ),
              });
              setTimeout(() => {
                setSelectedEntry(null);
              }, 200);
              activeDialog.onFalse();
            }}
          >
            {selectedEntry?.toggle === true ? 'Inactive' : 'Active'}
          </Button>
        }
      />
    </Box>
  );
};

export default FeeHeadCreation;
