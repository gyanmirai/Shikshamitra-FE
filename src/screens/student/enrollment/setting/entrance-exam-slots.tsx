'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { TimePicker, DatePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useGetEntranceExamSlotQuery,
  useAddEntranceExamSlotMutation,
  useUpdateEntranceExamSlotMutation,
  useDeleteEntranceExamSlotMutation,
} from 'src/redux/student/entrance-exam-slot/entrance-exam-slot-api';

import type { ISlot } from './type';

const EntranceExamSlots = () => {
  // Dialog state for opening/closing modal
  // const dialog = useBoolean();
  // Dialog state for confirmation modal
  const confirm = useBoolean();
  // State to store data being edited
  const [editData, setEditData] = useState<ISlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const entranceExamSlotsDialog = useBoolean();

  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch
  const dispatch = useDispatch();
  // Fetch entrance exam slots data
  const { data: slots, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
  });

  // Delete slot mutation hook
  const [deleteSlot, { isLoading: isDeleteSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEntranceExamSlotMutation,
  });

  // Transform slots data to include formatted time strings
  const tableData = slots?.items?.map((item: ISlot) => ({
    ...item,
    startTime: dayjs(item.startDate).format('hh:mm A'),
    creationDate: dayjs(item.creationTime).format('MM-DD-YYYY'),
    endTime: dayjs(item.endDate).format('hh:mm A'),
  }));

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      entranceExamSlotsDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      entranceExamSlotsDialog.onFalse();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Entrance Exam Slots"
        description="Manage entrance exam time slots by configuring student limits, room numbers, and schedules."
        links={[
          { name: 'Student Enrollment', href: '/student/enrollment/dashboard/' },
          { name: 'Settings' },
          { name: 'Entrance Exam Slots' },
        ]}
        sx={{ mb: 2 }}
        action={
          <Button
            sx={{ px: '32px' }}
            startIcon={<Add />}
            onClick={entranceExamSlotsDialog.onTrue}
            variant="contained"
            size="small"
          >
            Slot
          </Button>
        }
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setEditData(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete exam slot{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {editData?.slotName}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteSlotLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deleteSlot(editData?.id);
              confirm.onFalse();
              shikshaMitraToast.success({
                message: `${editData?.slotName} exam slot deleted successfully`,
              });
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      <Box sx={{ maxWidth: '250px', mb: 1 }}>
        <DatePicker
          label="Select Date"
          format="DD-MM-YYYY"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
        />
      </Box>

      <CustomizableTable
        isLoading={isLoading}
        tableId="entrance-exam-slots"
        noDataText={
          <>
            No Entrance Exam Slots Data Found{' '}
            <Box
              onClick={() => {
                entranceExamSlotsDialog.onTrue();
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
              Add Slot
            </Box>
          </>
        }
        columns={[
          { label: 'Slot Name', id: 'slotName' },
          { label: 'Duration', id: 'duration' },
          { label: 'Date', id: 'creationDate' },
          { label: 'Start Time', id: 'startTime', filterType: 'date' },
          { label: 'End Time', id: 'endTime', filterType: 'date' },
          { label: 'Student Limit', id: 'studentLimit', filterType: 'number' },
          { label: 'Room No', id: 'roomNo', filterType: 'number' },
          {
            label: 'Actions',
            id: 'action',
            isSort: false,
            minWidth: 50,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showDeleteIcon
                  showEditIcon
                  showThreeDots={false}
                  handleDeleteClick={() => {
                    setEditData(row as ISlot);
                    confirm.onTrue();
                  }}
                  handleEditClick={() => {
                    entranceExamSlotsDialog.onTrue();
                    setEditData(row as ISlot);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Update Slots' : 'Add Slots'}({selectedDate?.format('DD-MM-YYYY')})
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="This is the Exam Slots section, where you can create slots for the entrance exam by configuring the student limit, room number, and other necessary parameters."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={entranceExamSlotsDialog.value}
        handleClose={() => {
          entranceExamSlotsDialog.onFalse();
          setEditData(null);
        }}
      >
        <SlotsForm handleClose={handleClose} editData={editData} date={selectedDate} />
      </CustomDialog>
    </Box>
  );
};

export default EntranceExamSlots;

export const SlotsForm = ({
  handleClose,
  editData,
  date,
}: {
  handleClose?: (e: any, isSubmit: boolean) => void;
  editData: ISlot | null;
  date: Dayjs | null;
}) => {
  // Hook for adding a new entrance exam slot
  const [addSlot, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEntranceExamSlotMutation,
  });

  // Hook for updating an existing entrance exam slot
  const [updateSlot, { isLoading: isUpdateSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEntranceExamSlotMutation,
  });
  const formik = useFormik({
    initialValues: {
      slotName: editData?.slotName || null,
      startTime: editData?.startDate ? dayjs(editData?.startDate) : null,
      endTime: editData?.endDate ? dayjs(editData?.endDate) : null,
      duration: editData?.duration || null,
      studentLimit: editData?.studentLimit || null,
      roomNo: editData?.roomNo || null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      slotName: Yup.string().required('Slot Name is required'),
      startTime: Yup.date()
        .required('Start Time is required')
        .test('startTime', 'Start time must be before end time', (value, context) => {
          const { endTime } = context.parent;
          if (value && endTime && dayjs(value).isAfter(dayjs(endTime))) {
            return false;
          }
          return true;
        }),

      endTime: Yup.date()
        .required('End Time is required')
        .test('endTime', 'End time must be after start time', (value, context) => {
          const { startTime } = context.parent;
          if (value && startTime && dayjs(value).isBefore(dayjs(startTime))) {
            return false;
          }
          return true;
        })
        .test('durationLimit', 'Duration should not exceed 3 hours', (value, context) => {
          const { startTime } = context.parent;
          if (value && startTime) {
            const diffInMinutes = dayjs(value).diff(dayjs(startTime), 'minute');
            return diffInMinutes <= 180;
          }
          return true; // don't block validation if fields are empty
        }),
      studentLimit: Yup.number()
        .min(1, 'Student Limit must be greater than 0')
        .required('Student Limit is required'),
      roomNo: Yup.string().required('Room No. is required'),
    }),
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          await updateSlot({
            id: editData.id,
            body: {
              slotName: values.slotName,
              startDate: dateConvertor(dayjs(values.startTime, 'hh:mm A').format(dateFormat)),
              endDate: dateConvertor(dayjs(values.endTime, 'hh:mm A').format(dateFormat)),
              studentLimit: values.studentLimit,
              roomNo: values.roomNo,
            },
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.slotName} exam slot updated successfully`,
          });
        } else {
          await addSlot({
            slotName: values.slotName,
            startTime: dateConvertor(dayjs(values.startTime, 'hh:mm A').format(dateFormat)),
            endTime: dateConvertor(dayjs(values.endTime, 'hh:mm A').format(dateFormat)),
            studentLimit: values.studentLimit,
            roomNo: values.roomNo,
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.slotName} exam slot added successfully`,
          });
        }
        handleClose?.(null, true);
      } catch (error) {
        console.error(error);
      }
    },
  });
  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <DialogScrollContent>
          <Stack spacing={3}>
            <ShakingTextField
              error={!!(formik.touched.slotName && formik.errors.slotName) || false}
            >
              <TextField
                name="slotName"
                label="Slot Name *"
                value={formik.values.slotName}
                onChange={(e) => formik.setFieldValue('slotName', e.target.value)}
                onBlur={formik.handleBlur}
                size="small"
                fullWidth
                error={formik.touched.slotName && Boolean(formik.errors.slotName)}
                helperText={
                  formik.touched.slotName && formik.errors.slotName
                    ? String(formik.errors.slotName)
                    : ''
                }
              />
            </ShakingTextField>

            <ShakingTextField
              error={!!(formik.touched.startTime && formik.errors.startTime) || false}
            >
              <TimePicker
                label="Start Time *"
                value={formik.values.startTime}
                format="hh:mm a"
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                onChange={(startTime) => {
                  formik.setFieldValue('startTime', startTime);

                  const { endTime } = formik.values;
                  if (endTime && startTime) {
                    const diffInMinutes = dayjs(endTime).diff(dayjs(startTime), 'minute');
                    formik.setFieldValue('duration', diffInMinutes);
                  }
                }}
                // onChange={(date) => formik.setFieldValue('startTime', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    name: 'startTime',
                    helperText:
                      formik.touched.startTime && formik.errors.startTime
                        ? String(formik.errors.startTime)
                        : undefined,
                    error: !!formik.errors.startTime && formik.touched.startTime,
                  },
                }}
              />
            </ShakingTextField>

            <ShakingTextField error={!!(formik.touched.endTime && formik.errors.endTime) || false}>
              <TimePicker
                label="End Time *"
                format="hh:mm a"
                value={formik.values.endTime}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                onChange={(endTime) => {
                  formik.setFieldValue('endTime', endTime);

                  const { startTime } = formik.values;
                  if (startTime && endTime) {
                    const diffInMinutes = dayjs(endTime).diff(dayjs(startTime), 'minute');
                    formik.setFieldValue('duration', diffInMinutes);
                  }
                }}
                // onChange={(date) => formik.setFieldValue('endTime', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    name: 'endTime',
                    helperText:
                      formik.touched.endTime && formik.errors.endTime
                        ? String(formik.errors.endTime)
                        : undefined,
                    error: !!formik.errors.endTime && formik.touched.endTime,
                  },
                }}
              />
            </ShakingTextField>

            <TextField
              label="Duration (Minutes)"
              value={formik.values.duration || ''}
              size="small"
              fullWidth
              disabled
            />
            <ShakingTextField
              error={!!(formik.touched.studentLimit && formik.errors.studentLimit) || false}
            >
              <TextField
                name="studentLimit"
                label="Student Limit *"
                type="number"
                value={formik.values.studentLimit}
                onChange={(e) => formik.setFieldValue('studentLimit', e.target.value)}
                onBlur={formik.handleBlur}
                size="small"
                fullWidth
                helperText={
                  formik.touched.studentLimit && formik.errors.studentLimit
                    ? String(formik.errors.studentLimit)
                    : ''
                }
                error={formik.touched.studentLimit && Boolean(formik.errors.studentLimit)}
              />
            </ShakingTextField>

            <ShakingTextField error={!!(formik.touched.roomNo && formik.errors.roomNo) || false}>
              <TextField
                name="roomNo"
                label="Room No. *"
                type="number"
                onBlur={formik.handleBlur}
                value={formik.values.roomNo}
                onChange={(e) => formik.setFieldValue('roomNo', e.target.value)}
                size="small"
                fullWidth
                helperText={
                  formik.touched.roomNo && formik.errors.roomNo ? String(formik.errors.roomNo) : ''
                }
                error={formik.touched.roomNo && !!formik.errors.roomNo}
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
            onClick={() => {
              handleClose?.(null, false);
            }}
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isLoading || isUpdateSlotLoading}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
            onClick={(e: any) => {
              formik.handleSubmit(e);
            }}
            type="submit"
          >
            {editData ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </BackPopUpChecked>
    </Box>
  );
};
