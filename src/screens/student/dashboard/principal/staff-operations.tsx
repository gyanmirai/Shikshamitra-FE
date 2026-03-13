import { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fPercent } from 'src/utils/format-number';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Grid, Stack, Avatar, CardHeader, Typography } from '@mui/material';

import ClassDivisionFilter from './class-division-filter';

const PrincipalStaffOperations = () => {
  // 1. Teacher Attendance & Performance Overview
  const teacherPerformance = [
    { id: '1', name: 'R. K. Sharma', subject: 'Maths', attendance: 98, rating: 4.8, avatar: '' },
    { id: '2', name: 'Anjali Verma', subject: 'Science', attendance: 95, rating: 4.5, avatar: '' },
    { id: '3', name: 'S. Gupta', subject: 'English', attendance: 85, rating: 3.9, avatar: '' },
    { id: '4', name: 'M. Singh', subject: 'History', attendance: 92, rating: 4.2, avatar: '' },
  ];

  const TABLE_COLUMNS = useMemo(
    () => [
      {
        id: 'name',
        label: 'Teacher',
        isSort: true,
        render: (value: any, row: any) => (
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar src={row.avatar} alt={value} sx={{ width: 32, height: 32 }} />
            <Typography variant="subtitle2">{value}</Typography>
          </Stack>
        ),
      },
      { id: 'subject', label: 'Subject', isSort: true },
      {
        id: 'attendance',
        label: 'Attendance',
        isSort: true,
        render: (value: any) => (
          <Typography
            variant="body2"
            sx={{
              color: value < 90 ? 'error.main' : 'success.main',
              fontWeight: 600,
            }}
          >
            {fPercent(value)}
          </Typography>
        ),
      },
      {
        id: 'rating',
        label: 'Rating',
        isSort: true,
        render: (value: any) => `${value} / 5`,
      },
      {
        id: 'status',
        label: 'Status',
        render: (value: any, row: any) => {
          let statusLabel = 'Excellent';
          let statusColor: 'success' | 'warning' | 'error' = 'success';

          if (row.attendance < 90) {
            statusLabel = 'Low Attendance';
            statusColor = 'error';
          } else if (row.rating < 4) {
            statusLabel = 'Needs Improvement';
            statusColor = 'warning';
          }

          return (
            <Label color={statusColor} variant="soft">
              {statusLabel}
            </Label>
          );
        },
      },
    ],
    []
  );

  return (
    <Grid container sx={{ mb: 1 }}>
      <Grid size={{ xs: 12 }}>
        <Card sx={{ p: 1 }}>
          <CardHeader
            title={
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Box component="span">
                  Teacher Performance Overview
                  <CustomTooltip
                    title="Overview of teacher performance based on attendance records and student feedback ratings."
                    arrow
                    placement="top"
                  >
                    <Iconify
                      icon="eva:info-outline"
                      width={18}
                      sx={{ color: 'text.disabled', cursor: 'pointer', ml: 1 }}
                    />
                  </CustomTooltip>
                </Box>
                <ClassDivisionFilter />
              </Stack>
            }
            subheader="Attendance & Student Ratings"
            sx={{ mb: 1, ml: -2, mt: -2 }}
          />
          <CustomizableTable
            tableId="teacher_performance_table"
            columns={TABLE_COLUMNS}
            data={teacherPerformance}
            isSearch
            isPagination
          />
        </Card>
      </Grid>
    </Grid>
  );
};

export default PrincipalStaffOperations;
