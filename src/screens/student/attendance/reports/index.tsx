'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DatePicker, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Stack,
  Radio,
  Button,
  Switch,
  TextField,
  FormLabel,
  CardHeader,
  Typography,
  RadioGroup,
  CardActions,
  CardContent,
  FormControl,
  DialogActions,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

const AttendanceReportScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Reports"
      links={[
        { name: 'Student', href: '/student/enrollment/dashboard/' },
        { name: 'Attendance', href: '/student/attendance/dashboard/' },
        { name: 'Reports' },
      ]}
      sx={{ mb: 2 }}
    />
    <AbsentStudentReport />
  </Box>
);

export default AttendanceReportScreen;

const AbsentStudentReport = () => {
  const dialog = useBoolean();
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  return (
    <Box>
      <Card>
        <CardHeader title="Student Attendance Report" />
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <CustomSelect
              options={[
                { name: 'Absent Student Report', id: 'absent-student-report' },
                { name: 'Attendance Sheet', id: 'attendance-sheet' },
                {
                  name: 'Daily Strength Gender Wise Summary',
                  id: 'daily-strength-gender-wise-summary',
                },
                {
                  name: 'Student Attendance Register Small',
                  id: 'student-attendance-register-small',
                },
                {
                  name: 'Student Attendance Register Small',
                  id: 'student-attendance-register-small',
                },
              ]}
              label="Report Type"
              value="absent-student-report"
              onChange={(val) => {
                //   setMedium(val as string);
              }}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />

            <CustomSelect
              options={allMediums}
              label="Medium"
              value={medium}
              onChange={(val) => {
                setMedium(val as string);
              }}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />
            <CustomSelect
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val) => setOrganization(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!medium}
            />
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClass(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!organization}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!classes}
            />
            <TextField
              label="Search GR No"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {' '}
                    <Iconify icon="bytesize:search" sx={{ height: '20px', width: '20px' }} />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ maxWidth: '250px', width: '100%' }}
            />
            <DatePicker
              label="From Date"
              slotProps={{ textField: { size: 'small', sx: { maxWidth: '250px', width: '100%' } } }}
            />
            <DatePicker
              label="To Date"
              slotProps={{ textField: { size: 'small', sx: { maxWidth: '250px', width: '100%' } } }}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.scheduledReport} />}
            variant="outlined"
            onClick={dialog.onTrue}
          >
            Schedule Report
          </Button>
          <Button startIcon={<Iconify icon={GlobalIcons.generateReport} />} variant="contained">
            Generate Report
          </Button>
        </CardActions>
      </Card>

      <ScheduledReports />
      <CustomDialog title="Schedule Report" open={dialog.value} handleClose={dialog.onFalse}>
        <ScheduledReportsFrom handleClose={dialog.onFalse} />
      </CustomDialog>
    </Box>
  );
};

const ScheduledReports = () => (
  <Card sx={{ mt: 2 }}>
    <CardHeader title="Scheduled Reports" />
    <CardContent>
      <CustomizableTable
        tableId="scheduled-reports"
        columns={[
          { id: 'date', label: 'Date' },
          { id: 'name', label: 'Name' },
          { id: 'timeDuration', label: 'Time Duration' },
          { id: 'notificationType', label: 'Notification Type' },
          {
            id: 'active',
            label: 'Enable',
            render(value, row) {
              return <Switch />;
            },
          },
        ]}
        data={[
          {
            id: 1,
            date: '2024-01-01',
            name: 'Daily Attendance Report',
            notificationType: 'email',
            timeDuration: 'daily',
          },
          {
            id: 2,
            date: '2024-01-15',
            name: 'Weekly Summary Report',
            notificationType: 'sms',
            timeDuration: 'weekly',
          },
          {
            id: 3,
            date: '2024-02-01',
            name: 'Monthly Attendance Report',
            notificationType: 'both',
            timeDuration: 'monthly',
          },
          {
            id: 4,
            date: '2024-02-15',
            name: 'Absentee Report',
            notificationType: 'email',
            timeDuration: 'weekly',
          },
          {
            id: 5,
            date: '2024-03-01',
            name: 'Late Arrival Report',
            notificationType: 'sms',
            timeDuration: 'daily',
          },
        ]}
      />
    </CardContent>
  </Card>
);

const ScheduledReportsFrom = ({ handleClose }: { handleClose: () => void }) => {
  const { values, handleChange, setFieldValue, handleSubmit } = useFormik({
    initialValues: {
      date: null,
      name: '',
      timeDuration: '',
      notificationType: '',
      active: false,
      weekday: 'monday',
    },
    onSubmit: () => {},
  });
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 2 }}>
        <Stack spacing={2}>
          <TextField label="Name" value={values.name} onChange={handleChange} size="small" />
          <CustomSelect
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            label="Time Duration"
            value={values.timeDuration}
            onChange={(val) => setFieldValue('timeDuration', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
          />
          {values.timeDuration === 'daily' && (
            <TimePicker
              value={values.date}
              onChange={(val) => setFieldValue('date', val)}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          )}
          {values.timeDuration === 'weekly' && (
            <FormControl>
              <FormLabel>Select Day</FormLabel>
              <RadioGroup
                row
                value={values.weekday}
                onChange={(e) => setFieldValue('weekday', e.target.value)}
              >
                <FormControlLabel value="monday" control={<Radio />} label="Monday" />
                <FormControlLabel value="tuesday" control={<Radio />} label="Tuesday" />
                <FormControlLabel value="wednesday" control={<Radio />} label="Wednesday" />
                <FormControlLabel value="thursday" control={<Radio />} label="Thursday" />
                <FormControlLabel value="friday" control={<Radio />} label="Friday" />
                <FormControlLabel value="saturday" control={<Radio />} label="Saturday" />
                <FormControlLabel value="sunday" control={<Radio />} label="Sunday" />
              </RadioGroup>
            </FormControl>
          )}
          {values.timeDuration === 'monthly' && (
            <DatePicker
              value={values.date}
              onChange={(val) => setFieldValue('date', val)}
              label="Date"
              slotProps={{ textField: { size: 'small' } }}
            />
          )}

          <CustomSelect
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'both', label: 'Both' },
            ]}
            label="Notification Type"
            value={values.notificationType}
            onChange={(val) => setFieldValue('notificationType', val)}
            formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset', width: '100%' } }}
          />
          <Box display="flex" alignItems="center">
            <Switch
              checked={values.active}
              onChange={(e) => setFieldValue('active', e.target.checked)}
            />
            <Typography component="span">Enable</Typography>
          </Box>
        </Stack>
      </Scrollbar>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Save
        </Button>
      </DialogActions>
    </Box>
  );
};
