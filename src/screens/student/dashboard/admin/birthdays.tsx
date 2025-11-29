import React from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CalendarView } from 'src/sections/calendar/view';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Avatar,
  Divider,
  CardHeader,
  Typography,
} from '@mui/material';

const birthdays = [
  {
    id: 1,
    name: 'Arjun Sharma',
    class: '5A',
    date: 'Today',
    isToday: true,
    initials: 'AS',
    color: 'primary.main',
    bgColor: 'primary.lighter',
  },
  {
    id: 2,
    name: 'Priya Patel',
    class: '5A',
    date: 'Tomorrow',
    isToday: false,
    initials: 'PP',
    color: 'success.main',
    bgColor: 'success.lighter',
  },
  {
    id: 3,
    name: 'Raj Kumar',
    class: '4B',
    date: 'Dec 29',
    isToday: false,
    initials: 'RK',
    color: 'info.main',
    bgColor: 'info.lighter',
  },
  {
    id: 4,
    name: 'Meera Singh',
    class: '3C',
    date: 'Dec 30',
    isToday: false,
    initials: 'MS',
    color: 'warning.main',
    bgColor: 'warning.lighter',
  },
];

const Birthdays = () => {
  // Boolean state to control calendar dialog visibility
  const viewCalendarDialog = useBoolean();

  return (
    <>
      <Card>
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="mdi:cake-variant" width={24} color="primary.main" />
              <Typography variant="h6">Birthdays</Typography>
            </Stack>
          }
          subheader="Upcoming Birthdays"
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
            >
              View All
            </Button>
          }
        />
        <Stack spacing={2} sx={{ p: 3 }}>
          {birthdays.map((student) => (
            <Box
              key={student.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) =>
                  student.isToday
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: student.isToday
                  ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%)'
                  : 'transparent',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: student.isToday ? 4 : 2,
                },
                '&::before': student.isToday
                  ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background:
                        'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                      animation: 'shimmer 3s infinite',
                    }
                  : {},
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' },
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      bgcolor: student.bgColor,
                      color: student.color,
                      fontWeight: 'bold',
                      width: student.isToday ? 56 : 48,
                      height: student.isToday ? 56 : 48,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {student.initials}
                  </Avatar>
                  {student.isToday && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        animation: 'bounce 2s infinite',
                        '@keyframes bounce': {
                          '0%, 100%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-10px)' },
                        },
                      }}
                    >
                      <Iconify icon="noto:party-popper" width={24} />
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: student.isToday ? 700 : 600,
                      fontSize: student.isToday ? '1rem' : '0.875rem',
                    }}
                  >
                    {student.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Class {student.class}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {student.isToday ? (
                  <Chip
                    label="🎉 Today"
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                      },
                    }}
                  />
                ) : (
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    {student.date}
                  </Typography>
                )}
                <Iconify icon="mdi:cake-variant" width={20} color={student.color} />
              </Stack>
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
            View Calendar
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

export default Birthdays;
