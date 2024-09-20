'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const ImportAttendanceScreen = () => {
  const [year, setYear] = useState<null | Dayjs>(dayjs(new Date()));
  const [month, setMonth] = useState<null | Dayjs>(dayjs(new Date()));
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

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
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Import Attendance"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Import Attendance' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<Save />} variant="contained">
            Save
          </Button>
        }
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <DatePicker
          value={year}
          onChange={(val) => setYear(val)}
          views={['year']}
          label="Select Year"
          format="YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        <DatePicker
          value={month}
          onChange={(val) => setMonth(val)}
          views={['month']}
          label="Select Month"
          format="MMMM"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
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
      </Box>
      <CustomizableTable
        columns={[
          { id: 'employeeCode', label: 'Employee Code' },
          { id: 'name', label: 'Name' },
          { id: 'employeeType', label: 'Employee Type' },
          { id: 'department', label: 'Department' },
          { id: 'workingDays', label: 'Working Days' },
          { id: 'leave', label: 'Working Days' },
        ]}
        data={[]}
      />
    </Box>
  );
};

export default ImportAttendanceScreen;
