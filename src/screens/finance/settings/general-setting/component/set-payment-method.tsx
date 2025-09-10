import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Grid, Typography } from '@mui/material';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddPaymentMethodDialog from '../dialogs/finance-add-payment-method-dialog';

const SetPaymentMethodComponent = () => {
  // Dialog state for delete confirmation modal
  const dialogForDeleteConfirmation = useBoolean();
  // Dialog state for edit/add payment method modal
  const editDialog = useBoolean();
  // State to track if we're editing (true) or adding (false) a payment method
  const [isEdit, setIsEdit] = useState(false);

  // Mock data for payment methods - replace with API integration
  const [data, setData] = useState([
    { id: '1', paymentMethodName: 'Cash' },
    { id: '2', paymentMethodName: 'Online Transfer' },
  ]);

  // States to manage selected payment method details
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState<string | null>(null);

  // Loading state for delete operation
  const isDeleteLoading = false;

  // Handler to remove payment method from the list
  const handleDelete = () => {
    // Filter out the selected payment method
    setData((prev) => prev.filter((item) => item.id !== selectedPaymentMethodId));
    // Close the confirmation dialog
    dialogForDeleteConfirmation.onFalse();
    // Reset selection states
    setSelectedPaymentMethodId(null);
    setSelectedPaymentMethodName(null);
  };
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CustomizableTable
            noDataText={
              <>
                No Payment Method Found
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
                  Add Payment Method
                </Box>
              </>
            }
            isLoading={false}
            tableId="payment-methods"
            columns={[
              {
                id: 'paymentMethodName',
                label: 'Payment Method',
                render(value) {
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
                      showEditIcon
                      showDeleteIcon
                      handleEditClick={() => {
                        setIsEdit(true);
                        setSelectedPaymentMethod(row);
                        editDialog.onTrue();
                      }}
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();
                        setSelectedPaymentMethod(row);
                      }}
                    />
                  );
                },
              },
            ]}
            data={data}
          />
        </Grid>
      </Grid>

      {/* Edit Dialog Placeholder (Implement as needed) */}

      <CustomDialog
        open={editDialog.value}
        handleClose={() => {
          editDialog.onFalse();
          setSelectedPaymentMethod(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isEdit ? 'Update Payment Method' : 'Add Payment Method'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                isEdit
                  ? 'Update existing payment method details'
                  : 'Add a new payment method to the system'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddPaymentMethodDialog
          isEditMode
          onClose={() => {
            editDialog.onFalse();
            setSelectedPaymentMethod(null);
          }}
          data={selectedPaymentMethod}
          onSave={() => {
            editDialog.onFalse();
            setSelectedPaymentMethod(null);
          }}
        />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete{' '}
              <strong>{selectedPaymentMethod?.paymentMethodName}</strong> payment method?
            </>
          }
          action={
            <LoadingButton
              variant="contained"
              loading={isDeleteLoading}
              size="small"
              color="error"
              onClick={handleDelete}
            >
              Yes
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default SetPaymentMethodComponent;
