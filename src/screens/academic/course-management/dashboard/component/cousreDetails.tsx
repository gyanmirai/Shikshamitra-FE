'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { Label } from 'src/components/label';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

const CousreDetails = () => {
  const [classes, setClasses] = useState('');
  const [division, setDivision] = useState('');
  const [subject, setSubject] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Grid container spacing={2} mt={2}>
      <Grid size={12}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <CustomSelect
            label="Class"
            options={classData?.items || []}
            labelKey="name"
            valueKey="id"
            onChange={(val) => {
              const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
              // formik.setFieldValue('class', selectedClass?.name || '');
              setClasses(val as string);
              setDivisionOptions(selectedClass?.divisions || []);
            }}
            value={classes}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
          <CustomSelect
            label="Division"
            disabled={!classes}
            labelKey="name"
            valueKey="id"
            options={divisionOptions}
            value={division}
            onChange={(val) => {
              // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
              // formik.setFieldValue('division', selectedDivision?.name || '');
              setDivision(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
          <CustomSelect
            label="Subject"
            disabled={!division}
            options={[
              { value: 'math', label: 'Math' },
              { value: 'science', label: 'Science' },
              { value: 'english', label: 'English' },
            ]}
            value={subject}
            onChange={(val) => {
              // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
              // formik.setFieldValue('division', selectedDivision?.name || '');
              setSubject(val as string);
            }}
            formControlProps={{
              sx: { width: '100%', maxWidth: '150px' },
            }}
          />
        </Box>
        <CustomizableTable
          tableId="course-details-table"
          columns={[
            { id: 'chapterName', label: 'Chapter Name' },
            { id: 'startDate', label: 'Start Date' },
            { id: 'endDate', label: 'End Date' },
            { id: 'teacherName', label: 'Teacher Name' },
            { id: 'totalResources', label: 'Total Resources' },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label
                    variant="soft"
                    color={
                      value === 'Pending'
                        ? 'error'
                        : value === 'Completed'
                          ? 'success'
                          : value === 'Ongoing'
                            ? 'warning'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
          ]}
          data={[
            {
              chapterName: 'Introduction to Algebra',
              startDate: '01-02-2024',
              endDate: '15-02-2024',
              teacherName: 'Mr. Sharma',
              totalResources: 5,
              status: 'Ongoing',
            },
            {
              chapterName: 'Newton’s Laws of Motion',
              startDate: '20-01-2024',
              endDate: '05-02-2024',
              teacherName: 'Ms. Kapoor',
              totalResources: 8,
              status: 'Completed',
            },
            {
              chapterName: 'World War II',
              startDate: '10-02-2024',
              endDate: '25-02-2024',
              teacherName: 'Mr. Mehta',
              totalResources: 4,
              status: 'Pending',
            },
            {
              chapterName: 'Basics of Programming',
              startDate: '25-01-2024',
              endDate: '10-02-2024',
              teacherName: 'Ms. Reddy',
              totalResources: 6,
              status: 'Completed',
            },
            {
              chapterName: 'Chemical Reactions',
              startDate: '05-02-2024',
              endDate: '20-02-2024',
              teacherName: 'Dr. Singh',
              totalResources: 7,
              status: 'Ongoing',
            },
          ]}
        />
      </Grid>
    </Grid>
  );
};

export default CousreDetails;
