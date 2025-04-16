import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button, Tooltip, Typography, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';

import LearningResourceTypeForm from './learningResourceForm';

import type { IResourceType } from '../type';

const dummyResourceTypes: IResourceType[] = [
  { id: 1, name: 'Video Lectures' },
  { id: 2, name: 'PDF Documents' },
  { id: 3, name: 'Assignments' },
  { id: 4, name: 'Quizzes' },
  { id: 5, name: 'Presentations' },
];

const LearningResourceType = () => {
  const [resourceTypeData, setResourceTypeData] = useState<IResourceType[]>(dummyResourceTypes);
  const [selectedResourceType, setSelectedResourceType] = useState<IResourceType | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const resourceDialog = useBoolean();
  const deleteDialog = useBoolean();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      resourceDialog.onFalse();
      setIsEdit(false);
      setSelectedResourceType(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      resourceDialog.onFalse();
      setIsEdit(false);
      setSelectedResourceType(null);
    }
  };
  return (
    <Box>
      <Card sx={{ p: 2, height: '100%' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ typography: 'h6' }}>Resource Types</Box>
          <Tooltip title="Manage Resource Type using Add, Edit or Delete">
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
            {resourceTypeData.map((category) => (
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
                      setSelectedResourceType(category);
                      setIsEdit(true);
                      resourceDialog.onTrue();
                    }}
                  />
                  <Iconify
                    icon="mdi:delete"
                    sx={{ height: '18px', width: '18px', color: 'red', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedResourceType(category);
                      deleteDialog.onTrue();
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
              resourceDialog.onTrue();
              setIsEdit(false);
              setSelectedResourceType(null);
            }}
          >
            Resource Type
          </Button>
        </Box>
      </Card>

      <CustomDialog
        open={resourceDialog.value}
        handleClose={() => {
          resourceDialog.onFalse();
          setSelectedResourceType(null);
          setIsEdit(false);
        }}
        title={isEdit ? 'Update Learning Resource' : 'Add Learning Resource'}
      >
        <LearningResourceTypeForm
          data={selectedResourceType}
          onClose={handleClose}
          isEdit={isEdit}
        />
      </CustomDialog>
    </Box>
  );
};

export default LearningResourceType;
