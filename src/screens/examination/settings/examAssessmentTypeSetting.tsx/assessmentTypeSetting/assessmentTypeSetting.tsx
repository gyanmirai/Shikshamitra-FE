import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

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
  // Dialog state for managing the create/edit assessment type form
  const dialog = useBoolean();

  // State for storing and managing the assessment type table data
  const [assessmentTypeData, setAssessmentTypeData] =
    useState<IAssessmentType[]>(assessmentTypeTableData);

  // Dialog state for confirming the publish/unpublish status change
  const confirmPublishDialog = useBoolean();

  // Dialog state for confirming the deletion of an assessment type
  const confirmDeleteDialog = useBoolean();

  // Redux state indicating if there are unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // State for tracking whether the form is in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State for storing the currently selected assessment type for editing or other actions
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<any | null>(null);

  // State for storing the pending status change of an assessment type before confirmation
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);

  // Method to handle changes in the status of an assessment type
  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  // Method to confirm the status change of an assessment type
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

  // Method to close all dialogs and reset selected assessment type
  const handleCloseDialog = () => {
    dialog.onFalse();
    confirmPublishDialog.onFalse();
    confirmDeleteDialog.onFalse();
    setSelectedAssessmentType(null);
  };

  // Method to handle closing of the dialog with confirmation for unsaved changes
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      dialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedAssessmentType(null);
    } else if (!isChanges) {
      dialog.onFalse();
      setSelectedAssessmentType(null);
    }
  };

  // Method to handle the deletion of an assessment type
  const handleDelete = (comingAssessmentType: any) => {
    setAssessmentTypeData((prevData) =>
      prevData.filter((assessmentType) => assessmentType.id !== comingAssessmentType.id)
    );
    handleCloseDialog();
  };

  // Method to handle form submission for creating or editing an assessment type
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
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
          sx={{}}
        >
          Assessment Type
        </Button>
      </Box>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Assessment Type, Description, Status...',
          label: 'Search by Assessment Type, Description, Status...',
          sx: {
            maxWidth: '500px',
            width: '100%',
          },
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
              Assessment Type
            </Box>
          </>
        }
        columns={[
          { id: 'assessmentType', label: 'Assessment Type' },
          { id: 'description', label: 'Description' },
          {
            id: 'actions',
            label: 'Action',
            isFilter: false,
            sticky: true,
            minWidth: 90,
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
        title={selectedAssessmentType ? 'Update Assessment Type' : 'Add Assessment Type'}
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
            startIcon={<Iconify icon={GlobalIcons.delete} />}
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
