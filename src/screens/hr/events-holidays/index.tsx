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
  ButtonGroup,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

interface IEventHoliday {
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
  const dialog = useBoolean();
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);

  const confirm = useBoolean(false);
  const [view, setView] = React.useState('list');
  const [date, setDate] = React.useState<Dayjs | null>(dayjs);
  const [editData, setEditData] = useState<null | IEventHoliday>(null);
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const theme = useTheme();
  const [fetchEvent, { data: eventHolidayData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEventHolidayByDateQuery,
    // params: date?.format('YYYY-MM-DD'),
  });

  const [deleteEventHoliday, { isLoading: isEventHolidayDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEventHolidayMutation,
  });
  useEffect(() => {
    if (date) {
      fetchEvent(date.format('YYYY-MM-DD'));
    }
  }, [date, fetchEvent]);

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
        links={[{ name: 'HR' }, { name: 'Events & Holidays' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            onClick={handleClose}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        }
      />
      <Card>
        <HrEventsAndHolidaysForm handleClose={handleClose} editData={editData} />
      </Card>
    </>
  ) : (
    <Box>
      <CustomBreadcrumbs
        heading="Events & Holidays"
        links={[{ name: 'HR' }, { name: 'Events & Holidays' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button onClick={dialog.onTrue} startIcon={<Add />} variant="contained" size="small">
            Event & Holidays
          </Button>
        }
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

        <Box display="flex" alignItems="center" gap={1}>
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
        </Box>
      </Box>
      {view === 'list' ? (
        <CustomizableTable
          tableId="events-holidays-table"
          isLoading={isLoading}
          columns={[
            { id: 'sDate', label: 'Start Date' },
            { id: 'eDate', label: 'End Date' },
            { id: 'reason', label: 'Reason' },
            {
              id: 'actions',
              label: 'Actions',
              isFilter: false,
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
        content="Are you sure want to delete?"
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
            Delete
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
  const [addHoliday, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddEventHolidayMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Event created successfully',
    },
  });
  const [updateHoliday, { isLoading: isUpdatePFLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateEventHolidayMutation,
    isThrowError: true,
    popupConfig: {
      success: true,
      successMessage: 'Event updated successfully',
    },
  });
  const formik = useFormik({
    initialValues: {
      startDate: editData ? dayjs(editData?.startDate) : null,
      endDate: editData ? dayjs(editData?.endDate) : null,
      reason: editData?.reason || '',
      isHoliday: editData?.isHoliday || false,
    },
    onSubmit: async (value) => {
      try {
        if (editData) {
          await updateHoliday({
            id: editData.id,
            body: {
              startDate:
                dateConvertor(dayjs(value.startDate, 'DD-MM-YYYY').format(dateFormat)) || '',
              endDate: dateConvertor(dayjs(value.endDate, 'DD-MM-YYYY').format(dateFormat)) || '',
              reason: value.reason,
              isHoliday: value.isHoliday,
            },
          });
        } else {
          await addHoliday({
            startDate: dateConvertor(dayjs(value.startDate, 'DD-MM-YYYY').format(dateFormat)) || '',
            endDate: dateConvertor(dayjs(value.endDate, 'DD-MM-YYYY').format(dateFormat)) || '',
            reason: value.reason,
            isHoliday: value.isHoliday,
          });
        }
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
              <DatePicker
                format="DD-MM-YYYY"
                label="Start Date"
                value={formik.values.startDate}
                onChange={(value) => formik.setFieldValue('startDate', value)}
                disabled={isCalenderPreview}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                format="DD-MM-YYYY"
                label="End Date"
                value={formik.values.endDate}
                onChange={(value) => formik.setFieldValue('endDate', value)}
                disabled={isCalenderPreview}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason"
                value={formik.values.reason}
                size="small"
                name="reason"
                fullWidth
                rows={3}
                multiline
                disabled={isCalenderPreview}
                onChange={formik.handleChange}
              />
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
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <LoadingButton
            disabled={isCalenderPreview}
            loading={isUpdatePFLoading || isLoading}
            variant="contained"
            type="submit"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};
