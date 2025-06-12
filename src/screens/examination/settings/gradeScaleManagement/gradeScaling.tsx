import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import gradeScalingData from 'src/json/academic/examination/gradeScalingData.json';

import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import GradeForm from './gradeScaleForm';

import type { IGrade } from './type';

const GradingScale = ({ addGradeScalingDialog }: any) => {
  // State for tracking edit mode
  const [isEdit, setIsEdit] = useState(false);
  // State for storing currently selected grade
  const [selectedGrade, setSelectedGrade] = useState<IGrade | null>(null);
  // Dialog control for viewing grade details
  const viewDialog = useBoolean();
  // Dialog control for delete confirmation
  const deleteConfirmDialog = useBoolean();
  // State for storing all grades data
  const [grades, setGrades] = useState<IGrade[]>(gradeScalingData);
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handles closing of all dialogs and resetting related states
   */
  const handleCloseDialog = () => {
    setSelectedGrade(null);
    setIsEdit(false);
    addGradeScalingDialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  /**
   * Handles deletion of a grade
   * @param gradeData - Grade object to be deleted
   */
  const handleDelete = (gradeData: IGrade) => {
    if (selectedGrade) {
      setGrades(grades.filter((grade) => grade.id !== gradeData.id));
      deleteConfirmDialog.onFalse();
      setSelectedGrade(null);
    }
  };

  /**
   * Handles closing of grade form dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      viewDialog.onFalse();
      addGradeScalingDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedGrade(null);
    } else if (!isChanges) {
      viewDialog.onFalse();
      addGradeScalingDialog.onFalse();
      setSelectedGrade(null);
    }
  };

  /**
   * Handles form submission
   * @param values - Form values to be processed
   */
  const handleSubmit = (values: any) => {};

  return (
    <Box>
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            addGradeScalingDialog.onTrue();
          }}
          size="small"
          variant="contained"
          sx={{
            width: '150px',
          }}
        >
          Grade Scale
        </Button>
      </Box> */}
      <CustomizableTable
        tableId="gradesTable"
        searchFieldProps={{
          // placeholder: 'Search by Grade Scale Title, Total Marks...',
          label: 'Search by Grade Scale Title, Total Marks...',
          sx: {
            width: '100%',
            maxWidth: '350px',
          },
        }}
        noDataText={
          <>
            No Grade Scaling Data Found{' '}
            <Box
              onClick={() => {
                addGradeScalingDialog.onTrue();
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
              Add Grade Scale
            </Box>
          </>
        }
        columns={[
          { id: 'name', label: 'Grade Scale Title' },
          { id: 'totalMarks', label: 'Total Marks', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            sticky: true,
            minWidth: 90,
            align: 'left',
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    viewDialog.onTrue();
                    setSelectedGrade(row as any);
                  }}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    setSelectedGrade(row as any);
                    deleteConfirmDialog.onTrue();
                  }}
                  handleEditClick={() => {
                    setSelectedGrade(row as any);
                    setIsEdit(true);
                    addGradeScalingDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={grades}
      />

      <CustomDialog
        open={addGradeScalingDialog.value}
        handleClose={() => {
          addGradeScalingDialog.onFalse();
          setSelectedGrade(null);
        }}
        title={selectedGrade ? 'Update Grade Scale' : 'Add Grade Scale'}
      >
        <GradeForm
          onSubmit={handleSubmit}
          onClose={handleClose}
          data={selectedGrade}
          isEdit={isEdit}
          disabled={false}
        />{' '}
      </CustomDialog>

      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedGrade(null);
        }}
        title="View Grade Scale"
      >
        <GradeForm
          onSubmit={handleSubmit}
          onClose={handleClose}
          data={selectedGrade}
          isEdit={isEdit}
          disabled
        />{' '}
      </CustomDialog>

      <ConfirmDialog
        open={deleteConfirmDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure you want to Delete Grade Scaling?"
        action={
          <Button
            variant="contained"
            color="error"
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              if (selectedGrade) {
                handleDelete(selectedGrade);
              }
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default GradingScale;
