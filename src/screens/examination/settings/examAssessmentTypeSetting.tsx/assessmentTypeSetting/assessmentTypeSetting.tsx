import React, { useState } from 'react';

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

import assessmentTypeTableData from 'src/json/academic/examination/assessmentTypeTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
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
        handleClose={handleCloseDialog}
      >
        <AssessmentTypeForm data={selectedAssessmentType} onSubmit={handleSubmit} isEdit={isEdit} />
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

      <CustomDialog
        title="Confirm Delete"
        open={confirmDeleteDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Assessment Type?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDeleteDialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedAssessmentType);
            }}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};
export default AssessmentTypeSettings;
