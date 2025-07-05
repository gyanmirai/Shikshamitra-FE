import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import examTypeTableData from 'src/json/academic/examination/examTypeTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ExamTypeForm from './examTypeForm';

import type { IExamType } from '../type';

const ExamTypeSettings = ({ addExamTypeDialog }: any) => {
  // Dialog state for managing the create/edit exam type form.
  // const dialog = useBoolean();
  // State for storing and managing the exam type table data.
  const [examTypeTable, setExamTypeTable] = useState<IExamType[]>(examTypeTableData);
  // Dialog state for confirming the publish/unpublish status change.
  const confirmPublishDialog = useBoolean();
  // Dialog state for confirming the deletion of an exam type.
  const confirmDeleteDialog = useBoolean();
  // Redux state indicating if there are unsaved changes.
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch function for dispatching actions.
  const dispatch = useDispatch();
  // State for tracking whether the form is in edit mode.
  const [isEdit, setIsEdit] = useState(false);
  // State for storing the currently selected exam type for editing or other actions.
  const [selectedExamType, setSelectedExamType] = useState<any | null>(null);
  // State for storing the pending status change of an exam type before confirmation.
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  // Function to handle changes in the status of an exam type.
  const handleStatusChange = (id: number, value: string) => {
    // Set the pending status change for confirmation.
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    // Open the confirmation dialog for publishing/unpublishing.
    confirmPublishDialog.onTrue();
  };

  // Function to confirm the status change of an exam type.
  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      // Update the exam type table with the new status.
      setExamTypeTable((prevSubject) =>
        prevSubject.map((examType) =>
          examType.id === id ? { ...examType, status: newValue } : examType
        )
      );
    }
    // Close the confirmation dialog.
    confirmPublishDialog.onFalse();
    // Reset the pending status change.
    setPendingStatusChange(null);
  };

  // Function to handle the deletion of an exam type.
  const handleDelete = (comingExamType: any) => {
    // Filter out the deleted exam type from the table data.
    setExamTypeTable((prevData) =>
      prevData.filter((examType) => examType.id !== comingExamType.id)
    );
    confirmDeleteDialog.onFalse();
    shikshaMitraToast.success({
      message: `Exam Type deleted successfully`,
    });
    // Close the dialogs after deletion.
  };

  // Function to handle form submission for creating or editing an exam type.
  const handleSubmit = (values: any) => {
    if (isEdit && selectedExamType) {
      // Update the existing exam type in the table.
      setExamTypeTable(
        examTypeTable.map((examType) => (examType.id === values.id ? values : examType))
      );
    } else {
      // Add the new exam type to the table.
      setExamTypeTable([...examTypeTable, values]);
    }
    // Close the dialog after submission.
    addExamTypeDialog.onFalse();
    // Reset the edit state.
    setIsEdit(false);
    // Clear the selected exam type.
    setSelectedExamType(null);
  };

  // Function to handle closing of the dialog
  const handleClose = (e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
        setIsEdit(false);
        setSelectedExamType(null);
      }, 200); // Adjust this delay based on your dialog's closing animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addExamTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addExamTypeDialog.onFalse();
      resetState();
    }
  };

  return (
    <Box>
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            addExamTypeDialog.onTrue();
          }}
          sx={{
            width: '150px',
          }}
        >
          Exam Type
        </Button>
      </Box> */}
      <CustomizableTable
        tableId="examTypeTable"
        noDataText={
          <>
            No Exam Type Data Found{' '}
            <Box
              onClick={() => {
                addExamTypeDialog.onTrue();
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
              Create Exam Type
            </Box>
          </>
        }
        columns={[
          { id: 'examType', label: 'Exam Type' },
          { id: 'description', label: 'Description' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            align: 'left',
            minWidth: 50,
            sticky: true,
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
                    addExamTypeDialog.onTrue();
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedExamType ? 'Update Exam Type' : 'Add Exam Type'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedExamType
                  ? 'You can update the exam type details including name and other information.'
                  : 'You can create a new exam type by entering the required details.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={addExamTypeDialog.value}
        handleClose={() => {
          addExamTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedExamType(null);
          }, 200); // Adjust the delay if needed to match the dialog's close animation
        }}
      >
        <ExamTypeForm
          onClose={handleClose}
          data={selectedExamType}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
      </CustomDialog>

      <ConfirmDialog
        open={confirmDeleteDialog.value}
        onClose={() => {
          confirmDeleteDialog.onFalse();
          setSelectedExamType(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete exam type <strong>{selectedExamType?.examType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              handleDelete(selectedExamType);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default ExamTypeSettings;
