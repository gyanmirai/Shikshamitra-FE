'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Card,
  Switch,
  Button,
  useTheme,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useAddEventHolidayMutation,
  useDeleteEventHolidayMutation,
  useUpdateEventHolidayMutation,
  useLazyGetEventHolidayByDateQuery,
} from 'src/redux/eventHoliday/eventHolidayApi';

import { Iconify } from 'src/components/iconify';
import CommonCalender from 'src/components/calender';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { eventAndHolidayInitialValues } from './initialValue';
import { eventAndHolidayValidationSchema } from './validationSchema';

export interface IEventHoliday {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  reason: string;
  isHoliday: boolean;
}
const HrEventsAndHolidaysScreen = () => {
  // Dialog state for managing form visibility
  const dialog = useBoolean();
  // State to store clicked calendar event
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);

  // Confirmation dialog state
  const confirm = useBoolean(false);
  // Toggle between list and calendar view
  const [view, setView] = React.useState('list');
  // Current selected date in date picker
  const [date, setDate] = React.useState<Dayjs | null>(dayjs);
  // State to store event/holiday data for editing
  const [editData, setEditData] = useState<null | IEventHoliday>(null);
  const dispatch = useDispatch();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const theme = useTheme();

  // Fetch events/holidays for selected date
  const [fetchEvent, { data: eventHolidayData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEventHolidayByDateQuery,
  });

  // Mutation for deleting events/holidays
  const [deleteEventHoliday, { isLoading: isEventHolidayDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEventHolidayMutation,
  });

  // Fetch events when date changes
  useEffect(() => {
    if (date) {
      fetchEvent(date.format('YYYY-MM-DD'));
    }
  }, [date, fetchEvent]);

  // Handle form close with unsaved changes check
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      dispatch(setIsChanges(false));
      dialog.onFalse();
      setEditData(null);
    } else if (!isChanges) {
      dialog.onFalse();
      setEditData(null);
    }
  };

  // Transform API data for calendar display
  const calendarData = useMemo(
    () =>
      eventHolidayData?.items.map((i: any) => ({
        ...i,
        start: i.startDate,
        color: i.isHoliday ? theme.palette.error.main : theme.palette.success.main,
        end: i.endDate,
        allDay: false,
        textColor: i.isHoliday ? theme.palette.error.main : theme.palette.success.main,
        title: i.isHoliday ? 'Holiday' : 'Event',
        description: i.reason,
      })) || [],
    [eventHolidayData?.items, theme.palette.error.main, theme.palette.success.main]
  );

  // Get selected calendar event data
  const selectCalenderData = useMemo(() => {
    if (currentDateClick) {
      return calendarData.find((i: any) => i.id === currentDateClick.event.id);
    }
    return null;
  }, [calendarData, currentDateClick]);
  return dialog.value ? (
    <>
      <CustomBreadcrumbs
        heading="Events & Holidays"
        links={[{ name: 'HR', href: '/hr/dashboard/' }, { name: 'Events & Holidays' }]}
        sx={{ px: 1, mb: 2 }}
        isBack
        onBack={() => handleClose(undefined, false)}
        description="On the Create Event and Holiday screen, you can add new events and holidays to the calendar. The screen also allows you to view and manage the list of existing events and holidays."
      />
      <Card>
        <HrEventsAndHolidaysForm handleClose={handleClose} editData={editData} />
      </Card>
    </>
  ) : (
    <Box>
      <CustomBreadcrumbs
        heading="Events & Holidays"
        links={[{ name: 'HR', href: '/hr/dashboard/' }, { name: 'Events & Holidays' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button onClick={dialog.onTrue} startIcon={<Add />} variant="contained" size="small">
            Event & Holidays
          </Button>
        }
        description="On the Create Event and Holiday screen, you can add new events and holidays to the calendar. The screen also allows you to view and manage the list of existing events and holidays."
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <DatePicker
          format="MMM-YYYY"
          views={['year', 'month']}
          label="Select Moth Year"
          value={date}
          onChange={(newValue) => {
            setDate(newValue);
          }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />

        {/* <Box display="flex" alignItems="center" gap={1}>
          <ButtonGroup>
            <Button
              variant={view === 'list' ? 'outlined' : 'contained'}
              color="inherit"
              onClick={() => setView('calender')}
            >
              <Iconify icon="uis:calender" />
            </Button>
            <Button
              color="inherit"
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
            >
              <Iconify icon="lucide:layout-list" />
            </Button>
          </ButtonGroup>
        </Box> */}
      </Box>
      {view === 'list' ? (
        <CustomizableTable
          noDataText={
            <>
              No Event & Holidays Found{' '}
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
                Leave Request
              </Box>
            </>
          }
          searchFieldProps={{
            placeholder: 'Search by Start Date, End Date..',
            label: 'Search by Start Date, End Date..',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
          tableId="events-holidays-table"
          isLoading={isLoading}
          columns={[
            { id: 'sDate', label: 'Start Date', filterType: 'date' },
            { id: 'eDate', label: 'End Date', filterType: 'date' },
            { id: 'reason', label: 'Description' },
            {
              id: 'actions',
              label: 'Actions',
              isFilter: false,
              minWidth: 60,
              sticky: true,
              isSort: false,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    showEditIcon
                    showDeleteIcon
                    showThreeDots={false}
                    handleDeleteClick={() => {
                      confirm.onTrue();
                      setEditData(row as IEventHoliday);
                    }}
                    handleEditClick={() => {
                      dialog.onTrue();
                      setEditData(row as IEventHoliday);
                    }}
                  />
                );
              },
            },
          ]}
          data={
            eventHolidayData?.items?.map((item: IEventHoliday) => ({
              ...item,
              sDate: dayjs(item.startDate).format('DD-MM-YYYY'),
              eDate: dayjs(item.endDate).format('DD-MM-YYYY'),
            })) || []
          }
          rowProps={(row) => ({
            sx: {
              borderLeft: `3px solid ${row.isHoliday ? 'red' : 'green'}`,
              background: row.isHoliday
                ? varAlpha(theme.palette.error.mainChannel, 0.2)
                : varAlpha(theme.palette.success.mainChannel, 0.2),
            },
          })}
        />
      ) : (
        <Box sx={{ p: 2 }}>
          <CommonCalender
            data={calendarData}
            showCalendarToolbar={false}
            onDateClick={(e) => {
              console.log(e);
              setCurrentDateClick(e);
            }}
          />
        </Box>
      )}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isEventHolidayDeleteLoading}
            color="error"
            onClick={async () => {
              await deleteEventHoliday(editData?.id || '');

              confirm.onFalse();
              setEditData(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        open={!!selectCalenderData}
        handleClose={() => {
          setCurrentDateClick(null);
          setEditData(null);
        }}
        title="Preview"
      >
        <HrEventsAndHolidaysForm
          handleClose={handleClose}
          editData={selectCalenderData}
          isCalenderPreview
        />
      </CustomDialog>
    </Box>
  );
};

export default HrEventsAndHolidaysScreen;

export const HrEventsAndHolidaysForm = ({
  handleClose,
  editData,
  isCalenderPreview = false,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: IEventHoliday | null;
  isCalenderPreview?: boolean;
}) => {
  // Custom hook for adding a new holiday event with success message popup
  const [addHoliday, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEventHolidayMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Event created successfully',
    },
  });

  // Custom hook for updating an existing holiday event with success message popup
  const [updateHoliday, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEventHolidayMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Event updated successfully',
    },
  });

  // Initialize formik for form handling with validation
  const formik = useFormik({
    // Set initial form values based on editData (if editing existing event)
    initialValues: eventAndHolidayInitialValues(editData),
    // Apply validation schema for form fields
    validationSchema: eventAndHolidayValidationSchema,
    // Handle form submission
    onSubmit: async (value) => {
      try {
        if (editData) {
          // If editing existing event, update it with new values
          await updateHoliday({
            id: editData.id,
            body: {
              // Convert dates to required format using dayjs
              startDate:
                dateConvertor(dayjs(value.startDate, 'DD-MM-YYYY').format(dateFormat)) || '',
              endDate: dateConvertor(dayjs(value.endDate, 'DD-MM-YYYY').format(dateFormat)) || '',
              reason: value.reason,
              isHoliday: value.isHoliday,
            },
          }).unwrap();
          shikshaMitraToast.success({
            message: value.isHoliday
              ? 'Holiday updated successfully'
              : 'Event updated successfully',
          });
        } else {
          // If creating new event, add it with provided values
          await addHoliday({
            startDate: dateConvertor(dayjs(value.startDate, 'DD-MM-YYYY').format(dateFormat)) || '',
            endDate: dateConvertor(dayjs(value.endDate, 'DD-MM-YYYY').format(dateFormat)) || '',
            reason: value.reason,
            isHoliday: value.isHoliday,
          }).unwrap();
          shikshaMitraToast.success({
            message: value.isHoliday
              ? 'Holiday created successfully'
              : 'Event created successfully',
          });
        }
        // Close form after successful submission
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <ShakingTextField
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              >
                <DatePicker
                  format="DD-MM-YYYY"
                  label="Start Date *"
                  value={formik.values.startDate}
                  onChange={(value) => formik.setFieldValue('startDate', value)}
                  disabled={isCalenderPreview}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      helperText: formik.touched.startDate && formik.errors.startDate,
                      error: formik.touched.startDate && Boolean(formik.errors.startDate),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={6}>
              <ShakingTextField error={formik.touched.endDate && Boolean(formik.errors.endDate)}>
                <DatePicker
                  format="DD-MM-YYYY"
                  label="End Date *"
                  value={formik.values.endDate}
                  onChange={(value) => formik.setFieldValue('endDate', value)}
                  disabled={isCalenderPreview}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      helperText: formik.touched.endDate && formik.errors.endDate,
                      error: formik.touched.endDate && Boolean(formik.errors.endDate),
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12}>
              <ShakingTextField error={formik.touched.reason && Boolean(formik.errors.reason)}>
                <TextField
                  label="Description *"
                  value={formik.values.reason}
                  size="small"
                  name="reason"
                  fullWidth
                  rows={3}
                  multiline
                  disabled={isCalenderPreview}
                  onChange={formik.handleChange}
                  helperText={formik.touched.reason && formik.errors.reason}
                  error={formik.touched.reason && Boolean(formik.errors.reason)}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                disabled={isCalenderPreview}
                control={
                  <Switch
                    disabled={isCalenderPreview}
                    checked={formik.values.isHoliday}
                    onChange={(e) => formik.setFieldValue('isHoliday', e.target.checked)}
                    name="isHoliday"
                  />
                }
                label="Is Holiday"
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            size="small"
            onClick={handleClose}
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>

          <LoadingButton
            size="small"
            disabled={isCalenderPreview}
            loading={isUpdatePFLoading || isLoading}
            variant="contained"
            type="submit"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};
