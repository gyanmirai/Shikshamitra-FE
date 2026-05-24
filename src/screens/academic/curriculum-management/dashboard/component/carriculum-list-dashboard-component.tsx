'use client';

import type { Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetClassQuery } from 'src/redux/class/classApi';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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
import {
  useGetSubjectAssignmentsQuery,
  usePublishSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

const CarriculumListDashboardComponent = (props: TabComponentType) => {
  const theme = useTheme();

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [classId, setClassId] = useState('');
  const [publishSubjectAssignment] = usePublishSubjectAssignmentMutation();
  const [classes, setClasses] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string;
    newValue: PublishUnpublishStatusType;
  } | null>(null);
  const confirmPublishDialog = useBoolean();

  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classId, page: 1, pageSize: 100 },
    options: { skip: !classId },
  });

  const curriculumTableData = useMemo(() => {
    const items: any[] = assignmentsData?.items ?? assignmentsData?.data?.items ?? [];
    return items.map((item: any) => ({
      id: item.subjectAssignmentId ?? item.id ?? '',
      curriculumName: item.name ?? item.curriculumName ?? `${item.standardName ?? ''} Curriculum`,
      className: item.standardName ?? item.className ?? '',
      subjects: item.subjectCount ?? item.subjects?.length ?? 0,
      lastUpdated: item.updatedAt ?? item.lastModifiedAt ?? item.createdAt ?? new Date(),
      status: item.status ?? PublishUnpublishStatusType.Draft,
    }));
  }, [assignmentsData]);

  const handleStatusChange = (id: string, currentStatus: PublishUnpublishStatusType) => {
    const newStatus =
      currentStatus === PublishUnpublishStatusType.Published
        ? PublishUnpublishStatusType.Draft
        : PublishUnpublishStatusType.Published;
    setPendingStatusChange({ id, newValue: newStatus });
    confirmPublishDialog.onTrue();
  };

  const confirmStatusChange = async () => {
    if (pendingStatusChange) {
      const { id, newValue } = pendingStatusChange;
      try {
        await publishSubjectAssignment({ assignmentId: id, status: newValue }).unwrap();
        shikshaMitraToast.success({
          message: `Curriculum ${
            newValue === PublishUnpublishStatusType.Published ? 'published' : 'unpublished'
          } successfully.`,
        });
      } catch {
        shikshaMitraToast.error({ message: 'Failed to update curriculum status.' });
      }
    }
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  const handleCloseDialog = () => {
    confirmPublishDialog.onFalse();
    setPendingStatusChange(null);
  };

  useEffect(() => {
    if (!classId && classData?.items?.length > 0) {
      const firstClass = classData.items[0];
      setClasses(firstClass?.name ?? '');
      setClassId(firstClass?.id ?? '');
    }
  }, [classData?.items, classId]);

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
