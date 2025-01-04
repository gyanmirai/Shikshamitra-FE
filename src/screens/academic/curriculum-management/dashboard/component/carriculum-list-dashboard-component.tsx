'use client';

import type { Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Card,
  alpha,
  Button,
  Switch,
  useTheme,
  Typography,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

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
  const modal = useBoolean();
  const uploadModal = useBoolean();
  const gradeScalingModal = useBoolean();
  const theme = useTheme();

  const { data: classData, isLoading } = useQueryAndMutation({
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
        <Grid item xs={12}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Material for subject</Typography>
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
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'History', 'ENG', 'Social Science', 'Gujarati'],
                series: [{ name: '', data: [43, 33, 22, 37, 10, 16] }],
                colors: [alpha(theme.palette.primary.dark, 0.8)],
                options: {
                  legend: {
                    show: false,
                    position: 'top',
                  },
                },
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
