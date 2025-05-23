import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

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

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import assessmentTypeTableData from 'src/json/academic/examination/assessmentTypeTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AssessmentTypeForm from './assessmentTypeForm';

import type { IAssessmentType } from '../type';

const AssessmentTypeSettings = () => {
  const dialog = useBoolean();
  const [assessmentTypeData, setAssessmentTypeData] =
    useState<IAssessmentType[]>(assessmentTypeTableData);
  const confirmPublishDialog = useBoolean();
  const confirmDeleteDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<any | null>(null);
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
      setAssessmentTypeData((prevSubject) =>
        prevSubject.map((assessmentType) =>
          assessmentType.id === id ? { ...assessmentType, status: newValue } : assessmentType
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
    setSelectedAssessmentType(null);
  };

  // Function to handle closing of the dialog.
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // If submit button is clicked or there are unsaved changes, show confirmation dialog.
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      dialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedAssessmentType(null);
    } else if (!isChanges) {
      // If no unsaved changes, close the dialog directly.
      dialog.onFalse();
      setSelectedAssessmentType(null);
    }
  };

  const handleDelete = (comingAssessmentType: any) => {
    setAssessmentTypeData((prevData) =>
      prevData.filter((assessmentType) => assessmentType.id !== comingAssessmentType.id)
    );
    handleCloseDialog();
  };

  const handleSubmit = (values: any) => {
    if (isEdit && selectedAssessmentType) {
      setAssessmentTypeData(
        assessmentTypeData.map((assessmentType) =>
          assessmentType.id === values.id ? values : assessmentType
        )
      );
    } else {
      setAssessmentTypeData([...assessmentTypeData, values]);
    }
    dialog.onFalse();
    setIsEdit(false);
    setSelectedAssessmentType(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6">Assessment Type</Typography>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Assessment Type
        </Button>
      </Box>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Assessment Type, Description, Status...',
          label: 'Search by Assessment Type, Description, Status...',
        }}
        tableId="assessment-type"
        noDataText={
          <>
            No Assessment Type Data Found{' '}
            <Box
              onClick={() => {
                dialog.onTrue();
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
              Create Assessment Type
            </Box>
          </>
        }
        columns={[
          { id: 'assessmentType', label: 'Assessment Type' },
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
                    setSelectedAssessmentType(row);
                  }}
                  handleEditClick={() => {
                    dialog.onTrue();
                    setSelectedAssessmentType(row);
                    setIsEdit(true);
                  }}
                />
              );
            },
          },
        ]}
        data={assessmentTypeData}
      />

      <CustomDialog
        title={isEdit ? 'Edit Assessment Type' : 'Create Assessment Type'}
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <AssessmentTypeForm
          onClose={handleClose}
          data={selectedAssessmentType}
          onSubmit={handleSubmit}
          isEdit={isEdit}
        />
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
            this Assessment Type?
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
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(selectedAssessmentType);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};
export default AssessmentTypeSettings;
