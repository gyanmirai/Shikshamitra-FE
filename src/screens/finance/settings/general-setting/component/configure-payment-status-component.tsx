import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddPaymentStatusDialog from '../dialogs/finance-add-payment-status-dialog';

const ConfigurePaymentStatusComponent = () => {
  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  // Dialog state for edit/add payment status popup
  const editDialog = useBoolean();
  // State to track if we are in edit mode or add mode
  const [isEdit, setIsEdit] = useState(false);
  return (
    <Box py="20px" display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <CustomizableTable
            noDataText={
              <>
                No Payment Status Data Found
                <Box
                  onClick={() => {
                    setIsEdit(false);
                    editDialog.onTrue();
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
                  Add Payment Status
                </Box>
              </>
            }
            tableId="payment-status"
            columns={[
              {
                id: 'paymentStatusName',
                label: 'Payment Status',
                render(value, row) {
                  return (
                    <Typography fontSize="12px" sx={{ textTransform: 'capitalize' }}>
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'action',
                label: 'Actions',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'left',
                minWidth: 50,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        setSelectedEntry(row);
                        dialogForDeleteConfirmation.onTrue();
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);
                        editDialog.onTrue();
                        setIsEdit(true);
                      }}
                    />
                  );
                },
              },
            ]}
            data={[
              {
                id: 1,
                paymentStatusName: 'paid',
              },
              {
                id: 2,
                paymentStatusName: 'pending',
              },
              {
                id: 3,
                paymentStatusName: 'overdue',
              },
              {
                id: 4,
                paymentStatusName: 'cancelled',
              },
            ]}
          />
        </Grid>
      </Grid>

      <CustomDialog
        open={editDialog.value}
        handleClose={() => {
          editDialog.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Payment Status' : 'Add Payment Status'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Configure payment status options like 'Paid', 'Pending', 'Overdue' etc. These statuses help track and manage the payment lifecycle of fees and other financial transactions."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddPaymentStatusDialog
          onClose={() => {
            editDialog.onFalse();
          }}
          isEditMode={isEdit}
          data={selectedEntry}
          onSave={() => {
            setSelectedEntry(null);
            editDialog.onFalse();
          }}
        />
      </CustomDialog>

      <ConfirmDialog
        open={dialogForDeleteConfirmation.value}
        onClose={() => {
          dialogForDeleteConfirmation.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{selectedEntry?.paymentStatusName}</strong>{' '}
            payment status?
          </>
        }
        action={
          <LoadingButton variant="contained" color="error" size="small" onClick={() => {}}>
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ConfigurePaymentStatusComponent;
