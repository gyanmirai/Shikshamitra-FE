import React from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs/custom-tabs';
import {
  Tab,
  Box,
  List,
  Chip,
  Avatar,
  ListItem,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

interface Birthday {
  id: number;
  name: string;
  age: number;
  date: string;
  image: string;
}

interface TimeOffRequest {
  id: number;
  name: string;
  date: string;
  reason: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
}

interface WhatsNewInMonthProps {
  birthdays: Birthday[];
  timeOffRequests: TimeOffRequest[];
  events: Event[];
}

const TABS = [
  {
    value: 'timesoff',
    label: 'Times Off',
    icon: <Iconify icon="pepicons-pencil:rewind-time-off" />,
  },
  { value: 'birthday', label: 'Birthday', icon: <Iconify icon="arcticons:ebobirthday" /> },
  { value: 'event', label: 'Event', icon: <Iconify icon="material-symbols-light:event" /> },
];

const BirthdayComponent: React.FC<{ birthdays: Birthday[] }> = ({ birthdays }) => {
  const today = new Date().toISOString().slice(5, 10);
  return (
    <Box>
      {birthdays.map((person) => {
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

const TimesOffComponent: React.FC<{ timeOffRequests: TimeOffRequest[] }> = ({
  timeOffRequests,
}) => {
  const todayDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');

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

const EventComponent: React.FC<{ events: Event[] }> = ({ events }) => (
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

const WhatsNewInMonthComponent: React.FC<WhatsNewInMonthProps> = ({
  birthdays,
  timeOffRequests,
  events,
}) => {
  const tabs = useTabs('timesoff');

  const getColor = (tab: string) => {
    if (tab === 'timesoff') {
      return `red`;
    }
    if (tab === 'birthday') {
      return `blue`;
    }
    if (tab === 'event') {
      return 'green';
    }
    return 'default';
  };

  return (
    <>
      <Typography variant="h6" fontWeight={600} mb={2}>{`What's On This Month?`}</Typography>
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        slotProps={{ tab: { px: 0 } }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            icon={tab.icon}
            value={tab.value}
            label={
              <Box display="flex" alignItems="center">
                <Typography variant="body1">{tab.label}</Typography>
                <Chip
                  label="100"
                  size="small"
                  sx={{
                    backgroundColor: 'white',
                    ml: 1,
                    fontSize: '11px',
                    color: getColor(tab.value),
                  }}
                />
              </Box>
            }
          />
        ))}
      </CustomTabs>
      <Scrollbar sx={{ height: '500px', width: '500px', overflowY: 'auto' }}>
        <Box mt={2}>
          {tabs.value === 'timesoff' && <TimesOffComponent timeOffRequests={timeOffRequests} />}
          {tabs.value === 'birthday' && <BirthdayComponent birthdays={birthdays} />}
          {tabs.value === 'event' && <EventComponent events={events} />}
        </Box>
      </Scrollbar>
    </>
  );
};

export default WhatsNewInMonthComponent;
