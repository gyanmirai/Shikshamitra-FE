import type { ICalendarEvent } from 'src/types/calendar';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import Autoplay from 'embla-carousel-autoplay';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import UserHoverProfile from 'src/components/student-popover';
import {
  Carousel,
  useCarousel,
  CarouselDotButtons,
  CarouselArrowBasicButtons,
} from 'src/components/carousel';
import {
  Box,
  Tab,
  Card,
  List,
  Tabs,
  Avatar,
  Button,
  Divider,
  Tooltip,
  ListItem,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import CelebrationsCalendarDialog from './CelebrationsCalendarDialog';

// Mock data generator to ensure we always have data for "Today" and "Upcoming"
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

const HRBirthdaysAndAnniversaries = () => {
  const theme = useTheme();
  const { todaysCelebrations, upcomingCelebrations } = getMockData();
  const [currentTab, setCurrentTab] = React.useState('birthday');
  const [openCalendar, setOpenCalendar] = useState(false);

  const carousel = useCarousel({ loop: true }, [
    Autoplay({ playOnInit: true, delay: 3000, stopOnMouseEnter: true }),
  ]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  const filteredTodays = todaysCelebrations.filter((item) =>
    currentTab === 'birthday' ? item.type === 'Birthday' : item.type === 'Work Anniversary'
  );

  const filteredUpcoming = upcomingCelebrations.filter((item) =>
    currentTab === 'birthday' ? item.type === 'Birthday' : item.type === 'Work Anniversary'
  );

  // Transform mock data to calendar events
  const getCalendarEvents = (): ICalendarEvent[] => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const events: ICalendarEvent[] = [];

    // Helper to create date object from "Month Day" string
    const parseDate = (dateStr: string) => {
      const [month, day] = dateStr.split(' ');
      // Simple mapping for month names to index
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
      const monthIndex = months.findIndex((m) => m === month);

      if (monthIndex !== -1) {
        const date = new Date(currentYear, monthIndex, parseInt(day, 10));
        return date.toISOString(); // Return ISO string
      }
      return null;
    };

    // Add today's celebrations
    todaysCelebrations.forEach((item) => {
      events.push({
        id: item.id.toString(),
        title: `${item.name} (${item.type})`,
        start: today.toISOString(), // Use ISO string
        end: today.toISOString(),
        color: item.type === 'Birthday' ? theme.palette.secondary.main : theme.palette.info.main,
        allDay: true,
        description: item.role,
        extendedProps: {
          type: item.type,
          age: item.age,
          years: item.years,
        },
      } as any); // Type assertion needed due to strict ICalendarEvent definition vs FullCalendar flexibility
    });

    // Add upcoming celebrations
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
            allDay: true,
            description: item.role,
            extendedProps: {
              type: item.type,
              age: item.age,
              years: item.years,
            },
          } as any);
        }
      }
    });

    return events;
  };

  return (
    <>
      <Card
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: theme.customShadows.z4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify
              icon="mdi:party-popper"
              width={32}
              height={32}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
              Celebrations
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<Iconify icon="mdi:calendar-month" />}
            onClick={() => setOpenCalendar(true)}
            sx={{ textTransform: 'none' }}
          >
            View Calendar
          </Button>
        </Box>

        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            mb: 3,
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 'bold',
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
            icon={<Iconify icon="mdi:cake-variant" width={20} />}
            iconPosition="start"
          />
          <Tab
            value="anniversary"
            label="Anniversaries"
            icon={<Iconify icon="mdi:medal" width={20} />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}
          >
            TODAY&apos;S SPECIAL
          </Typography>

          {filteredTodays.length > 0 ? (
            <Card
              sx={{
                bgcolor: 'background.neutral',
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {filteredTodays.length > 1 && (
                <>
                  <CarouselDotButtons
                    scrollSnaps={carousel.dots.scrollSnaps}
                    selectedIndex={carousel.dots.selectedIndex}
                    onClickDot={carousel.dots.onClickDot}
                    sx={{
                      bottom: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      position: 'absolute',
                      color: 'primary.main',
                      zIndex: 9,
                    }}
                  />
                  <CarouselArrowBasicButtons
                    {...carousel.arrows}
                    options={carousel.options}
                    sx={{
                      top: 8,
                      right: 8,
                      position: 'absolute',
                      color: 'text.primary',
                      zIndex: 9,
                    }}
                  />
                </>
              )}

              <Carousel carousel={carousel}>
                {filteredTodays.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 3,
                      pb: filteredTodays.length > 1 ? 5 : 3, // Space for dots
                    }}
                  >
                    <UserHoverProfile
                      avatarComp={
                        <Avatar
                          src={item.avatarUrl}
                          alt={item.name}
                          sx={{
                            width: 64,
                            height: 64,
                            mr: 2.5,
                            cursor: 'pointer',
                            border: `2px solid ${theme.palette.background.paper}`,
                            boxShadow: theme.customShadows.z8,
                          }}
                        />
                      }
                      user={{
                        name: item.name,
                        avatarUrl: item.avatarUrl,
                        role: item.role,
                        email: item.email,
                        // Add other required props with dummy data if needed by UserHoverProfile
                        class: '',
                        division: '',
                        board: '',
                        medium: '',
                        organization: 'Shiksha Mitra',
                      }}
                    />

                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', color: 'text.primary' }}
                      >
                        {item.name}
                      </Typography>
                      <Label
                        variant="soft"
                        color={item.type === 'Birthday' ? 'secondary' : 'info'}
                        startIcon={
                          <Iconify
                            icon={item.type === 'Birthday' ? 'mdi:cake-variant' : 'mdi:medal'}
                          />
                        }
                        sx={{ mt: 0.5 }}
                      >
                        {item.type === 'Birthday'
                          ? `Turning ${item.age}`
                          : `${item.years} Year Anniversary`}
                      </Label>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
                      >
                        {item.role}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Carousel>
            </Card>
          ) : (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No {currentTab === 'birthday' ? 'birthdays' : 'anniversaries'} today
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}
          >
            UPCOMING THIS MONTH
          </Typography>

          <Scrollbar sx={{ maxHeight: 280 }}>
            <List disablePadding>
              {filteredUpcoming.length > 0 ? (
                filteredUpcoming.map((item) => (
                  <Tooltip title={`${item.type} on ${item.date}`} key={item.id} placement="left">
                    <ListItem
                      disablePadding
                      sx={{
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateY(-2px)',
                          boxShadow: theme.customShadows.z4,
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <UserHoverProfile
                          avatarComp={
                            <Avatar
                              src={item.avatarUrl}
                              alt={item.name}
                              sx={{ width: 48, height: 48, cursor: 'pointer' }}
                            />
                          }
                          user={{
                            name: item.name,
                            avatarUrl: item.avatarUrl,
                            role: item.role,
                            email: item.email,
                            class: '',
                            division: '',
                            board: '',
                            medium: '',
                            organization: 'Shiksha Mitra',
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.role}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Label
                          variant="soft"
                          color={item.type === 'Birthday' ? 'secondary' : 'info'}
                          startIcon={
                            <Iconify
                              icon={item.type === 'Birthday' ? 'mdi:cake-variant' : 'mdi:medal'}
                            />
                          }
                          sx={{ mb: 0.5 }}
                        >
                          {item.date}
                        </Label>
                        <Typography variant="caption" display="block" color="text.disabled">
                          {item.type === 'Birthday' ? `Turning ${item.age}` : `${item.years} Years`}
                        </Typography>
                      </Box>
                    </ListItem>
                  </Tooltip>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming {currentTab === 'birthday' ? 'birthdays' : 'anniversaries'} this
                    month
                  </Typography>
                </Box>
              )}
            </List>
          </Scrollbar>
        </Box>
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
