'use client';

import type { Dayjs } from 'dayjs';
import type { EventClickArg } from '@fullcalendar/core';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
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

  const handelClose = () => {
    setEditData(null);
    dialog.onFalse();
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
            onClick={handelClose}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            variant="contained"
          >
            Back
          </Button>
        }
      />
      <Card>
        <HrEventsAndHolidaysForm handleClose={handelClose} editData={editData} />
      </Card>
    </>
  ) : (
    <Box>
      <CustomBreadcrumbs
        heading="Events & Holidays"
        links={[{ name: 'HR' }, { name: 'Events & Holidays' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button onClick={dialog.onTrue} startIcon={<Add />} variant="contained">
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
          isLoading={isLoading}
          columns={[
            { id: 'sDate', label: 'Start Date' },
            { id: 'eDate', label: 'End Date' },
            { id: 'reason', label: 'Reason' },
            {
              id: 'actions',
              label: 'Actions',
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
        }}
        title="Preview"
      >
        <HrEventsAndHolidaysForm
          handleClose={() => {
            setCurrentDateClick(null);
          }}
          editData={selectCalenderData}
          isCalenderPreview
        />
      </CustomDialog>
    </Box>
  );
};

export default HrEventsAndHolidaysScreen;

const HrEventsAndHolidaysForm = ({
  handleClose,
  editData,
  isCalenderPreview = false,
}: {
  handleClose: () => void;
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
  const { values, handleChange, handleSubmit, setFieldValue } = useFormik({
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
        handleClose();
      } catch (error) {
        console.log(error);
      }
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              format="DD-MM-YYYY"
              label="Start Date"
              value={values.startDate}
              onChange={(value) => setFieldValue('startDate', value)}
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
              value={values.endDate}
              onChange={(value) => setFieldValue('endDate', value)}
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
              value={values.reason}
              size="small"
              name="reason"
              fullWidth
              rows={3}
              multiline
              disabled={isCalenderPreview}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              disabled={isCalenderPreview}
              control={
                <Switch
                  disabled={isCalenderPreview}
                  checked={values.isHoliday}
                  onChange={(e) => setFieldValue('isHoliday', e.target.checked)}
                  name="isHoliday"
                />
              }
              label="Is Holiday"
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
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
  );
};
