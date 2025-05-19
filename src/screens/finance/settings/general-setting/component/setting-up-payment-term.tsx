import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

const SetPaymentTerm = () => {
  const [newPaymentTerm, setNewPaymentTerm] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<string | null>(null);
  const [selectedPaymentTermName, setSelectedPaymentTermName] = useState<string | null>(null);
  const [data, setData] = useState<{ id: string; paymentTermName: string }[]>([]);
  const dialogForDeleteConfirmation = useBoolean();

  const handleAddOrUpdate = () => {
    if (!newPaymentTerm.trim()) {
      alert('Payment Term name cannot be empty!');
      return;
    }

    const isDuplicate = data.some(
      (item) =>
        item.paymentTermName.toLowerCase() === newPaymentTerm.toLowerCase() &&
        (!isEdit || item.id !== selectedPaymentTermId)
    );

    if (isDuplicate) {
      alert('This payment term already exists!');
      return;
    }

    if (isEdit) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedPaymentTermId ? { ...item, paymentTermName: newPaymentTerm } : item
        )
      );
    } else {
      const newId = `${Date.now()}`;
      setData((prev) => [...prev, { id: newId, paymentTermName: newPaymentTerm }]);
    }

    setNewPaymentTerm('');
    setIsEdit(false);
    setSelectedPaymentTermId(null);
  };

  const handleEdit = (row: any) => {
    setNewPaymentTerm(row.paymentTermName);
    setSelectedPaymentTermId(row.id);
    setIsEdit(true);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== selectedPaymentTermId));
    dialogForDeleteConfirmation.onFalse();
    setSelectedPaymentTermId(null);
    setSelectedPaymentTermName(null);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid item xs={12} md={6}>
        <Box pt="15px" display="flex" alignItems="center" gap={3}>
          <TextField
            autoFocus
            name="newPaymentTerm"
            label="Add New Payment Term"
            size="small"
            value={newPaymentTerm}
            onChange={(e) => setNewPaymentTerm(capitalizeWords(e.target.value))}
          />
          <Button
            startIcon={!isEdit && <Iconify icon="ic:outline-plus" />}
            variant="contained"
            size="small"
            onClick={handleAddOrUpdate}
            disabled={newPaymentTerm.trim() === ''}
          >
            {isEdit ? 'Save' : 'Add New Payment Term'}
          </Button>
        </Box>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomizableTable
            noDataText={<>No Payment Term Found</>}
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
                      handleEditClick={() => handleEdit(value)}
                      handleDeleteClick={() => {
                        setSelectedPaymentTermId(value.id);
                        setSelectedPaymentTermName(
                          value.paymentTermName.charAt(0).toUpperCase() +
                            value.paymentTermName.slice(1).toLowerCase()
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
            setSelectedPaymentTermId(null);
            setSelectedPaymentTermName(null);
          }}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={handleDelete}>
              Delete
            </LoadingButton>
          }
        />
      )}
    </Box>
  );
};

export default SetPaymentTerm;
