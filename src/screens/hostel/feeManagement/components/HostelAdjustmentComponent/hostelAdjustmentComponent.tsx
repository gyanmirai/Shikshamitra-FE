import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AdjustmentForm from './components/adjustmentForm';

import type { IHostelFeeAdjustment } from './type';

const HostelAdjustmentComponent = () => {
  // state for adjustment dialog
  const adjustmentDialog = useBoolean();
  // state for delete adjustment dialog
  const deleteAdjustmentDialog = useBoolean();
  // Redux dispatch function for dispatching actions.
  const dispatch = useDispatch();
  // Selector for retrieving the 'isChanges' state from the Redux store.
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // selected adjustment details
  const [selectedAdjustment, setSelectedAdjustment] = useState<IHostelFeeAdjustment | null>(null);

  // Handler function for closing the hostel form, optionally handling form submission and changes.
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      adjustmentDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedAdjustment(null);
    } else if (!isChanges) {
      adjustmentDialog.onFalse();
      setSelectedAdjustment(null);
    }
  };
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          p: 2,
          width: '100%',
        }}
      >
        <Button startIcon={<Add />} variant="contained" onClick={adjustmentDialog.onTrue}>
          Adjustment
        </Button>
      </Box>
      <CustomizableTable
        tableId="hostel-fee-adjustment-table"
        noDataText={
          <>
            No Payment Adjustment Found
            <Box
              onClick={() => {
                adjustmentDialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create Adjustment
            </Box>
          </>
        }
        searchFieldProps={{
          placeholder: 'Search Amount, Fee Type...',
          label: 'Search Amount, Fee Type...',
        }}
        columns={[
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            render(value, row: any) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          {
            id: 'type',
            label: 'Type',
          },
          {
            id: 'reason',
            label: 'Reason',
          },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'Overdue'
                      ? 'error'
                      : value === 'Unpaid'
                        ? 'warning'
                        : value === 'Paid'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            minWidth: 40,
            sticky: true,
            render: (value, row) => (
              <ThreeDotsActions
                showEditIcon
                handleEditClick={() => {
                  adjustmentDialog.onTrue();
                  setSelectedAdjustment(row as IHostelFeeAdjustment);
                }}
                showDeleteIcon
                handleDeleteClick={() => {
                  deleteAdjustmentDialog.onTrue();
                  setSelectedAdjustment(row as IHostelFeeAdjustment);
                }}
                actions={() => (
                  <MenuList>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="tabler:receipt" />
                      Pay Now
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={[
          {
            id: 1,
            amount: 5000,
            type: 'Monthly Hostel Fee',
            reason: 'Standard monthly payment for April',
            status: 'Paid',
          },
          {
            id: 2,
            amount: 5000,
            type: 'Monthly Hostel Fee',
            reason: 'Standard monthly payment for March',
            status: 'Paid',
          },
          {
            id: 3,
            amount: 0,
            type: 'Monthly Hostel Fee',
            reason: 'Payment not yet made for February',
            status: 'Unpaid',
          },
          {
            id: 4,
            amount: 5000,
            type: 'Monthly Hostel Fee',
            reason: 'Payment via bank transfer for January',
            status: 'Paid',
          },
          {
            id: 5,
            amount: 0,
            type: 'Monthly Hostel Fee',
            reason: 'Missed December payment; now overdue',
            status: 'Overdue',
          },
        ]}
      />
      <CustomDialog
        title={selectedAdjustment ? 'Edit Adjustment' : 'Create Adjustment'}
        open={adjustmentDialog.value}
        handleClose={() => {
          adjustmentDialog.onFalse();
          setSelectedAdjustment(null);
        }}
      >
        <AdjustmentForm
          open={adjustmentDialog}
          editData={selectedAdjustment}
          onClose={() => {
            handleClose(null, false);
          }}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteAdjustmentDialog.value}
        onClose={() => {
          deleteAdjustmentDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to Delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default HostelAdjustmentComponent;
