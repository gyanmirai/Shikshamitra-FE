import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';

import { Box, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Description } from '@mui/icons-material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const Reports = () => {
  const [classes, setClasses] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between">
      <Box display="flex" flexDirection="row" gap={3} mb={2}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          value={classes}
          isLoading={isLoading}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            setClasses(val as string);
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          multiple
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            setDivision(val);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          options={[
            { value: 'Math', label: 'Math' },
            { value: 'English', label: 'English' },
            { value: 'Science', label: 'Science' },
          ]}
          label="Subject"
          name="teacher"
          value={selectedSubject}
          onChange={(val) => {
            setSelectedSubject(val as string);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          options={[
            { value: 'riya', label: 'riya' },
            { value: 'siya', label: 'siya' },
            { value: 'priya', label: 'priya' },
            { value: 'jiya', label: 'jiya' },
          ]}
          label="Teacher"
          name="teacher"
          value={selectedTeacher}
          onChange={(val) => {
            setSelectedTeacher(val as string);
          }}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <DatePicker
          label="From Date"
          sx={{ minWidth: 140 }}
          slotProps={{ textField: { size: 'small' } }}
        />
        <DatePicker
          label="To Date"
          sx={{ minWidth: 140 }}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <Button
          startIcon={<Iconify icon="mdi:file-document-outline" />}
          color="error"
          variant="contained"
        >
          Generate Report
        </Button>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'time', label: 'Time' },
          { id: 'teacher', label: 'Teacher' },
          { id: 'subject', label: 'Subjects' },
        ]}
        data={[
          {
            time: '05 : 10',
            teacher: 'Riya',
            subject: 'Plants',
          },
          {
            time: '05 : 10',
            teacher: 'Riya',
            subject: 'Plants',
          },
          {
            time: '05 : 10',
            teacher: 'Riya',
            subject: 'Plants',
          },
          {
            time: '05 : 10',
            teacher: 'Riya',
            subject: 'Plants',
          },
        ]}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button variant="contained" color="primary" startIcon={<Description />}>
          Export as PDF
        </Button>
        <Button variant="contained" color="error" startIcon={<Iconify icon="mdi:file-excel" />}>
          Export as Excel
        </Button>
      </Box>
    </Box>
  );
};

export default Reports;
