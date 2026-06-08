'use client';

import type { Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
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

import { useCurriculumListDashboard } from '../hooks/useCurriculumListDashboard';

const CarriculumListDashboardComponent = (props: TabComponentType) => {
  const theme = useTheme();
  const {
    classData,
    classId,
    setClassId,
    classes,
    setClasses,
    curriculumTableData,
    isAssignmentsLoading,
    confirmPublishDialog,
    pendingStatusChange,
    handleStatusChange,
    confirmStatusChange,
    handleCloseDialog,
  } = useCurriculumListDashboard();

  /**
   * Memoization Justification:
   * Memoizes table column configurations to prevent useless re-computation
   * and preserves stable Switch checked handlers across render boundaries.
   */
  const columns = useMemo(
    () => [
      { id: 'curriculumName', label: 'Curriculum Name' },
      { id: 'className', label: 'Class' },
      { id: 'subjects', label: 'Subjects' },
      {
        id: 'lastUpdated',
        label: 'Last Updated',
        render: (value: any) => (
          <Typography fontSize="12px" gutterBottom>
            {dayjs(value).format('DD MMM YYYY')}
          </Typography>
        ),
      },
      {
        id: 'status',
        label: 'Publish',
        render: (value: PublishUnpublishStatusType, row: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch
              size="small"
              checked={value === PublishUnpublishStatusType.Published}
              onChange={() => handleStatusChange(row.id, value)}
            />
          </Box>
        ),
      },
    ],
    [handleStatusChange]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">Curriculum Overview</Typography>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          value={classId}
          onChange={(val) => setClassId(val as string)}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
      </Box>
      <CustomizableTable
        tableId="curriculum-table"
        isLoading={isAssignmentsLoading}
        columns={columns}
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
            Are you sure to{' '}
            {pendingStatusChange?.newValue === PublishUnpublishStatusType.Published
              ? 'Publish'
              : 'Unpublish'}{' '}
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
                  setClasses(selectedClass?.name || '');
                }}
                value={classes}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
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
