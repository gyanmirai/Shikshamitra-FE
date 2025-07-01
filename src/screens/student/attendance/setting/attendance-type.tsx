import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

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
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

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
      <CustomizableTable
        tableId="attendance-type"
        noDataText={
          <>
            No Leave Type Data Found{' '}
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
              Add Leave Type
            </Box>
          </>
        }
        isLoading={isLoading}
        columns={[
          {
            id: 'type',
            label: 'Type',
            render(value, row) {
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={row.color} />
                  <Typography variant="caption" fontSize="13px">
                    {value}
                  </Typography>
                </Box>
              );
            },
          },

          {
            id: 'action',
            label: 'Actions',
            sticky: true,
            isFilter: false,
            isSort: false,
            minWidth: 60,
            align: 'left',
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
        content={
          <>
            Are you sure you want to delete Leave Type{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {editData?.type}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deleteAttendanceType(editData?.id);
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        open={dialog.value}
        handleClose={handleClose}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Leave Type</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Define Leave types (like Sick or Casual) and choose a distinct color for each. To quickly differentiate them in attendance"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AttendanceTypeForm handleClose={handleClose} editData={editData} />
      </CustomDialog>
    </Box>
  );
};

export default AttendanceType;

export const AttendanceTypeForm = ({
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
      type: Yup.string().required('Leave Type is required'),
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
      <Scrollbar sx={{ p: 2 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Leave Type *"
            name="type"
            value={values.type}
            onChange={handleChange}
            size="small"
            error={!!(errors.type && touched.type)}
            helperText={touched.type && errors.type}
          />
          <ShakingTextField error={touched.color && Boolean(errors.color)}>
            {/* Dynamic Heading */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1 }}
              color={touched.color && errors.color ? 'error.main' : 'text.primary'}
            >
              Leave Type Color
            </Typography>

            {/* Color Picker */}
            <ColorPickerCircle
              onSelect={(color: string) => setFieldValue('color', color)}
              initialColor={values.color}
            />

            {/* Error Message */}
            {touched.color && errors.color && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.color}
              </Typography>
            )}
          </ShakingTextField>
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          color="inherit"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          loading={isUpdateLoading || isLoading}
          variant="contained"
          type="submit"
          size="small"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};
