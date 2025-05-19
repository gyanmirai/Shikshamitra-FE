import React, { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Button, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import capitalizeWords from 'src/utils/capitalizeText';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

const SetLateFeeTypeMethod = () => {
  const [newLateFeeType, setNewLateFeeType] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [selectedLateFeeTypeId, setSelectedLateFeeTypeId] = useState<string | null>(null);
  const [selectedLateFeeTypeName, setSelectedLateFeeTypeName] = useState<string | null>(null);
  const [data, setData] = useState<{ id: string; lateFeeTypeName: string }[]>([]);
  const dialogForDeleteConfirmation = useBoolean();

  const handleAddOrUpdate = () => {
    if (!newLateFeeType.trim()) {
      alert('Late Fee Type name cannot be empty!');
      return;
    }

    const isDuplicate = data.some(
      (item) =>
        item.lateFeeTypeName.toLowerCase() === newLateFeeType.toLowerCase() &&
        (!isEdit || item.id !== selectedLateFeeTypeId)
    );

    if (isDuplicate) {
      alert('This late fee type already exists!');
      return;
    }

    if (isEdit) {
      setData((prev) =>
        prev.map((item) =>
          item.id === selectedLateFeeTypeId ? { ...item, lateFeeTypeName: newLateFeeType } : item
        )
      );
    } else {
      const newId = `${Date.now()}`;
      setData((prev) => [...prev, { id: newId, lateFeeTypeName: newLateFeeType }]);
    }

    setNewLateFeeType('');
    setIsEdit(false);
    setSelectedLateFeeTypeId(null);
  };

  const handleEdit = (row: any) => {
    setNewLateFeeType(row.lateFeeTypeName);
    setSelectedLateFeeTypeId(row.id);
    setIsEdit(true);
  };

  const handleDelete = () => {
    setData((prev) => prev.filter((item) => item.id !== selectedLateFeeTypeId));
    dialogForDeleteConfirmation.onFalse();
    setSelectedLateFeeTypeId(null);
    setSelectedLateFeeTypeName(null);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid item xs={12} md={6}>
        <Box pt="15px" display="flex" alignItems="center" gap={3}>
          <TextField
            autoFocus
            name="newLateFeeType"
            label="Add New Late Fee Type"
            size="small"
            value={newLateFeeType}
            onChange={(e) => setNewLateFeeType(capitalizeWords(e.target.value))}
          />
          <Button
            startIcon={!isEdit && <Iconify icon="ic:outline-plus" />}
            variant="contained"
            size="small"
            onClick={handleAddOrUpdate}
            disabled={newLateFeeType.trim() === ''}
          >
            {isEdit ? 'Save' : 'Add New Late Fee Type'}
          </Button>
        </Box>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomizableTable
            noDataText={<>No Late Fee Type Found</>}
            isLoading={false}
            tableId="late-fee-type"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              {
                id: 'lateFeeTypeName',
                label: 'Late Fee Type',
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
                        setSelectedLateFeeTypeId(value.id);
                        setSelectedLateFeeTypeName(
                          value.lateFeeTypeName.charAt(0).toUpperCase() +
                            value.lateFeeTypeName.slice(1).toLowerCase()
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
            setSelectedLateFeeTypeId(null);
            setSelectedLateFeeTypeName(null);
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

export default SetLateFeeTypeMethod;
