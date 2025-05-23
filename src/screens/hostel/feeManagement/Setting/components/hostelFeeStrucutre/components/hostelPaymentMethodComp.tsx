import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

const HostelPaymentMethodComponent = (props: TabComponentType) => {
  // State to manage the new payment method input
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);
  // State to store the ID of the payment method being edited
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  // State to store the name of the payment method being deleted
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState<string | null>(null);
  // State to store all payment methods
  const [data, setData] = useState<{ id: string; paymentMethodName: string }[]>([]);
  // Hook to manage delete confirmation dialog visibility
  const dialogForDeleteConfirmation = useBoolean();

  // Handler for adding new payment method or updating existing one
  const handleAddOrUpdate = () => {
    // Validate empty input
    if (!newPaymentMethod.trim()) {
      alert('Payment Method name cannot be empty!');
      return;
    }

    // Check for duplicate payment methods
    const isDuplicate = data.some(
      (item) =>
        item.paymentMethodName.toLowerCase() === newPaymentMethod.toLowerCase() &&
        (!isEdit || item.id !== selectedPaymentMethodId)
    );

    if (isDuplicate) {
      alert('This payment method already exists!');
      return;
    }

    if (isEdit) {
      // Update existing payment method
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPaymentMethodId
            ? { ...item, paymentMethodName: newPaymentMethod }
            : item
        )
      );
    } else {
      // Add new payment method with timestamp as ID
      const newId = `${Date.now()}`;
      setData((prev) => [...prev, { id: newId, paymentMethodName: newPaymentMethod }]);
    }

    // Reset form state after operation
    setNewPaymentMethod('');
    setIsEdit(false);
    setSelectedPaymentMethodId(null);
  };

  // Handler for editing payment method
  const handleEdit = (row: any) => {
    setNewPaymentMethod(row.paymentMethodName);
    setSelectedPaymentMethodId(row.id);
    setIsEdit(true);
  };

  // Handler for deleting payment method
  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== selectedPaymentMethodId));
    dialogForDeleteConfirmation.onFalse();
    setSelectedPaymentMethodId(null);
    setSelectedPaymentMethodName(null);
  };
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid item xs={12} md={6}>
        <Box pt="15px" display="flex" alignItems="center" gap={3}>
          <TextField
            autoFocus
            name="newPaymentMethod"
            label="Add New Payment Method"
            size="small"
            value={newPaymentMethod}
            onChange={(e) => setNewPaymentMethod(capitalizeWords(e.target.value))}
          />
          <Button
            startIcon={!isEdit && <Iconify icon="ic:outline-plus" />}
            variant="contained"
            size="small"
            onClick={handleAddOrUpdate}
            disabled={newPaymentMethod.trim() === ''}
          >
            {isEdit ? 'Save' : 'Add New Payment Method'}
          </Button>
        </Box>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomizableTable
            noDataText={<>No Payment Method Found</>}
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
                minWidth: 50,
                render(row, value) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      showDeleteIcon
                      showEditIcon
                      handleEditClick={() => handleEdit(value)}
                      handleDeleteClick={() => {
                        setSelectedPaymentMethodId(value.id);
                        setSelectedPaymentMethodName(
                          value.paymentMethodName.charAt(0).toUpperCase() +
                            value.paymentMethodName.slice(1).toLowerCase()
                        );
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

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedPaymentMethodId(null);
            setSelectedPaymentMethodName(null);
          }}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={handleDelete}>
              Yes
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default HostelPaymentMethodComponent;
