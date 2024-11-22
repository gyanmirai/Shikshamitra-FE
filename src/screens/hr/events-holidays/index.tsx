'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Button,
  MenuList,
  MenuItem,
  TextField,
  ButtonGroup,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CommonCalender from 'src/components/calender';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const HrEventsAndHolidaysScreen = () => {
  const dialog = useBoolean();
  const confirm = useBoolean(false);
  const [view, setView] = React.useState('list');
  const [date, setDate] = React.useState<Dayjs | null>(dayjs);
  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [confirm, dialog]
  );
  return (
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
          columns={[
            { id: 'startDate', label: 'Start Date' },
            { id: 'endDate', label: 'End Date' },
            { id: 'reason', label: 'Reason' },
            {
              id: 'actions',
              label: 'Actions',
              isSort: false,
              render(value, row) {
                return <ThreeDotsActions actions={actions} />;
              },
            },
          ]}
          data={[
            { startDate: '2024-01-01', endDate: '2024-01-01', reason: 'New Year', isHoliday: true },
            {
              startDate: '2024-01-26',
              endDate: '2024-01-26',
              reason: 'Republic Day',
              isHoliday: true,
            },
            { startDate: '2024-03-25', endDate: '2024-03-25', reason: 'Holi', isHoliday: true },
            {
              startDate: '2024-04-15',
              endDate: '2024-04-15',
              reason: 'School Anniversary',
              isHoliday: false,
            },
            {
              startDate: '2024-05-01',
              endDate: '2024-05-01',
              reason: 'Labor Day',
              isHoliday: true,
            },
            {
              startDate: '2024-08-15',
              endDate: '2024-08-15',
              reason: 'Sports Day',
              isHoliday: false,
            },
            {
              startDate: '2024-10-02',
              endDate: '2024-10-02',
              reason: 'Gandhi Jayanti',
              isHoliday: true,
            },
            {
              startDate: '2024-12-25',
              endDate: '2024-12-25',
              reason: 'Christmas',
              isHoliday: true,
            },
          ]}
          rowProps={(row) => ({
            sx: {
              borderLeft: (theme) => `3px solid ${row.isHoliday ? 'red' : 'green'}`,
            },
          })}
        />
      ) : (
        <Box sx={{ p: 2 }}>
          <CommonCalender data={[]} showCalendarToolbar={false} />
        </Box>
      )}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          //   setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={false}
            color="error"
            onClick={async () => {
              //   await deleteOrganization(editData?.id || '');
              //   await getData(id);
              confirm.onFalse();
              //   setEditData(null);
              // isInitial.current = true;
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Events And Holidays">
        <HrEventsAndHolidaysForm handleClose={dialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};

export default HrEventsAndHolidaysScreen;

const HrEventsAndHolidaysForm = ({ handleClose }: { handleClose: () => void }) => {
  const { values, handleChange, handleSubmit, setFieldValue } = useFormik({
    initialValues: {
      startDate: null,
      endDate: null,
      reason: '',
      isHoliday: false,
    },
    onSubmit: () => {},
  });

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Stack spacing={2}>
          <DatePicker
            format="DD-MM-YYYY"
            label="Start Date"
            value={values.startDate}
            onChange={(value) => setFieldValue('startDate', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />
          <DatePicker
            format="DD-MM-YYYY"
            label="End Date"
            value={values.endDate}
            onChange={(value) => setFieldValue('endDate', value)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: 'small',
              },
            }}
          />
          <TextField
            label="Reason"
            value={values.reason}
            size="small"
            name="reason"
            fullWidth
            rows={3}
            multiline
            onChange={handleChange}
          />
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </DialogActions>
    </Box>
  );
};
