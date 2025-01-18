'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Stack,
  Avatar,
  Button,
  Switch,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const TakeAttendanceScreen = () => {
  // State to control the dialog visibility
  const dialog = useBoolean();
  // State to store all available mediums
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // State to store the selected medium
  const [medium, setMedium] = useState<string>('');
  // State to store all available organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store the selected organization
  const [organization, setOrganization] = useState<string>('');
  // State to store all available classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store the selected class
  const [classes, setClass] = useState<string>('');
  // State to store all available divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  // State to store the selected date
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  // check if the attendance is saved
  const isSaved = useBoolean();

  // Selector to get the current board from the global state
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  // Custom hook to get board data
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });

  // Effect to fetch board data when the current board changes
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

  // Effect to update mediums when board data changes
  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Dummy data for the table
  const dummyData = [
    {
      rollNo: '1',
      name: 'John Doe',
      grNo: 'GR001',
      attendance: 'Present',
      attendancePercentage: '80%',
      totalPresentDays: '20/25',
    },
    {
      rollNo: '2',
      name: 'Jane Smith',
      grNo: 'GR002',
      attendance: 'Absent',
      attendancePercentage: '70%',
      totalPresentDays: '18/25',
    },
    {
      rollNo: '3',
      name: 'Alice Johnson',
      grNo: 'GR003',
      attendance: 'Present',
      attendancePercentage: '90%',
      totalPresentDays: '22/25',
    },
    {
      rollNo: '4',
      name: 'Bob Williams',
      grNo: 'GR004',
      attendance: 'Present',
      attendancePercentage: '85%',
      totalPresentDays: '21/25',
    },
    {
      rollNo: '5',
      name: 'Charlie Brown',
      grNo: 'GR005',
      attendance: 'Absent',
      attendancePercentage: '75%',
      totalPresentDays: '19/25',
    },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Take Attendance"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Take Attendance' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <DatePicker
          label="Date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          slotProps={{ textField: { size: 'small', sx: { maxWidth: '250px', width: '100%' } } }}
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
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <Button
          size="small"
          startIcon={<Iconify icon="material-symbols:save" />}
          variant="contained"
          onClick={dialog.onTrue}
          disabled={isSaved.value}
        >
          Save
        </Button>
      </Box>

      {division && (
        <CustomizableTable
          tableId="student-attendance-table"
          columns={[
            { id: 'rollNo', label: 'Roll No' },
            { id: 'grNo', label: 'Gr No' },
            {
              id: 'name',
              label: 'Name',
              render(value, row) {
                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 30, height: 30 }} alt={value} title={value} />
                    {value}
                  </Box>
                );
              },
            },
            { id: 'totalPresentDays', label: 'Total Present Days' },
            { id: 'attendancePercentage', label: 'Attendance Percentage' },
            {
              id: 'attendance',
              label: 'Attendance',
              isSort: false,
              render(value, row) {
                return isSaved.value ? (
                  <Label color={value === 'Present' ? 'success' : 'error'}>{value}</Label>
                ) : (
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography component="small" fontSize="12px">
                      Absent
                    </Typography>
                    <Switch
                      size="small"
                      inputProps={{ 'aria-label': 'controlled' }}
                      checked={value === 'Present'}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: 'success.main',
                          '&:hover': {
                            backgroundColor: 'success.light',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'success.main',
                        },
                        '& .MuiSwitch-switchBase:not(.Mui-checked)': {
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                          },
                        },
                        '& .MuiSwitch-switchBase:not(.Mui-checked) + .MuiSwitch-track': {
                          backgroundColor: 'error.main',
                        },
                      }}
                    />
                    <Typography component="small" fontSize="12px">
                      Present
                    </Typography>
                  </Stack>
                );
              },
            },
            {
              id: 'absentReason',
              label: 'Absent Reason',
              render(value, row) {
                return row.attendance === 'Present' ? (
                  '-'
                ) : (
                  <CustomSelect
                    options={[
                      { name: 'Sick', id: 'Sick' },
                      { name: 'Family Emergency', id: 'Family Emergency' },
                      { name: 'Transportation Issues', id: 'Transportation Issues' },
                      { name: 'Medical Appointment', id: 'Medical Appointment' },
                      { name: 'Religious Observance', id: 'Religious Observance' },
                      { name: 'Other', id: 'Other' },
                    ]}
                    value={value || 'Sick'}
                    onChange={(val) => {
                      console.log(val);
                    }}
                    label=""
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
                  />
                );
              },
            },
            {
              id: 'remarks',
              label: 'Remarks',
              render(value, row) {
                return row.attendance === 'Present' ? (
                  '-'
                ) : (
                  <TextField
                    size="small"
                    value={value || ''}
                    onChange={(e) => {
                      console.log(e.target.value);
                    }}
                    multiline
                    rows={2}
                    sx={{ maxWidth: '200px', width: '100%' }}
                  />
                );
              },
            },
          ]}
          data={dummyData}
        />
      )}
      <CustomDialog
        title="Attendance Confirmation"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <Box p={2}>
          <Typography variant="h6" component="span" fontWeight={400} fontSize="14px">
            Are you sure you want to mark as absent to these roll no Students<b> 1, 2, 5</b> ?
          </Typography>
        </Box>
        <DialogActions>
          <Button onClick={dialog.onFalse} color="error" variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              isSaved.onTrue();
              dialog.onFalse();
            }}
            color="primary"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};
export default TakeAttendanceScreen;
