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

import AddPaymentTermDialog from '../dialogs/finance-add-payment-term-dialog';

const SetPaymentTerm = () => {
  // State to track if we are in edit mode
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

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
                      showEditIcon
                      handleEditClick={() => {
                        setSelectedEntry(row);
                        setIsEdit(true);
                        editDialog.onTrue();
                      }}
                      handleDeleteClick={() => {
                        setSelectedEntry(row);
                        dialogForDeleteConfirmation.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={[
              {
                id: 1,
                paymentTermName: 'Monthly',
              },
              {
                id: 2,
                paymentTermName: 'Quarterly',
              },
              {
                id: 3,
                paymentTermName: 'Semi-Annual',
              },
              {
                id: 4,
                paymentTermName: 'Annual',
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
              {isEdit ? 'Update Payment Term' : 'Add Payment Term'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title={
                isEdit
                  ? 'Modify existing payment term name.'
                  : 'Add payment term by entering a name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddPaymentTermDialog
          onClose={() => {
            editDialog.onFalse();
          }}
          isEditMode={isEdit}
          data={selectedEntry}
          onSave={() => {
            editDialog.onFalse();
          }}
        />
      </CustomDialog>

      <ConfirmDialog
        open={dialogForDeleteConfirmation.value}
        onClose={() => {
          dialogForDeleteConfirmation.onFalse();
          setSelectedEntry(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete the payment term{' '}
            <strong>{selectedEntry?.paymentTermName}</strong>? .
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            size="small"
            loading={false}
            color="error"
            onClick={() => {}}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default SetPaymentTerm;
