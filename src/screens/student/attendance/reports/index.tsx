'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Button,
  TextField,
  CardHeader,
  CardActions,
  CardContent,
  InputAdornment,
} from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AttendanceReportScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Reports"
      links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Reports' }]}
      sx={{ px: 1, mb: 2 }}
    />
    <AbsentStudentReport />
  </Box>
);

export default AttendanceReportScreen;

const AbsentStudentReport = () => {
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
            onChange={(val: string | string[]) => {
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
            onChange={(val: string | string[]) => {
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
            onChange={(val: string | string[]) => setOrganization(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!medium}
          />
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val: string | string[]) => setClass(val as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            disabled={!organization}
          />
          <CustomSelect
            options={allDivision}
            label="Division"
            value={division}
            onChange={(val: string | string[]) => setDivision(val as string)}
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
        <Button variant="contained" color="primary">
          Schedule Report
        </Button>
        <Button variant="contained">Generate Report</Button>
      </CardActions>
    </Card>
  );
};
