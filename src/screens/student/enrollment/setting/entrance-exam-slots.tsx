'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import { Iconify } from 'src/components/iconify/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetRoomsQuery } from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { TimePicker, DatePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';
import {
  EntranceExamSlotApi,
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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const entranceExamSlotsDialog = useBoolean();

  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // Redux dispatch
  const dispatch = useDispatch();

  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
  // Fetch entrance exam slots data
  const {
    data: slots,
    isLoading,
    refetch,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEntranceExamSlotQuery,
    params: {
      academicYearId: currentYear?.id,
      startDate: dateConvertor(selectedDate?.format(dateFormat) || '', true),
      endDate: dateConvertor(selectedDate?.format(dateFormat) || '', true),
      ...query,
    },
    options: {
      skip: !(currentYear?.id && selectedDate),
    },
  });

  // Delete slot mutation hook
  const [deleteSlot, { isLoading: isDeleteSlotLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEntranceExamSlotMutation,
  });

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  // Transform slots data to include formatted time strings
  const tableData = slots?.items?.map((item: ISlot) => ({
    ...item,
    startTime: dayjs(item.startDateTime).format('hh:mm A'),
    creationDate: dayjs(item.creationTime).format('MM-DD-YYYY'),
    endTime: dayjs(item.endDateTime).format('hh:mm A'),
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

  const columns: IColumn[] = useMemo(
    () => [
      { label: 'Slot Name', id: 'slotName', sticky: true, minWidth: '12vw', align: 'left' },
      { label: 'Duration', id: 'duration' },
      // { label: 'Date', id: 'creationDate' },
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Entrance Exam Slots"
        description="Manage entrance exam time slots by configuring student limits, room numbers, and schedules."
        links={[
          { name: 'Student Enrollment', href: '/student/dashboard/' },
          { name: 'Settings', href: '/student/dashboard/' },
          { name: 'Entrance Exam Slots' },
        ]}
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
              confirmWithUndo({
                item: editData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    EntranceExamSlotApi.util.updateQueryData(
                      'getEntranceExamSlot',
                      {
                        academicYearId: currentYear?.id,
                        startDate: dateConvertor(selectedDate?.format(dateFormat) || '', true),
                        endDate: dateConvertor(selectedDate?.format(dateFormat) || '', true),
                        ...query,
                      },
                      (draft: any) => {
                        const index = draft?.items?.findIndex(
                          (slot: any) => slot.id === editData?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1 && draft?.items) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deleteSlot(editData?.id),
              });
              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <Card sx={{ p: 1, mb: 1 }}>
        <Box sx={{ maxWidth: '250px' }}>
          <DatePicker
            label="Select Date"
            format="DD-MM-YYYY"
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Box>
      </Card>

      <CustomizableTable
        tableTitle="Entrance Exam Slots"
        isLoading={isLoading || isFetching}
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
        columns={columns}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
        data={tableData || []}
      />
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Update Slots' : 'Add Slot'}({selectedDate?.format('DD-MM-YYYY')})
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

// ---------------------------------------------------------------------------
// Room option shape derived from the API response
// ---------------------------------------------------------------------------
interface IRoomOption {
  id: string;
  roomName: string;
  buildingName: string;
  floorName: string;
  capacity: number;
  /** Label shown in the dropdown */
  label: string;
  /** Group header for Autocomplete groupBy */
  group: string;
}

export const SlotsForm = ({
  handleClose,
  editData,
  date,
}: {
  handleClose?: (e: any, isSubmit: boolean) => void;
  editData: ISlot | null;
  date: Dayjs | null;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // ------ Room API integration ------
  const { data: roomsData, isLoading: isRoomsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoomsQuery,
  });

  // Flatten API response into typed option objects
  const roomOptions: IRoomOption[] = useMemo(
    () =>
      (roomsData?.items ?? []).map((room: any) => ({
        id: room.id,
        roomName: room.roomName ?? '',
        buildingName: room.buildingName ?? '',
        floorName: room.floorName ?? '',
        capacity: room.capacity ?? 0,
        label: `${room.buildingName ?? ''} › ${room.floorName ?? ''} › ${room.roomName ?? ''}`,
        group: `${room.buildingName ?? 'Unknown Building'} › ${room.floorName ?? 'Unknown Floor'}`,
      })),
    [roomsData]
  );

  // Single room selection state
  const [selectedRoom, setSelectedRoom] = useState<IRoomOption | null>(null);

  // Hydrate cascading state in edit mode once data is available
  useEffect(() => {
    if ((editData?.roomNo || editData?.roomId) && roomOptions.length > 0 && !selectedRoom) {
      const match = roomOptions.find((r) => {
        const optionDigits = String(r.roomName).replace(/\D/g, '');
        const editDigits = String(editData.roomNo || '').replace(/\D/g, '');
        return (
          r.id === editData.roomId ||
          (!!optionDigits && !!editDigits && optionDigits === editDigits) ||
          r.id === editData.roomNo
        );
      });
      if (match) {
        setSelectedRoom(match);
        formik.setFieldValue('roomId', match.id);
        formik.setFieldValue('roomNo', match.roomName);
      }
    }
    // Reset when dialog closes
    if (!editData) {
      setSelectedRoom(null);
      formik.setFieldValue('roomId', '');
      formik.setFieldValue('roomNo', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, roomOptions]);

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
      slotName: editData?.slotName || '',
      startDateTime: editData?.startDateTime ? dayjs(editData?.startDateTime) : null,
      endDateTime: editData?.endDateTime ? dayjs(editData?.endDateTime) : null,
      duration: editData?.duration || '',
      studentLimit: editData?.studentLimit || '',
      roomId: editData?.roomId || '',
      roomNo: editData?.roomNo || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      slotName: Yup.string().trim('Slot Name is required').required('Slot Name is required'),
      startDateTime: Yup.date()
        .required('Start Time is required')
        .test('startDateTime', 'Start time must be before end time', (value, context) => {
          const { endDateTime } = context.parent;
          if (value && endDateTime && dayjs(value).isAfter(dayjs(endDateTime))) {
            return false;
          }
          return true;
        }),

      endDateTime: Yup.date()
        .required('End Time is required')
        .test('endDateTime', 'End time must be after start time', (value, context) => {
          const { startDateTime } = context.parent;
          if (value && startDateTime && dayjs(value).isBefore(dayjs(startDateTime))) {
            return false;
          }
          return true;
        })
        .test('durationLimit', 'Duration should not exceed 3 hours', (value, context) => {
          const { startDateTime } = context.parent;
          if (value && startDateTime) {
            const diffInMinutes = dayjs(value).diff(dayjs(startDateTime), 'minute');
            return diffInMinutes <= 180;
          }
          return true; // don't block validation if fields are empty
        }),
      studentLimit: Yup.number()
        .min(1, 'Student Limit must be greater than 0')
        .required('Student Limit is required'),
      roomId: Yup.string().required('Room is required'),
    }),
    onSubmit: async (values, formikHelpers) => {
      const newDate = date?.format('DD/MM/YYYY');
      const newStartTime = values.startDateTime ? values.startDateTime.format('HH:mm:ss') : null;
      const newEndTime = values.endDateTime ? values.endDateTime.format('HH:mm:ss') : null;

      // Extract numeric room number from selection
      const roomNoString = String(values.roomNo || '').replace(/\D/g, '');
      const parsedRoomNo = roomNoString ? parseInt(roomNoString, 10) : 0;

      try {
        if (editData) {
          await updateSlot({
            id: editData.id,
            body: {
              academicYearId: currentYear?.id,
              slotName: values.slotName,
              startDateTime:
                values.startDateTime && date
                  ? dateConvertor(
                      dayjs(`${newDate} ${newStartTime}`, 'DD/MM/YYYY HH:mm:ss').format(dateFormat)
                    )
                  : null,
              endDateTime:
                values.endDateTime && date
                  ? dateConvertor(
                      dayjs(`${newDate} ${newEndTime}`, 'DD/MM/YYYY HH:mm:ss').format(dateFormat)
                    )
                  : null,
              studentLimit: Number(values.studentLimit),
              roomId: values.roomId,
              roomNo: parsedRoomNo,
            },
          }).unwrap();
          shikshaMitraToast.success({
            message: `${values.slotName} exam slot updated successfully`,
          });
        } else {
          await addSlot({
            academicYearId: currentYear?.id,
            slotName: values.slotName,
            startTimeDate:
              values.startDateTime && date
                ? dateConvertor(
                    dayjs(`${newDate} ${newStartTime}`, 'DD/MM/YYYY HH:mm:ss').format(dateFormat)
                  )
                : null,
            endTimeDate:
              values.endDateTime && date
                ? dateConvertor(
                    dayjs(`${newDate} ${newEndTime}`, 'DD/MM/YYYY HH:mm:ss').format(dateFormat)
                  )
                : null,
            studentLimit: Number(values.studentLimit),
            roomId: values.roomId,
            roomNo: parsedRoomNo,
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
                onChange={(e) => {
                  let onlyText = e.target.value;
                  onlyText = onlyText.replace(/^\s+/g, ''); // Remove leading spaces
                  const capitalize = onlyText.charAt(0).toUpperCase() + onlyText.slice(1);
                  formik.setFieldValue('slotName', capitalize);
                }}
                onBlur={formik.handleBlur}
                size="small"
                fullWidth
                error={formik.touched.slotName && Boolean(formik.errors.slotName)}
                helperText={
                  formik.touched.slotName && formik.errors.slotName
                    ? String(formik.errors.slotName)
                    : ''
                }
                inputProps={{
                  maxLength: 40,
                }}
              />
            </ShakingTextField>
            {/* Row 1: Start Time | End Time */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.startDateTime && formik.errors.startDateTime) || false}
                >
                  <TimePicker
                    label="Start Time *"
                    value={formik.values.startDateTime}
                    format="hh:mm a"
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                    onChange={(startDateTime) => {
                      formik.setFieldValue('startDateTime', startDateTime);

                      const { endDateTime } = formik.values;
                      if (endDateTime && startDateTime) {
                        const diffInMinutes = dayjs(endDateTime).diff(
                          dayjs(startDateTime),
                          'minute'
                        );
                        formik.setFieldValue('duration', diffInMinutes);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        name: 'startDateTime',
                        helperText:
                          formik.touched.startDateTime && formik.errors.startDateTime
                            ? String(formik.errors.startDateTime)
                            : undefined,
                        error: !!formik.errors.startDateTime && formik.touched.startDateTime,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.endDateTime && formik.errors.endDateTime) || false}
                >
                  <TimePicker
                    label="End Time *"
                    format="hh:mm a"
                    value={formik.values.endDateTime}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                      seconds: renderTimeViewClock,
                    }}
                    onChange={(endDateTime) => {
                      formik.setFieldValue('endDateTime', endDateTime);

                      const { startDateTime } = formik.values;
                      if (startDateTime && endDateTime) {
                        const diffInMinutes = dayjs(endDateTime).diff(
                          dayjs(startDateTime),
                          'minute'
                        );
                        formik.setFieldValue('duration', diffInMinutes);
                      }
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        name: 'endDateTime',
                        helperText:
                          formik.touched.endDateTime && formik.errors.endDateTime
                            ? String(formik.errors.endDateTime)
                            : undefined,
                        error: !!formik.errors.endDateTime && formik.touched.endDateTime,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
            {/* Row 2: Duration | Student Limit */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Duration (Minutes)"
                  value={formik.values.duration || ''}
                  size="small"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.studentLimit && formik.errors.studentLimit) || false}
                >
                  <TextField
                    name="studentLimit"
                    label="Student Limit *"
                    type="number"
                    value={formik.values.studentLimit}
                    disabled
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
              </Grid>
            </Grid>
            {/* ---- Single Room selection with grouped Autocomplete ---- */}
            <ShakingTextField error={!!(formik.touched.roomId && formik.errors.roomId) || false}>
              <Autocomplete
                size="small"
                loading={isRoomsLoading}
                options={roomOptions}
                groupBy={(option) => option.group}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                value={selectedRoom}
                onChange={(_e, newVal) => {
                  setSelectedRoom(newVal);
                  if (newVal) {
                    formik.setFieldValue('roomId', newVal.id);
                    formik.setFieldValue('roomNo', newVal.roomName);
                    formik.setFieldValue('studentLimit', newVal.capacity ?? '');
                  } else {
                    formik.setFieldValue('roomId', '');
                    formik.setFieldValue('roomNo', '');
                    formik.setFieldValue('studentLimit', '');
                  }
                }}
                onBlur={() => {
                  formik.setFieldTouched('roomId', true);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Room No. *"
                    name="roomId"
                    size="small"
                    error={formik.touched.roomId && Boolean(formik.errors.roomId)}
                    helperText={
                      formik.touched.roomId && formik.errors.roomId
                        ? String(formik.errors.roomId)
                        : ''
                    }
                  />
                )}
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
