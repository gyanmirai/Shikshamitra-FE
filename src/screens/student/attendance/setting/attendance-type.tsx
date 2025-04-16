import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { MuiColorInput } from 'mui-color-input';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Box, Stack, Button, Tooltip, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetStudentAttendanceTypeQuery,
  useAddStudentAttendanceTypeMutation,
  useDeleteStudentAttendanceTypeMutation,
  useUpdateStudentAttendanceTypeMutation,
} from 'src/redux/student/attendance-type/attendance-type-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAttendanceRule } from './type';

const AttendanceType = () => {
  // Dialog state for add/edit form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();

  // State to store attendance type data being edited
  const [editData, setEditData] = useState<IAttendanceRule | null>(null);

  // Fetch all attendance types
  const { data: attendanceTypes, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAttendanceTypeQuery,
  });

  // Mutation hook for deleting attendance type
  const [deleteAttendanceType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteStudentAttendanceTypeMutation,
  });

  // Close dialog and reset edit data
  const handleClose = () => {
    dialog.onFalse();
    setEditData(null);
  };
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
        <Button startIcon={<Add />} onClick={dialog.onTrue} variant="contained" size="small">
          Attendance Type
        </Button>
      </Box>
      <CustomizableTable
        tableId="attendance-type"
        searchFieldProps={{
          placeholder: 'Search by Type, Color...',
          label: 'Search by Type, Color...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        isLoading={isLoading}
        columns={[
          { id: 'type', label: 'Type' },
          {
            id: 'color',
            label: 'Color',
            isSort: false,
            render(value, row) {
              return (
                <Box
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: value,
                  }}
                />
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            sticky: true,
            isFilter: false,
            isSort: false,
            minWidth: 130,
            render: (value, row) => (
              <ThreeDotsActions
                showThreeDots={false}
                showEditIcon
                showDeleteIcon
                handleEditClick={() => {
                  dialog.onTrue();
                  setEditData(row as IAttendanceRule);
                }}
                handleDeleteClick={() => {
                  confirm.onTrue();
                  setEditData(row as IAttendanceRule);
                }}
              />
            ),
          },
        ]}
        data={attendanceTypes?.items || []}
      />{' '}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              await deleteAttendanceType(editData?.id);
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">Attendance Type</Typography>
            <Tooltip
              arrow
              placement="right"
              title="You can add different attendance types (e.g., Sick, Casual, etc.) and assign a specific color to each for better visibility."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <AttendanceTypeForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default AttendanceType;

const AttendanceTypeForm = ({
  handleClose,
  editData,
}: {
  handleClose: () => void;
  editData?: IAttendanceRule | null;
}) => {
  // Mutation hook for updating attendance type with loading state
  const [updateAttendanceType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentAttendanceTypeMutation,
  });

  // Mutation hook for adding new attendance type with loading state
  const [addAttendanceType, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentAttendanceTypeMutation,
  });

  const { values, handleChange, setFieldValue, handleSubmit, errors, touched } = useFormik({
    initialValues: {
      type: editData?.type || '',
      color: editData?.color || 'white',
    },
    validationSchema: Yup.object({
      type: Yup.string().required('Type is required'),
      color: Yup.string().required('Color is required'),
    }),
    onSubmit: async (value) => {
      try {
        if (editData) {
          await updateAttendanceType({
            id: editData.id,
            body: value,
          });
        } else {
          await addAttendanceType(value);
        }
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Type"
            name="type"
            value={values.type}
            onChange={handleChange}
            size="small"
            error={!!(errors.type && touched.type)}
            helperText={touched.type && errors.type}
          />
          <MuiColorInput
            format="hex"
            value={values.color}
            onChange={(color) => setFieldValue('color', color)}
            fullWidth
            placeholder="color"
            label="Background Color"
            size="small"
            error={!!(errors.color && touched.color)}
            helperText={touched.color && errors.color}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <LoadingButton loading={isUpdateLoading || isLoading} variant="contained" type="submit">
          Save
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
