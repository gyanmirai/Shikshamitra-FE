'use client';

import type { ICalendarEvent } from 'src/types/calendar';

import confetti from 'canvas-confetti';
import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Button,
  Avatar,
  Divider,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material';

import CelebrationsCalendarDialog from './CelebrationsCalendarDialog';

// -----------------------------------------------------------------------

const getMockData = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentDay = today.getDate();

  const todaysCelebrations = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Software Engineer',
      type: 'Birthday',
      age: 28,
      avatarUrl: '/assets/images/avatars/avatar_1.jpg',
      email: 'john.doe@example.com',
    },
    {
      id: 2,
      name: 'Alice Smith',
      role: 'HR Manager',
      type: 'Work Anniversary',
      years: 5,
      avatarUrl: '/assets/images/avatars/avatar_2.jpg',
      email: 'alice.smith@example.com',
    },
  ];

  const upcomingCelebrations = [
    {
      id: 3,
      name: 'Robert Brown',
      role: 'Product Designer',
      type: 'Birthday',
      date: `${currentMonth} ${currentDay + 2}`,
      age: 30,
      avatarUrl: '/assets/images/avatars/avatar_3.jpg',
      email: 'robert.brown@example.com',
    },
    {
      id: 4,
      name: 'Emily Davis',
      role: 'Marketing Specialist',
      type: 'Work Anniversary',
      date: `${currentMonth} ${currentDay + 5}`,
      years: 2,
      avatarUrl: '/assets/images/avatars/avatar_4.jpg',
      email: 'emily.davis@example.com',
    },
    {
      id: 5,
      name: 'Michael Wilson',
      role: 'Sales Executive',
      type: 'Birthday',
      date: `${currentMonth} ${currentDay + 10}`,
      age: 25,
      avatarUrl: '/assets/images/avatars/avatar_5.jpg',
      email: 'michael.wilson@example.com',
    },
  ];

  return { todaysCelebrations, upcomingCelebrations };
};

// -----------------------------------------------------------------------

