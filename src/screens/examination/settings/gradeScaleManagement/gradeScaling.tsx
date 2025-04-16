import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
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

const GradingScale = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<IGrade | null>(null);
  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const [grades, setGrades] = useState<IGrade[]>(gradeScalingData);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleCloseDialog = () => {
    setSelectedGrade(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleDelete = (gradeData: IGrade) => {
    if (selectedGrade) {
      setGrades(grades.filter((grade) => grade.id !== gradeData.id));
      deleteConfirmDialog.onFalse();
      setSelectedGrade(null);
    }
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      dialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedGrade(null);
    } else if (!isChanges) {
      dialog.onFalse();
      setSelectedGrade(null);
    }
  };

  const handleSubmit = (values: any) => {};

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Add />}
          onClick={() => {
            dialog.onTrue();
          }}
          size="small"
          variant="contained"
        >
          Grade Scale
        </Button>
      </Box>
      <CustomizableTable
        tableId="gradesTable"
        noDataText={
          <>
            No Grade Scaling Data Found{' '}
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
              Add Grade Scale
            </Box>
          </>
        }
        columns={[
          { id: 'totalMarks', label: 'Total Marks' },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {}}
                  showEditIcon
                  showDeleteIcon
                  handleDeleteClick={() => {
                    setSelectedGrade(row as any);
                    deleteConfirmDialog.onTrue();
                  }}
                  handleEditClick={() => {
                    setSelectedGrade(row as any);
                    setIsEdit(true);
                    dialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={grades}
      />

      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Grade' : 'Add Grade'}
      >
        <GradeForm
          onSubmit={handleSubmit}
          onClose={handleClose}
          data={selectedGrade}
          isEdit={isEdit}
        />{' '}
      </CustomDialog>

      <ConfirmDialog
        open={deleteConfirmDialog.value}
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
              if (selectedGrade) {
                handleDelete(selectedGrade);
              }
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default GradingScale;
