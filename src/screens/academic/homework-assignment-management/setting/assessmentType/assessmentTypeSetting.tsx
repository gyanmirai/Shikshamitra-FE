import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Card, Button, Tooltip, IconButton, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

import { AddCategory } from '../addHomworkAssessmentTypeForm';

import type { IHomeworkAssignmentType } from '../type';

const initialAssignmentType: IHomeworkAssignmentType[] = [
  {
    id: 1,
    name: 'Research-Based',
  },
  {
    id: 2,
    name: 'Practical',
  },
  {
    id: 3,
    name: 'Group Work',
  },
];
const AssessmentTypeSetting = () => {
  // State for managing assignment type data - stores array of assignment types (Research-Based, Practical, etc.)
  const [assignmentTypeData, setAssignmentTypeData] = useState(initialAssignmentType);

  // State for currently selected assignment type - stores single assignment type object or null when none selected
  const [selectedAssignmentType, setSelectedAssignmentType] =
    useState<IHomeworkAssignmentType | null>(null);

  // Boolean state to track whether we are in edit mode or create mode
  const [isEdit, setIsEdit] = useState(false);

  // Boolean state to control the visibility of assignment type dialog
  const assignmentDialog = useBoolean();
  // Boolean state to control the visibility of delete confirmation dialog
  const deleteConfirmDialog = useBoolean();

  /**
   * Closes all dialogs and resets selected homework/assignment types
   */
  const handleCloseDialog = () => {
    setSelectedAssignmentType(null);
    assignmentDialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  /**
   * Handles submission of assignment type form
   * If in edit mode, updates existing assignment type
   * If in create mode, adds new assignment type
   * @param values Form values containing assignment type name
   */
  const handleAssignmentSubmit = (values: IHomeworkAssignmentType) => {
    if (isEdit && selectedAssignmentType) {
      setAssignmentTypeData((prevActivities) =>
        prevActivities.map((a) =>
          a.id === selectedAssignmentType.id
            ? {
                ...a,
                name: values.name,
              }
            : a
        )
      );
    } else {
      // Create new activity
      const newCategory: IHomeworkAssignmentType = {
        id: Math.max(...assignmentTypeData.map((a) => a.id)) + 1,
        name: values.name,
      };
      setAssignmentTypeData((prevActivities) => [...prevActivities, newCategory]);
    }
    handleCloseDialog();
  };

  return (
    <Box>
      <Card sx={{ p: 2, height: '100%' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ typography: 'h6' }}>Assignment Types</Box>
          <Tooltip title="Manage Assignment Type using Add, Edit or Delete">
            <IconButton size="small">
              <Iconify icon="mdi:information" fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>{' '}
        <Scrollbar sx={{ mt: 1.5, height: '180px' }}>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              padding: 0,
            }}
          >
            {assignmentTypeData.map((category) => (
              <Box
                key={category.id}
                component="li"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1,
                  m: 0.5,
                  borderRadius: '15px',
                }}
              >
                <Box>
                  <Typography variant="body2">{category.name}</Typography>
                </Box>
                <Box>
                  <Iconify
                    icon="solar:pen-bold"
                    sx={{ height: '18px', width: '18px', mr: 2, cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedAssignmentType(category);
                      setIsEdit(true);
                      assignmentDialog.onTrue();
                    }}
                  />
                  <Iconify
                    icon="mdi:delete"
                    sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedAssignmentType(category);
                      deleteConfirmDialog.onTrue();
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Scrollbar>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            startIcon={<Add />}
            variant="contained"
            size="small"
            onClick={() => {
              assignmentDialog.onTrue();
              setIsEdit(false);
              setSelectedAssignmentType(null);
            }}
          >
            Assignment Type
          </Button>
        </Box>
      </Card>
      <CustomDialog
        open={assignmentDialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Assignment Type' : 'Add Assignment Type'}
      >
        <AddCategory
          onSubmit={handleAssignmentSubmit}
          data={selectedAssignmentType}
          isEdit={isEdit}
        />
      </CustomDialog>
    </Box>
  );
};

export default AssessmentTypeSetting;
