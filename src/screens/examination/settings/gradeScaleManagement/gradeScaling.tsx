import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import gradeScalingData from 'src/json/academic/examination/gradeScalingData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
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
      shikshaMitraToast.success({
        message: `Grade Scale : ${selectedGrade.name} delete successfully`,
      });
    }
  };

  /**
   * Handles closing of grade form dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedGrade(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust this if your dialog animation is different
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      viewDialog.onFalse();
      addGradeScalingDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      viewDialog.onFalse();
      addGradeScalingDialog.onFalse();
      setTimeout(() => {
        setSelectedGrade(null);
      }, 200);
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
            minWidth: 50,
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
        maxWidth="sm"
        open={addGradeScalingDialog.value}
        handleClose={() => {
          addGradeScalingDialog.onFalse();
          setTimeout(() => {
            setSelectedGrade(null);
          }, 200); // Adjust this delay if your dialog animation takes more/less time
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedGrade ? 'Update Grade Scale' : 'Add Grade Scale'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedGrade
                  ? 'You can update the grade scale details including grade ranges, total marks and other grading parameters.'
                  : 'You can create a new grade scale by defining grade ranges, total marks and other grading parameters.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
        maxWidth="sm"
        handleClose={() => {
          viewDialog.onFalse();
          setTimeout(() => {
            setSelectedGrade(null);
          }, 200); // Match dialog close animation duration
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Grade Scale</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="View grade scales, grade ranges, total marks, and related grading criteria"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
        content={
          <>
            Are you sure you want to Delete Grade Scaling <strong>{selectedGrade?.name}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
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
