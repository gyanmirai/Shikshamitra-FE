import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddPaymentStatusDialog from '../dialogs/finance-add-payment-status-dialog';

const ConfigurePaymentStatusComponent = () => {
  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();
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
                No Payment Status Found
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
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              {
                id: 'paymentStatusOptionName',
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
                label: 'Action',
                isFilter: false,
                isSort: false,
                sticky: true,
                align: 'center',
                minWidth: 100,
                render(_, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        editDialog.onTrue();
                        setIsEdit(true);
                      }}
                    />
                  );
                },
              },
            ]}
            data={[]}
          />
        </Grid>
      </Grid>
      {editDialog.value && (
        <CustomDialog
          open={editDialog.value}
          handleClose={() => {
            editDialog.onFalse();
          }}
          title={isEdit ? 'Edit Payment Status' : 'Add Payment Status'}
          maxWidth="md"
        >
          <AddPaymentStatusDialog
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

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default ConfigurePaymentStatusComponent;
