import React, { useState } from 'react';

import {
  Box,
  Button,
  Switch,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import examTypeTableData from 'src/json/academic/examination/examTypeTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ExamTypeForm from './examTypeForm';

import type { IExamType } from '../type';

const ExamTypeSettings = () => {
  const dialog = useBoolean();
  const [examTypeTable, setExamTypeTable] = useState<IExamType[]>(examTypeTableData);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<any | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setExamTypeTable((prevSubject) =>
        prevSubject.map((examType) =>
          examType.id === id ? { ...examType, status: newValue } : examType
        )
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedExamType(null);
  };

  const handleDelete = (comingExamType: any) => {
    setExamTypeTable((prevData) =>
      prevData.filter((examType) => examType.id !== comingExamType.id)
    );
    handleCloseDialog();
  };

  const handleSubmit = (values: any) => {
    if (isEdit && selectedExamType) {
      setExamTypeTable(
        examTypeTable.map((examType) => (examType.id === values.id ? values : examType))
      );
    } else {
      setExamTypeTable([...examTypeTable, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedExamType(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Exam Type</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Exam Type
        </Button>
      </Box>
      <CustomizableTable
        tableId="examTypeTable"
        columns={[
          { id: 'examType', label: 'Exam Type' },
          { id: 'description', label: 'Description' },
          {
            id: 'status',
            label: 'Publish',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value as string)}
                />
              </Box>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                  showThreeDots={false}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    confirmDeleteDialog.onTrue();
                    setSelectedExamType(row);
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setSelectedExamType(row);
                    setIsEdit(true);
                  }}
                />
              );
            },
          },
        ]}
        data={examTypeTable}
      />

      <CustomDialog
        title={isEdit ? 'Edit Exam Type' : 'Create Exam Type'}
        open={dialog.value}
        handleClose={handleCloseDialog}
      >
        <ExamTypeForm data={selectedExamType} onSubmit={handleSubmit} isEdit={isEdit} />
      </CustomDialog>

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Exam Type?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <ConfirmDialog
        open={confirmDeleteDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(selectedExamType);
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default ExamTypeSettings;
