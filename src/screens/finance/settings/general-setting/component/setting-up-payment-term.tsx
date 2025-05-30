import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddPaymentTermDialog from '../dialogs/finance-add-payment-term-dialog';

const SetPaymentTerm = () => {
  // State to track if we are in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // Dialog state for delete confirmation popup
  const dialogForDeleteConfirmation = useBoolean();

  // Dialog state for edit/add payment term popup
  const editDialog = useBoolean();

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomizableTable
            noDataText={
              <>
                No Payment Term Found
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
                  Add Payment Term
                </Box>
              </>
            }
            isLoading={false}
            tableId="payment-term"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              {
                id: 'paymentTermName',
                label: 'Payment Term',
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
                render(row, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      showEditIcon
                      handleEditClick={() => {
                        setIsEdit(true);
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
          title={`${isEdit ? 'Edit' : 'Add'} Payment Term`}
          maxWidth="sm"
        >
          <AddPaymentTermDialog
            onClose={() => {
              editDialog.onFalse();
            }}
            isEditMode={isEdit}
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
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default SetPaymentTerm;
