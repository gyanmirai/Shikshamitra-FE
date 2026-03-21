import React from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Card, Stack, Button, Avatar, Divider, CardHeader, Typography } from '@mui/material';

const birthdays = [
  {
    id: 1,
    name: 'Arjun Sharma',
    class: '5A',
    date: 'Tomorrow',
    initials: 'AS',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 2,
    name: 'Priya Patel',
    class: '5A',
    date: 'Dec 28',
    initials: 'PP',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 3,
    name: 'Raj Kumar',
    class: '4B',
    date: 'Dec 29',
    initials: 'RK',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 4,
    name: 'Meera Singh',
    class: '3C',
    date: 'Dec 30',
    initials: 'MS',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
];

const PrincipalBirthdays = () => {
  // Boolean state to control calendar dialog visibility
  const viewCalendarDialog = useBoolean();

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
          {birthdays.map((student) => (
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
                    bgcolor: student.bgColor,
                    color: student.color,
                    fontWeight: 'bold',
                  }}
                >
                  {student.initials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{student.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {student.class}
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
            onClick={() => {
              viewCalendarDialog.onTrue();
            }}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
          >
            View Calendar View
          </Button>
        </Box>
      </Card>

      <CustomDialog
        maxWidth="md"
        open={viewCalendarDialog.value}
        handleClose={() => {
          viewCalendarDialog.onFalse();
        }}
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
