'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Card, Chip, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import upcomingEventsData from 'src/json/communication/events/upcomingEventsData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddEvent from './addeventForm';
import EventDetailsCard from './components/eventDetailsComponent';

import type { IEvent } from './type';

const UpcomingEvents = (props: TabComponentType) => {
  // State to store the selected event details
  const [event, setEvent] = useState<IEvent>();
  // State to store the event being edited
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  // State to store the list of events
  const [eventTableData, setEventTableData] = useState<IEvent[]>(upcomingEventsData);
  // State to store the ID of event to be deleted
  const [deleteEvent, setDeleteEvent] = useState('');
  // Custom hook for handling show dialog visibility
  const openShowDialog = useBoolean();
  // Custom hook for handling confirmation dialog visibility
  const confirm_dialog = useBoolean();
  // State to control add/edit event form dialog
  const [open, setOpen] = useState(false);

  // Handler for viewing event details
  const handleEyeClick = (id: string) => {
    const data = eventTableData.find((eve: IEvent) => eve.id === id);
    setEvent(data);
    openShowDialog.onTrue();
  };

  // Handler for deleting an event
  const handleDelete = (id: string) => {
    setEventTableData((prevData) => prevData.filter((eve) => eve.id !== id));
    confirm_dialog.onFalse();
  };

  // Handler for submitting event form (both add and edit)
  const handleSubmit = (values: any) => {
    if (editingEvent) {
      setEventTableData((prevData) =>
        prevData.map((eve) =>
          eve.id === editingEvent.id ? { ...values, id: editingEvent.id } : event
        )
      );
    } else {
      const newEvent = {
        ...values,
        id: String(eventTableData.length + 1),
      };
      setEventTableData((prevData) => [...prevData, newEvent]);
    }
    handleCloseDialog();
  };

  // Handler for closing the add/edit event dialog
  const handleCloseDialog = () => {
    setEditingEvent(null);
    setOpen(false);
  };
  return (
    <Box display="flex" flexDirection="column" height="100%">
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Upcoming Events"
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Events' },
              { name: 'Upcoming Events' },
              { name: 'Event Form' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleCloseDialog}
              >
                Back
              </Button>
            }
          />
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <AddEvent
              initialValues={editingEvent}
              onSubmit={handleSubmit}
              isEdit={!!editingEvent}
            />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Upcoming Events"
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Events' },
              { name: 'Upcoming Events' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                startIcon={<Iconify icon="mdi:plus" />}
                variant="contained"
                size="small"
                onClick={() => {
                  setOpen(true);
                }}
              >
                Event
              </Button>
            }
          />
          <CustomizableTable
            tableId="event-table"
            columns={[
              { id: 'eventTitle', label: 'Event Title', minWidth: '180px', align: 'left' },
              { id: 'eventVenue', label: 'Event Venue', minWidth: '180px', align: 'left' },
              { id: 'eventType', label: 'Event Type', minWidth: '180px', align: 'left' },
              {
                id: 'eventStartDate',
                label: 'Start Date',
                minWidth: '180px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'eventEndDate',
                label: 'End Date',
                minWidth: '180px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'audience',
                label: 'Audience',
                render: (value) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((audience: string) => (
                      <Chip
                        key={audience}
                        label={audience}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ),
              },
              {
                id: 'organization',
                label: 'Organizations',
                render: (value) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((org: string) => (
                      <Chip key={org} label={org} size="small" variant="outlined" />
                    ))}
                  </Box>
                ),
              },
              {
                id: 'className',
                label: 'Class',
                render: (value) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((className: string) => (
                      <Chip
                        key={className}
                        label={className}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ),
              },
              { id: 'eventOrganizer', label: 'Event Organizer', minWidth: '200px', align: 'left' },
              { id: 'eventBudget', label: 'Event Budget', minWidth: '180px', align: 'left' },
              {
                id: 'action',
                label: 'Action',
                isSort: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      // actions={(prop) => actions({ ...props, row })}
                      placement="right-top"
                      showEditIcon
                      showDeleteIcon
                      showViewIcon
                      showThreeDots={false}
                      handleEditClick={() => {
                        setOpen(true);
                        setEditingEvent(row as IEvent);
                      }}
                      handleDeleteClick={() => {
                        confirm_dialog.onTrue();
                        setDeleteEvent(row.id);
                      }}
                      handleViewClick={() => {
                        handleEyeClick(row.id);
                      }}
                    />
                  );
                },
              },
            ]}
            data={eventTableData}
          />
        </>
      )}

      <CustomDialog
        title="Event Details"
        open={openShowDialog.value}
        handleClose={openShowDialog.onFalse}
        maxWidth="sm"
      >
        {event && <EventDetailsCard event={event} />}
      </CustomDialog>

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          setDeleteEvent('');
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(deleteEvent);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default UpcomingEvents;
