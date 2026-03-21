import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTabs } from 'src/hooks/useTabs';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs/custom-tabs';
import {
  Tab,
  Box,
  List,
  Chip,
  Stack,
  Avatar,
  ListItem,
  Typography,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'timesoff',
    label: 'Time Off',
    icon: <Iconify icon="pepicons-pencil:rewind-time-off" width={20} />,
    color: 'error',
  },
  {
    value: 'birthday',
    label: 'Birthdays',
    icon: <Iconify icon="arcticons:ebobirthday" width={20} />,
    color: 'info',
  },
  {
    value: 'event',
    label: 'Events',
    icon: <Iconify icon="material-symbols-light:event" width={20} />,
    color: 'success',
  },
];

// ----------------------------------------------------------------------

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <Stack
    spacing={2}
    alignItems="center"
    justifyContent="center"
    sx={{ height: 300, textAlign: 'center', color: 'text.secondary' }}
  >
    <Iconify icon={icon} width={64} sx={{ opacity: 0.24 }} />
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2">{description}</Typography>
    </Box>
  </Stack>
);

const BirthdayComponent: React.FC<{ birthdays: Birthday[] }> = ({ birthdays }) => {
  const theme = useTheme();
  const today = new Date().toISOString().slice(5, 10);

  if (!birthdays?.length) {
    return (
      <EmptyState
        icon="arcticons:ebobirthday"
        title="No Birthdays"
        description="No birthdays this month."
      />
    );
  }

  return (
    <List disablePadding>
      {birthdays.map((person) => {
        const isToday = person.date.slice(5, 10) === today;
        return (
          <ListItem
            key={person.id}
            sx={{
              py: 2,
              px: 2.5,
              borderRadius: 1.5,
              mb: 1,
              bgcolor: isToday ? varAlpha(theme.palette.primary.mainChannel, 0.08) : 'transparent',
              '&:hover': {
                bgcolor: varAlpha(theme.palette.action.activeChannel, 0.08),
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={person.image}
                alt={person.name}
                sx={{
                  width: 48,
                  height: 48,
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle2">{person.name}</Typography>
                  {isToday && (
                    <Chip
                      label="Today!"
                      size="small"
                      color="primary"
                      variant="soft"
                      sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                    />
                  )}
                </Stack>
              }
              secondary={`Turning ${person.age} • ${person.date}`}
              secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary', mt: 0.5 }}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

const TimesOffComponent: React.FC<{ timeOffRequests: TimeOffRequest[] }> = ({
  timeOffRequests,
}) => {
  const todayDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');

  if (!timeOffRequests?.length) {
    return (
      <EmptyState
        icon="pepicons-pencil:rewind-time-off"
        title="No Time Off Requests"
        description="Everyone is present this month."
      />
    );
  }

  return (
    <List disablePadding>
      {timeOffRequests.map((request) => {
        const isToday = request.date === todayDate;
        return (
          <ListItem
            key={request.id}
            sx={{
              py: 2,
              px: 2.5,
              borderRadius: 1.5,
              mb: 1,
              '&:hover': {
                bgcolor: (theme) => varAlpha(theme.palette.action.activeChannel, 0.08),
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.16),
                  color: 'error.main',
                }}
              >
                {request.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={request.name}
              secondary={
                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {request.date}
                  </Typography>
                  <Box
                    sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {request.reason}
                  </Typography>
                </Stack>
              }
              primaryTypographyProps={{ variant: 'subtitle2', fontWeight: isToday ? 700 : 600 }}
            />
            {isToday && (
              <Chip label="Today" color="error" size="small" variant="soft" sx={{ ml: 1 }} />
            )}
          </ListItem>
        );
      })}
    </List>
  );
};

const EventComponent: React.FC<{ events: Event[] }> = ({ events }) => {
  if (!events?.length) {
    return (
      <EmptyState
        icon="material-symbols-light:event"
        title="No Events"
        description="No events scheduled for this month."
      />
    );
  }

  return (
    <List disablePadding>
      {events.map((event) => (
        <ListItem
          key={event.id}
          sx={{
            py: 2,
            px: 2.5,
            borderRadius: 1.5,
            mb: 1,
            '&:hover': {
              bgcolor: (theme) => varAlpha(theme.palette.action.activeChannel, 0.08),
            },
          }}
        >
          <ListItemAvatar>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.16),
                color: 'success.main',
              }}
            >
              <Iconify icon="material-symbols-light:event" width={24} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={event.title}
            secondary={event.date}
            primaryTypographyProps={{ variant: 'subtitle2' }}
            secondaryTypographyProps={{ variant: 'caption', mt: 0.5 }}
          />
        </ListItem>
      ))}
    </List>
  );
};

// ----------------------------------------------------------------------

const WhatsNewInMonthComponent: React.FC<WhatsNewInMonthProps> = ({
  birthdays,
  timeOffRequests,
  events,
}) => {
  const tabs = useTabs('timesoff');

  const getCount = (tab: string) => {
    if (tab === 'timesoff') return timeOffRequests?.length || 0;
    if (tab === 'birthday') return birthdays?.length || 0;
    if (tab === 'event') return events?.length || 0;
    return 0;
  };

  const currentTab = TABS.find((t) => t.value === tabs.value);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6">What&apos;s On This Month?</Typography>

        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              px: 0,
              mr: 0,
              zIndex: 1,
              '&.Mui-selected': {
                color: 'text.primary',
                zIndex: 1,
              },
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  {tab.icon}
                  <Box component="span">{tab.label}</Box>
                  <Chip
                    label={getCount(tab.value)}
                    size="small"
                    variant={tabs.value === tab.value ? 'filled' : 'soft'}
                    color={tab.color as any}
                    sx={{
                      height: 20,
                      borderRadius: '50%',
                      minWidth: 20,
                      px: 0.5,
                      typography: 'caption',
                      fontSize: 11,
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </CustomTabs>
      </Stack>

      <Box sx={{ flexGrow: 1, minHeight: 0, position: 'relative' }}>
        <Scrollbar sx={{ maxHeight: '100%', pb: 2 }}>
          {tabs.value === 'timesoff' && <TimesOffComponent timeOffRequests={timeOffRequests} />}
          {tabs.value === 'birthday' && <BirthdayComponent birthdays={birthdays} />}
          {tabs.value === 'event' && <EventComponent events={events} />}
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default WhatsNewInMonthComponent;
