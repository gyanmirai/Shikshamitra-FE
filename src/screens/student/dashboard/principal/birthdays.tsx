import React from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CalendarView } from 'src/sections/calendar/view';
import { useGetStudentDashboardSummaryQuery } from 'src/redux/student';
import { Box, Card, Stack, Button, Avatar, Divider, CardHeader, Typography } from '@mui/material';

const PrincipalBirthdays = () => {
  const viewCalendarDialog = useBoolean();
  const { data: summary } = useGetStudentDashboardSummaryQuery(undefined);
  const birthdayRows = [
    ...(summary?.todaysBirthdays || []).map((student: any) => ({
      ...student,
      id: `${student.name}-today`,
      date: 'Today',
    })),
    ...(summary?.upcomingBirthdays || []).map((student: any) => ({
      ...student,
      id: `${student.name}-${student.dateLabel || 'upcoming'}`,
      date: student.dateLabel || '-',
    })),
  ];

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:cake-variant" width={24} color="success.main" />
              <Typography variant="h6">Birthdays</Typography>
            </Stack>
          }
          subheader="Today's Birthdays"
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View All Today&apos;s Birthday
            </Button>
          }
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          {birthdayRows.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No birthdays found.
            </Typography>
          )}
          {birthdayRows.map((student) => (
            <Box
              key={student.id}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'success.lighter',
                    color: 'success.main',
                    fontWeight: 'bold',
                  }}
                >
                  {student.name?.[0] || 'S'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{student.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {student.className || '-'}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="subtitle2" sx={{ color: 'success.main' }}>
                {student.date}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider />
        <Box sx={{ p: 2, textAlign: 'right' }}>
          <Button
            size="small"
            color="inherit"
            onClick={viewCalendarDialog.onTrue}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
          >
            View Calendar View
          </Button>
        </Box>
      </Card>

      <CustomDialog
        maxWidth="md"
        open={viewCalendarDialog.value}
        handleClose={viewCalendarDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Student Birthdays</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View and manage student birthdays for today and upcoming dates"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CalendarView />
      </CustomDialog>
    </>
  );
};

export default PrincipalBirthdays;
