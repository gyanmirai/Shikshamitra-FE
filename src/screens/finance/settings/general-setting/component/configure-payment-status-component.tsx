import React, { useState } from 'react';

import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetpaymentOptionQuery,
  useAddpaymentOptionMutation,
  useUpdatepaymentOptionMutation,
  useDeletepaymentOptionMutation,
} from 'src/redux/paymentStatusOption/paymentStatusOptionApi';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

const ConfigurePaymentStatusComponent = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [paymentStatus, setpaymentStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<any>(null);
  const dialogForDeleteConfirmation = useBoolean();

  const { data: paymentStatusList, isLoading: ispaymentStatusLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetpaymentOptionQuery,
  });

  const [addPaymentStatus] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddpaymentOptionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Payment Status added Successfully',
    },
  });

  const [updatePaymentStatus, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatepaymentOptionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Payment Status Update Successfully',
    },
  });

  const [deletePaymentStatus, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeletepaymentOptionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Payment status Delete Successfully',
    },
  });

  const handleAddPaymentStatus = async () => {
    if (isEdit) {
      console.log('paymentStatus', selectedPaymentStatus);
      if (!paymentStatus.trim()) {
        alert('Payment status cannot be empty!');
        return;
      }

      const isDuplicate = paymentStatusList?.items?.some(
        (item: any) => item.paymentStatusOptionName.toLowerCase() === paymentStatus.toLowerCase()
      );

      if (isDuplicate) {
        alert('This Payment status already exists!');
        return;
      }

      try {
        await updatePaymentStatus({
          id: selectedPaymentStatus.id,
          body: {
            paymentStatusOptionName: paymentStatus,
          },
        }).unwrap();
        setpaymentStatus('');
        setIsEdit(false);
      } catch (error) {
        console.error('Failed to update Payment status:', error);
      }
    } else {
      if (!paymentStatus.trim()) {
        alert('Payment status cannot be empty!');
        return;
      }

      const isDuplicate = paymentStatusList?.items?.some(
        (item: any) => item.paymentStatusOptionName.toLowerCase() === paymentStatus.toLowerCase()
      );

      if (isDuplicate) {
        alert('This Payment staus already exists!');
        return;
      }

      try {
        await addPaymentStatus({ paymentStatusOptionName: paymentStatus }).unwrap();
        setpaymentStatus('');
      } catch (error) {
        console.error('Failed to add Payment status:', error);
      }
    }
  };

  const handleEditClick = (data: any) => {
    console.log('data for Edit', data);
    setIsEdit(true);
    setpaymentStatus(data.paymentStatusOptionName);
    setSelectedPaymentStatus(data);
  };

  const handleDeletePaymentStatus = async () => {
    if (!selectedPaymentStatus) return;

    try {
      await deletePaymentStatus(selectedPaymentStatus.id).unwrap();
      dialogForDeleteConfirmation.onFalse();
    } catch (error) {
      console.error('Failed to delete Payment status:', error);
    }
  };

  return (
    <Box py="20px" display="flex" flexDirection="column" gap={3}>
      <Grid container spacing={2}>
        <Box px="15px" display="flex" flexDirection="row" gap={1} alignItems="center">
          <TextField
            name="Add new status"
            label="Add New Status"
            size="small"
            value={paymentStatus}
            onChange={(e) => setpaymentStatus(capitalizeWords(e.target.value))}
          />
          {isEdit ? (
            <Button
              onClick={handleAddPaymentStatus}
              variant="contained"
              size="small"
              disabled={isUpdateLoading || paymentStatus.trim() === ''}
            >
              {isUpdateLoading ? 'Updating...' : ' Save'}
            </Button>
          ) : (
            <Button
              onClick={handleAddPaymentStatus}
              disabled={ispaymentStatusLoading || paymentStatus.trim() === ''}
              startIcon={<Iconify icon="ic:outline-plus" />}
              variant="contained"
              size="small"
            >
              {ispaymentStatusLoading ? 'Adding...' : ' Payment Status'}
            </Button>
          )}
        </Box>
        <Grid item xs={12} md={12}>
          <CustomizableTable
            isLoading={ispaymentStatusLoading}
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
                render(row: any, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        setSelectedPaymentStatus({
                          ...value,
                          paymentStatusOptionName: value.paymentStatusOptionName
                            ? value.paymentStatusOptionName.charAt(0).toUpperCase() +
                              value.paymentStatusOptionName.slice(1).toLowerCase()
                            : '',
                        });

                        dialogForDeleteConfirmation.onTrue();
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        handleEditClick(value);
                      }}
                    />
                  );
                },
              },
            ]}
            data={paymentStatusList?.items || []}
          />
        </Grid>
      </Grid>

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedPaymentStatus(null);
          }}
          onConfirm={handleDeletePaymentStatus}
          title="Delete Item"
          description={
            <>
              Are you sure you want to delete{' '}
              <strong>{`${selectedPaymentStatus.paymentStatusOptionName} Payment status`}</strong> ?
              This action cannot be undone.
            </>
          }
          isDeleteLoading={isDeleteLoading}
        />
      )}
    </Box>
  );
};

export default ConfigurePaymentStatusComponent;
