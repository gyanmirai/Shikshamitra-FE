import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Event {
  id: string;
  eventTitle: string;
  eventDate: Dayjs;
  eventTime: Dayjs;
  eventSummary: string;
}

const eventTableData: Event[] = [
  {
    id: '1',
    eventTitle: 'Annual Sports Day',
    eventDate: dayjs('2024-11-10'),
    eventTime: dayjs('10:00'),
    eventSummary: 'A day filled with sports activities and competitions among students.',
  },
  {
    id: '2',
    eventTitle: 'Science Exhibition',
    eventDate: dayjs('2024-11-15'),
    eventTime: dayjs('09:00'),
    eventSummary: 'Exhibition showcasing science projects and models prepared by students.',
  },
  {
    id: '3',
    eventTitle: 'Art Competition',
    eventDate: dayjs('2024-11-20'),
    eventTime: dayjs('14:00'),
    eventSummary: 'An art competition encouraging creativity among students.',
  },
  {
    id: '4',
    eventTitle: 'Parent-Teacher Meeting',
    eventDate: dayjs('2024-12-05'),
    eventTime: dayjs('11:00'),
    eventSummary: 'A meeting for parents and teachers to discuss student progress.',
  },
  {
    id: '5',
    eventTitle: 'Music Concert',
    eventDate: dayjs('2024-12-15'),
    eventTime: dayjs('12:30'),
    eventSummary: 'A concert featuring performances by students in the school band and choir.',
  },
];

const EventsArchieves = (props: TabComponentType) => {
  const viewEventSummaryDialog = useBoolean();
  const [event, setEvent] = useState<any | null>(null);

  const handleCloseDialog = () => {
    viewEventSummaryDialog.onFalse();
    setEvent(null);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Archieves Events</Typography>
      </Box>

      <CustomizableTable
        columns={[
          { id: 'eventTitle', label: 'Event Title' },
          {
            id: 'eventDate',
            label: 'Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'eventTime',
            label: 'Time',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        viewEventSummaryDialog.onTrue();
                        setEvent(row);
                      }}
                    >
                      <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
                      View Summary
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={eventTableData}
      />
      <CustomDialog
        title={event && `${event.eventTitle}`}
        open={viewEventSummaryDialog.value}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        {event && (
          <Box sx={{ p: 2 }}>
            <Scrollbar sx={{ height: '100px' }}>
              <Box display="flex" flexDirection="column">
                <Typography variant="body1">{event.eventSummary}</Typography>
              </Box>
            </Scrollbar>
          </Box>
        )}
      </CustomDialog>
    </Box>
  );
};

export default EventsArchieves;
