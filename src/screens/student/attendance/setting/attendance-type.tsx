'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetStudentAttendanceTypeQuery,
  useAddStudentAttendanceTypeMutation,
  useDeleteStudentAttendanceTypeMutation,
  useUpdateStudentAttendanceTypeMutation,
} from 'src/redux/student/attendance-type/attendance-type-api';

import type { IAttendanceRule } from './type';

const AttendanceType = () => {
  // Dialog state for add/edit form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const confirm = useBoolean();

  // State to store attendance type data being edited
  const [editData, setEditData] = useState<IAttendanceRule | null>(null);
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

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
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dialog?.onFalse();
      resetState();
    } else if (!isChanges) {
      dialog?.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Leave Type"
        description="Define Leave types (like Sick or Casual) and choose a distinct color for each. To quickly differentiate them in attendance"
        links={[
          { name: 'Student', href: '/student/attendance/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Setting' },
          { name: 'Leave Type' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            onClick={dialog.onTrue}
            startIcon={<Iconify icon="eva:plus-fill" />}
            sx={{ textTransform: 'capitalize', width: '160px' }}
          >
            Leave Type
          </Button>
        }
        sx={{ mb: 2 }}
      />
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
              shikshaMitraToast.success({
                message: `${editData?.type} leave type deleted sucessfully`,
              });
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        open={dialog?.value}
        handleClose={() => {
          setEditData(null);
          dialog?.onFalse();
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? `Update Leave Type` : 'Add Leave Type'}
            </Typography>
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
  handleClose: (e: any, isSubmit: boolean) => void;
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

  const {
    initialValues,
    values,
    handleChange,
    setFieldValue,
    handleSubmit,
    errors,
    touched,
    handleBlur,
  } = useFormik({
    initialValues: {
      type: editData?.type || '',
      color: editData?.color || '',
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
          shikshaMitraToast.success({ message: `${value.type} leave type updated sucessfully` });
        } else {
          await addAttendanceType(value);
          shikshaMitraToast.success({ message: `${value.type} leave type created sucessfully` });
        }
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box>
      <BackPopUpChecked initialValues={initialValues} currentValues={values}>
        {/* <Scrollbar sx={{ p: 2 }}> */}
        <DialogScrollContent>
          <Stack spacing={3}>
            <ShakingTextField error={touched.type && Boolean(errors.type)}>
              <TextField
                label="Leave Type *"
                name="type"
                fullWidth
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur} // This was missing!
                size="small"
                error={!!(errors.type && touched.type)}
                helperText={touched.type && errors.type}
              />
            </ShakingTextField>
            <ShakingTextField error={touched.color && Boolean(errors.color)}>
              {/* Dynamic Heading */}
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={touched.color && errors.color ? 'error.main' : 'text.primary'}
              >
                Leave Type Color *
              </Typography>

              {/* Color Picker */}
              <ColorPickerCircle
                onSelect={(color: string) => {
                  setFieldValue('color', color);
                }}
                initialColor={values.color}
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>
        {/* </Scrollbar> */}
      </BackPopUpChecked>
      <DialogActions>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          variant="outlined"
          color="inherit"
          onClick={() => {
            handleClose(null, false);
          }}
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
          onClick={(e: any) => {
            handleSubmit(e);
          }}
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
