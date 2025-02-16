import React from 'react';

import {
  Tab,
  Box,
  List,
  Avatar,
  ListItem,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs/custom-tabs';

const TABS = [
  {
    value: 'timesoff',
    label: 'Times Off',
    icon: <Iconify icon="pepicons-pencil:rewind-time-off" />,
  },
  { value: 'birthday', label: 'Birthday', icon: <Iconify icon="arcticons:ebobirthday" /> },
  { value: 'event', label: 'Event', icon: <Iconify icon="material-symbols-light:event" /> },
];

const BirthdayComponent = () => {
  const today = new Date().toISOString().slice(5, 10); // Format: MM-DD
  const birthdays: any = [
    { id: 1, name: 'Alice Johnson', age: 21, date: '2025-02-14', image: '/images/alice.jpg' },
    { id: 2, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 32, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 22, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
    { id: 12, name: 'Bob Smith', age: 25, date: '2025-02-20', image: '/images/bob.jpg' },
  ];
  return (
    <Box>
      {birthdays.map((person: any) => {
        const isToday = person.date.slice(5, 10) === today;
        return (
          <Box key={person.id} display="flex" alignItems="center" gap={2} p={2}>
            <Avatar src={person.image} alt={person.name} />
            <Box>
              <Typography variant="h6">{person.name}</Typography>
              <Typography variant="body2">Turning {person.age} </Typography>
              {isToday && (
                <Typography variant="caption" color="error">
                  🎉 Today!
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
const timeOffRequests = [
  { id: 1, name: 'John Doe', date: '14-02-2025', reason: 'Sick Leave' },
  { id: 2, name: 'Jane Smith', date: '15-02-2025', reason: 'Family Emergency' },
];
const getTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

const TimesOffComponent = () => {
  const todayDate = getTodayDate();

  return (
    <Box>
      {timeOffRequests.length > 0 ? (
        <List>
          {timeOffRequests.map((request) => {
            const isToday = request.date === todayDate;

            return (
              <ListItem key={request.id} sx={{ bgcolor: 'transparent' }}>
                <ListItemAvatar>
                  <Avatar>{request.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={request.name}
                  secondary={`${request.date} - ${request.reason}`}
                  primaryTypographyProps={{ fontWeight: isToday ? 'bold' : 'normal' }}
                />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography>No time off requests for this month.</Typography>
      )}
    </Box>
  );
};
const events = [
  { id: 1, title: 'Parent Meeting', date: '14-02-2025' },
  { id: 2, title: 'Project Deadline', date: '15-02-2025' },
];

const EventComponent = () => (
  <Box>
    {events.length > 0 ? (
      <List>
        {events.map((event) => (
          <ListItem key={event.id}>
            <ListItemText primary={event.title} secondary={event.date} />
          </ListItem>
        ))}
      </List>
    ) : (
      <Typography>No events scheduled for this month.</Typography>
    )}
  </Box>
);
const WhatsNewInMonthComponent = () => {
  const tabs = useTabs('timesoff');

  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={2}>{`What's On In February ? `}</Typography>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        slotProps={{ tab: { px: 0 } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} icon={tab.icon} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>
      <Scrollbar sx={{ height: '500px', width: '500px', overflowY: 'auto' }}>
        <Box mt={2}>
          {tabs.value === 'timesoff' && <TimesOffComponent />}
          {tabs.value === 'birthday' && <BirthdayComponent />}
          {tabs.value === 'event' && <EventComponent />}
        </Box>
      </Scrollbar>
    </>
  );
};

export default WhatsNewInMonthComponent;
