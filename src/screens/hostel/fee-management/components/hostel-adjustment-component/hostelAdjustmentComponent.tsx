import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import { formatNumber } from 'src/utils/formate_number';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { Box, Button, MenuList, MenuItem, Typography } from '@mui/material';
import {
  HostelPaymentStatusType,
  HostelPaymentStatusOptions,
  HostelPaymentStatusTypeColor,
} from 'src/enums/hostel-payment-type';

import AdjustmentForm from './components/adjustmentForm';
import PaymentReceipt from '../hostel-payment-history-component/paymentReceipt';

import type { IHostelFeeAdjustment } from './type';

const HostelAdjustmentComponent = () => {
  // State for managing the receipt dialog visibility
  const receiptDialog = useBoolean();
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
          width: '100%',
        }}
      >
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={adjustmentDialog.onTrue}
          size="small"
        >
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
            filterType: 'enum',
            enumOptions: HostelPaymentStatusOptions,

            render(value, row) {
              const color = HostelPaymentStatusTypeColor[
                value as HostelPaymentStatusType
              ] as LabelColor;

              return <Label color={color}>{HostelPaymentStatusType[value]}</Label>;
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
                placement="right-top"
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
                    {row.status === 'Paid' ? (
                      <MenuItem onClick={() => {}}>
                        <Iconify icon="tabler:receipt" />
                        Pay Now
                      </MenuItem>
                    ) : (
                      <MenuItem
                        onClick={() => {
                          receiptDialog.onTrue();
                        }}
                      >
                        <Iconify icon="tabler:receipt" />
                        View Receipt
                      </MenuItem>
                    )}
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
            status: 1,
          },
          {
            id: 2,
            amount: 5000,
            type: 'Monthly Hostel Fee',
            reason: 'Standard monthly payment for March',
            status: 1,
          },
          {
            id: 3,
            amount: 0,
            type: 'Monthly Hostel Fee',
            reason: 'Payment not yet made for February',
            status: 0,
          },
          {
            id: 4,
            amount: 5000,
            type: 'Monthly Hostel Fee',
            reason: 'Payment via bank transfer for January',
            status: 1,
          },
          {
            id: 5,
            amount: 0,
            type: 'Monthly Hostel Fee',
            reason: 'Missed December payment; now overdue',
            status: 2,
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
        content="Are you sure you want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />
      <CustomDialog
        open={receiptDialog.value}
        title=""
        handleClose={receiptDialog.onFalse}
        maxWidth="md"
        fullWidth
      >
        <PaymentReceipt />
      </CustomDialog>
    </Box>
  );
};

export default HostelAdjustmentComponent;
