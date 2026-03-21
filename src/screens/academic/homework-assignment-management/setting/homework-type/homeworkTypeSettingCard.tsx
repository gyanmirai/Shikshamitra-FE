import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { Box, Card, Button, Tooltip, IconButton, Typography } from '@mui/material';

import { AddCategory } from '../addHomworkAssessmentTypeForm';

import type { IHomeworkAssignmentType } from '../type';

const initialHomeworkType: IHomeworkAssignmentType[] = [
  {
    id: 1,
    name: 'Practice',
  },
  {
    id: 2,
    name: 'Reading Material',
  },
  {
    id: 3,
    name: 'Revision',
  },
];
const HomeworkTypeSettingCard = () => {
  // State for managing homework type data - stores array of homework types (Practice, Reading Material, etc.)
  const [homeworkTypeData] = useState(initialHomeworkType);
  // Boolean state to track whether we are in edit mode or create mode
  const [isEdit, setIsEdit] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // Boolean state to control the visibility of homework type dialog
  const homeworkDialog = useBoolean();
  // State for currently selected homework type - stores single homework type object or null when none selected
  const [selectedHomeworkType, setSelectedHomeworkType] = useState<IHomeworkAssignmentType | null>(
    null
  );

  /**
   * Closes all dialogs and resets selected homework/assignment types
   */
  const handleCloseDialog = () => {
    setSelectedHomeworkType(null);
    homeworkDialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      homeworkDialog.onFalse();
      setIsEdit(false);
      setSelectedHomeworkType(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      homeworkDialog.onFalse();
      setIsEdit(false);
      setSelectedHomeworkType(null);
    }
  };

  // Boolean state to control the visibility of delete confirmation dialog
  const deleteConfirmDialog = useBoolean();

  const handleHomeworkSubmit = () => {};
  return (
    <Box>
      <Card sx={{ p: 2, height: '100%' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ typography: 'h6' }}>Homework Types</Box>
          <Tooltip title="Manage Homework Type using Add, Edit or Delete">
            <IconButton size="small">
              <Iconify icon="mdi:information" fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Scrollbar sx={{ mt: 1.5, height: '180px' }}>
          <Box
            component="ul"
            sx={{
              listStyle: 'none',
              padding: 0,
            }}
          >
            {homeworkTypeData.map((category) => (
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
                      setSelectedHomeworkType(category);
                      setIsEdit(true);
                      homeworkDialog.onTrue();
                    }}
                  />
                  <Iconify
                    icon="mdi:delete"
                    sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedHomeworkType(category);
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
            size="small"
            variant="contained"
            onClick={() => {
              homeworkDialog.onTrue();
              setIsEdit(false);
              setSelectedHomeworkType(null);
            }}
          >
            Homework Type
          </Button>
        </Box>
      </Card>
      <CustomDialog
        open={homeworkDialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Homework Type' : 'Add Homework Type'}
      >
        <AddCategory
          onClose={handleClose}
          onSubmit={handleHomeworkSubmit}
          data={selectedHomeworkType}
          isEdit={isEdit}
        />
      </CustomDialog>
    </Box>
  );
};

export default HomeworkTypeSettingCard;
