import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import gradeScalingData from 'src/json/academic/examination/gradeScalingData.json';

import CustomDialog from 'src/components/customDialog';
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

  const handleCloseDialog = () => {
    setSelectedGrade(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleDelete = () => {
    if (selectedGrade) {
      setGrades(grades.filter((grade) => grade.id !== selectedGrade.id));
      deleteConfirmDialog.onFalse();
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
          onClose={dialog.onFalse}
          data={selectedGrade}
          isEdit={isEdit}
        />{' '}
      </CustomDialog>
    </Box>
  );
};

export default GradingScale;
