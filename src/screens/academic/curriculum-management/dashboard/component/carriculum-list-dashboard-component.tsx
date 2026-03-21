'use client';

import type { Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  Typography,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

const curriculumInitialData = [
  {
    id: 1,
    curriculumName: 'First Grade Curriculum',
    className: '1',
    subjects: 4, // Count of subjects directly
    lastUpdated: dayjs('2024-10-01'), // Example date
    status: 'Unpublish',
  },
  {
    id: 2,
    curriculumName: 'Second Grade Curriculum',
    className: '2',
    subjects: 4, // Count of subjects directly
    lastUpdated: dayjs('2024-09-15'),
    status: 'Publish',
  },
  {
    id: 3,
    curriculumName: 'Third Grade Curriculum',
    className: '3',
    subjects: 4, // Count of subjects directly
    lastUpdated: dayjs('2024-08-20'),
    status: 'Unpublish',
  },
];

const CarriculumListDashboardComponent = (props: TabComponentType) => {
  const theme = useTheme();

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [curriculumTableData, setCurriculumTableData] = useState<any[]>(curriculumInitialData);
  const [classes, setClasses] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: number;
    newValue: string;
  } | null>(null);
  const confirmPublishDialog = useBoolean();

  const handleStatusChange = (id: number, value: string) => {
    setPendingStatusChange({ id, newValue: value === 'Publish' ? 'Unpublish' : 'Publish' });
    confirmPublishDialog.onTrue();
  };

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      setCurriculumTableData((curriculum) =>
        curriculum.map((curr) => (curr.id === id ? { ...curr, status: newValue } : curr))
      );
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleCloseDialog = () => {
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  useEffect(() => {
    if (!classes) {
      const firstClass = classData?.items[0];
      setClasses(firstClass?.name);
    }
  }, [classData?.items, classes]);

  return (
    <Box>
      <Typography variant="h6">Curriculum Overview</Typography>
      <CustomizableTable
        tableId="curriculum-table"
        columns={[
          { id: 'curriculumName', label: 'Curriculum Name' },
          { id: 'className', label: 'Class' },
          { id: 'subjects', label: 'Subjects' },
          {
            id: 'lastUpdated',
            label: 'Last Updated',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'status',
            label: 'Publish',
            render: (value: string, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === 'Publish'}
                  onChange={() => handleStatusChange(row.id, value as string)}
                />
              </Box>
            ),
          },
        ]}
        data={curriculumTableData}
      />

      <CustomDialog
        title="Confirm Publication"
        open={confirmPublishDialog.value}
        handleClose={confirmPublishDialog.onFalse}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure to {pendingStatusChange?.newValue === 'Publish' ? 'Publish' : 'Unpublish'}{' '}
            this Subject?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="error">
            Cancel
          </Button>
          <Button onClick={confirmStatusChange} autoFocus variant="contained" color="success">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>

      <Grid container mt={2}>
        <Grid size={12}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Material For Subjects</Typography>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  // formik.setFieldValue('class', selectedClass?.name || '');
                  setClasses(selectedClass?.name);
                }}
                value={classes}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'History', 'ENG', 'Social Science', 'Gujarati'],
                series: [
                  { name: 'PDF', data: [43, 33, 22, 37, 10, 16] },
                  { name: 'Video', data: [20, 45, 15, 65, 80, 5] },
                  { name: 'Audio', data: [10, 30, 29, 24, 8, 65] },
                ],

                colors: [
                  alpha(theme.vars.palette.primary.dark, 0.8),
                  alpha(theme.vars.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
                options: { legend: { show: false, position: 'top' } },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CarriculumListDashboardComponent;
