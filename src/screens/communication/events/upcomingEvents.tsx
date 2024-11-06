import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import {
  Box,
  Button,
  MenuList,
  MenuItem,
  IconButton,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

interface Event {
  id: string;
  eventTitle: string;
  eventVenue: string;
  organizations: string[];
  className: string;
  eventDate: Dayjs;
  eventTime: string;
  eventType: string;
  audience: string[];
  description: string;
  eventOrganizer: string;
  eventBudget: number;
}

const eventsData: Event[] = [
  {
    id: '1',
    eventTitle: 'Science Exhibition',
    eventVenue: 'Main Hall',
    organizations: ['Secondary', 'Higher Secondary'],
    className: '9',
    eventDate: dayjs('2024-11-10'),
    eventTime: '10:00',
    eventType: 'Academic',
    audience: ['Students', 'Parents'],
    description: 'A science exhibition showcasing various projects from students.',
    eventOrganizer: 'Science Department',
    eventBudget: 5000,
  },
  {
    id: '2',
    eventTitle: 'Annual Sports Day',
    eventVenue: 'Sports Ground',
    organizations: ['Primary', 'Secondary'],
    className: '5',
    eventDate: dayjs('2024-11-15'),
    eventTime: '09:00',
    eventType: 'Sports',
    audience: ['Students', 'Parents', 'Staff'],
    description: 'A day of various sports competitions among classes.',
    eventOrganizer: 'Sports Department',
    eventBudget: 8000,
  },
  {
    id: '3',
    eventTitle: 'Parent-Teacher Meeting',
    eventVenue: 'Classroom A1',
    organizations: ['Primary'],
    className: '3',
    eventDate: dayjs('2024-11-20'),
    eventTime: '14:00',
    eventType: 'Parent Teacher Meeting',
    audience: ['Parents'],
    description: 'Discussion on student performance and upcoming plans for the academic year.',
    eventOrganizer: 'Class Teacher',
    eventBudget: 1000,
  },
  {
    id: '4',
    eventTitle: 'Cultural Fest',
    eventVenue: 'Auditorium',
    organizations: ['Secondary', 'Higher Secondary'],
    className: '10',
    eventDate: dayjs('2024-12-05'),
    eventTime: '11:00',
    eventType: 'Cultural',
    audience: ['Students', 'Parents'],
    description: 'A festival celebrating diverse cultures with performances and exhibitions.',
    eventOrganizer: 'Cultural Committee',
    eventBudget: 7000,
  },
  {
    id: '5',
    eventTitle: 'Workshop on Digital Learning',
    eventVenue: 'Library Hall',
    organizations: ['Higher Secondary'],
    className: '12',
    eventDate: dayjs('2024-12-15'),
    eventTime: '12:30',
    eventType: 'Academic',
    audience: ['Students', 'Staff'],
    description: 'A workshop to enhance digital learning skills among students and teachers.',
    eventOrganizer: 'Cultural Committee',
    eventBudget: 7000,
  },
];
const UpcomingEvents = (props: TabComponentType) => {
  const [event, setEvent] = useState<Event>();
  const [eventTableData, setEventTableData] = useState<Event[]>(eventsData);
  const [deleteEvent, setDeleteEvent] = useState('');
  const openShowDialog = useBoolean();
  const confirm_dialog = useBoolean();

  const handleEyeClick = (id: string) => {
    const data = eventTableData.find((eve: any) => eve.id === id);
    setEvent(data);
    openShowDialog.onTrue();
  };

  const handleDelete = (id: string) => {
    setEventTableData((prevData) => prevData.filter((eve) => eve.id !== id));
    confirm_dialog.onFalse();
  };

  return (
    <Box>
      <CustomizableTable
        columns={[
          { id: 'eventTitle', label: 'Event Title' },
          { id: 'eventType', label: 'Event Type' },
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
            id: 'details',
            label: 'View Details',
            render(value, row) {
              return (
                <IconButton
                  onClick={() => {
                    handleEyeClick(row.id);
                  }}
                >
                  <Iconify icon="mdi:eye" />
                </IconButton>
              );
            },
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
                        //   addAnounsmentDialog.onTrue();
                        //   setEditingAnnouncement(row);
                      }}
                    >
                      <Iconify icon="mdi:pencil" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        confirm_dialog.onTrue();
                        setDeleteEvent(row.id);
                      }}
                    >
                      <Iconify icon="mdi:delete" sx={{ mr: 1 }} />
                      Delete
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
        title="Event Details"
        open={openShowDialog.value}
        handleClose={openShowDialog.onFalse}
        maxWidth="sm"
      >
        {event && (
          <Box p={2}>
            <Typography variant="h6" gutterBottom>
              {event.eventTitle}
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="body1">
                <strong>Organizer:</strong> {event.eventOrganizer}
              </Typography>
              <Typography variant="body1">
                <strong>Date:</strong> {event.eventDate.format('YYYY-MM-DD')}
              </Typography>
              <Typography variant="body1">
                <strong>Time:</strong> {event.eventTime}
              </Typography>
              <Typography variant="body1">
                <strong>Venue:</strong> {event.eventVenue}
              </Typography>
              <Typography variant="body1">
                <strong>Type:</strong> {event.eventType}
              </Typography>
              <Typography variant="body1">
                <strong>Audience:</strong> {event.audience.join(', ')}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {event.description}
              </Typography>
              <Typography variant="body1">
                <strong>Budget:</strong> ${event.eventBudget.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        )}
      </CustomDialog>

      <CustomDialog
        title="Confirm Delete"
        open={confirm_dialog.value}
        handleClose={() => {
          setDeleteEvent('');
          confirm_dialog.onFalse();
        }}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Event?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm_dialog.onFalse} variant="contained" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(deleteEvent);
            }}
            variant="contained"
            color="success"
          >
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default UpcomingEvents;
