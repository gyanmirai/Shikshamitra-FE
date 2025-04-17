import React, { useState } from 'react';

import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

const SetPaymentMethodComponent = () => {
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [selectedPaymentMethodName, setSelectedPaymentMethodName] = useState<string | null>(null);
  const [data, setData] = useState<{ id: string; paymentMethodName: string }[]>([]);
  const dialogForDeleteConfirmation = useBoolean();

  const handleAddOrUpdate = () => {
    if (!newPaymentMethod.trim()) {
      alert('Payment Method name cannot be empty!');
      return;
    }

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
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPaymentMethodId
            ? { ...item, paymentMethodName: newPaymentMethod }
            : item
        )
      );
    } else {
      const newId = `${Date.now()}`;
      setData((prev) => [...prev, { id: newId, paymentMethodName: newPaymentMethod }]);
    }

    setNewPaymentMethod('');
    setIsEdit(false);
    setSelectedPaymentMethodId(null);
  };

  const handleEdit = (row: any) => {
    setNewPaymentMethod(row.paymentMethodName);
    setSelectedPaymentMethodId(row.id);
    setIsEdit(true);
  };

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
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedPaymentMethodId(null);
            setSelectedPaymentMethodName(null);
          }}
          onConfirm={handleDelete}
          title="Delete Payment Method"
          description={
            <>
              Are you sure you want to delete{' '}
              <strong>{`${selectedPaymentMethodName} Payment Method`}</strong>? This action cannot
              be undone.
            </>
          }
        />
      )}
    </Box>
  );
};

export default SetPaymentMethodComponent;