const HRBirthdaysAndAnniversaries = () => {
  const theme = useTheme();
  const { todaysCelebrations, upcomingCelebrations } = getMockData();
  const [currentTab, setCurrentTab] = useState('birthday');
  const [wishedIds, setWishedIds] = useState<number[]>([]);
  const [openCalendar, setOpenCalendar] = useState(false);

  const handleWish = (id: number) => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setWishedIds((prev) => [...prev, id]);
  };

  const filteredTodays = todaysCelebrations.filter((item) =>
    currentTab === 'birthday' ? item.type === 'Birthday' : item.type === 'Work Anniversary'
  );

  const filteredUpcoming = upcomingCelebrations.filter((item) =>
    currentTab === 'birthday' ? item.type === 'Birthday' : item.type === 'Work Anniversary'
  );

  const getCalendarEvents = (): ICalendarEvent[] => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const parseDate = (dateStr: string) => {
      const [month, day] = dateStr.split(' ');
      const monthIndex = months.findIndex((m) => m === month);
      if (monthIndex !== -1) {
        return new Date(currentYear, monthIndex, parseInt(day, 10)).toISOString();
      }
      return null;
    };

    const events: ICalendarEvent[] = [];

    todaysCelebrations.forEach((item) => {
      events.push({
        id: item.id.toString(),
        title: `${item.name} (${item.type})`,
        start: today.toISOString(),
        end: today.toISOString(),
        color: item.type === 'Birthday' ? theme.palette.secondary.main : theme.palette.info.main,
        textColor: 'white',
        allDay: true,
        description: item.role,
      } as any);
    });

    upcomingCelebrations.forEach((item) => {
      if (item.date) {
        const dateIso = parseDate(item.date);
        if (dateIso) {
          events.push({
            id: item.id.toString(),
            title: `${item.name} (${item.type})`,
            start: dateIso,
            end: dateIso,
            color:
              item.type === 'Birthday' ? theme.palette.secondary.main : theme.palette.info.main,
            textColor: 'white',
            allDay: true,
            description: item.role,
          } as any);
        }
      }
    });

    return events;
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <CardHeader
          title={
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: -1, ml: -1 }}>
              <Iconify icon="mdi:party-popper" width={24} color="primary.main" />
              <Typography variant="h6">Celebrations</Typography>
              <CustomTooltip
                title="View today's and upcoming birthdays & work anniversaries"
                placement="top"
              >
                <IconButton size="small" sx={{ p: 0 }}>
                  <Iconify
                    icon="solar:info-circle-linear"
                    width={18}
                    sx={{ color: 'text.disabled' }}
                  />
                </IconButton>
              </CustomTooltip>
            </Stack>
          }
          action={
            <Button
              size="small"
              color="inherit"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
              onClick={() => setOpenCalendar(true)}
            >
              View Calendar
            </Button>
          }
          sx={{ flexShrink: 0 }}
        />

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_e, val) => setCurrentTab(val)}
          sx={{
            px: 2,
            mb: 1,
            minHeight: 40,
            flexShrink: 0,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1,
              mr: 1,
              '&.Mui-selected': {
                color: currentTab === 'birthday' ? 'secondary.main' : 'info.main',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: currentTab === 'birthday' ? 'secondary.main' : 'info.main',
            },
          }}
        >
          <Tab
            value="birthday"
            label="Birthdays"
            icon={<Iconify icon="mdi:cake-variant" width={18} />}
            iconPosition="start"
          />
          <Tab
            value="anniversary"
            label="Anniversaries"
            icon={<Iconify icon="mdi:medal" width={18} />}
            iconPosition="start"
          />
        </Tabs>

        {/* Scrollable content */}
        <Scrollbar sx={{ flexGrow: 1 }}>
          <Stack spacing={1} sx={{ p: 1.5 }}>
            {/* Today */}
            {filteredTodays.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 0.5 }}>
                  Today
                </Typography>
                <Stack spacing={1}>
                  {filteredTodays.map((item) => {
                    const isWished = wishedIds.includes(item.id);
                    return (
                      <Box
                        key={item.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: (t) => `1px solid ${t.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          bgcolor: (t: any) =>
                            varAlpha(
                              t.vars?.palette?.primary?.mainChannel ||
                                t.palette.primary.mainChannel ||
                                '',
                              0.16
                            ),
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'transparent',
                            bgcolor: 'background.neutral',
                            transform: 'scale(1.01)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ position: 'relative' }}>
                            <Avatar
                              src={item.avatarUrl}
                              alt={item.name}
                              sx={{ width: 44, height: 44 }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                bgcolor: 'background.paper',
                                borderRadius: '50%',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 1,
                              }}
                            >
                              <Typography variant="caption">
                                {item.type === 'Birthday' ? '🎂' : '🏆'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.role}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CustomTooltip
                            title={isWished ? 'Already wished!' : `Wish ${item.name}`}
                            placement="top"
                          >
                            <Button
                              size="small"
                              variant={isWished ? 'soft' : 'contained'}
                              color={isWished ? 'success' : 'primary'}
                              startIcon={
                                <Iconify
                                  icon={isWished ? 'mdi:check-circle-outline' : 'mdi:gift-outline'}
                                />
                              }
                              onClick={() => !isWished && handleWish(item.id)}
                              sx={{ borderRadius: 3, px: 2 }}
                            >
                              {isWished ? 'Wished!' : 'Wish'}
                            </Button>
                          </CustomTooltip>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {filteredTodays.length === 0 && (
              <Box
                sx={{
                  p: 2.5,
                  textAlign: 'center',
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No {currentTab === 'birthday' ? 'birthdays' : 'anniversaries'} today
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Upcoming */}
            {filteredUpcoming.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, ml: 0.5 }}>
                  Upcoming
                </Typography>
                <Stack spacing={1}>
                  {filteredUpcoming.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'transparent',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'transparent',
                          bgcolor: 'background.neutral',
                          transform: 'scale(1.01)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={item.avatarUrl}
                          alt={item.name}
                          sx={{ width: 44, height: 44 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.role}
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip
                        label={item.date}
                        size="small"
                        color={item.type === 'Birthday' ? 'secondary' : 'info'}
                        variant="soft"
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {filteredUpcoming.length === 0 && (
              <Box sx={{ p: 2.5, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No upcoming {currentTab === 'birthday' ? 'birthdays' : 'anniversaries'} this month
                </Typography>
              </Box>
            )}
          </Stack>
        </Scrollbar>
      </Card>

      <CelebrationsCalendarDialog
        open={openCalendar}
        onClose={() => setOpenCalendar(false)}
        events={getCalendarEvents()}
      />
    </>
  );
};

export default HRBirthdaysAndAnniversaries;
