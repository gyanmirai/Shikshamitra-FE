import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
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
        <Grid item xs={12}>
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
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              {
                id: 'paymentMethodName',
                label: 'Existing Payment Method',
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
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'center',
                minWidth: 100,
                render(row) {
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
      {editDialog.value && (
        <CustomDialog
          open={editDialog.value}
          handleClose={() => {
            editDialog.onFalse();
            setSelectedPaymentMethod(null);
          }}
          title={isEdit ? 'Edit Payment Method' : 'Add Payment Method'}
          maxWidth="sm"
        >
          {/* Replace with actual Edit Form */}
          <AddPaymentMethodDialog
            onClose={() => {
              editDialog.onFalse();
            }}
            isEditMode={false}
            data={null}
            onSave={() => {
              editDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}

      {/* Delete Confirmation Dialog */}
      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Payment Method"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton
              variant="contained"
              loading={isDeleteLoading}
              color="error"
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default SetPaymentMethodComponent;
