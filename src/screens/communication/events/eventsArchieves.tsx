'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import eventsArchivesData from 'src/json/communication/events/eventsArchivesData.json';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { IEvent } from './type';

const EventsArchieves = (props: TabComponentType) => {
  // Dialog state to control visibility of event summary dialog
  const viewEventSummaryDialog = useBoolean();
  const [eventTableData, setEventTableData] = useState(eventsArchivesData);
  // State to store the currently selected event details
  const [event, setEvent] = useState<IEvent | null>(null);

  // Handler to close the dialog and reset event state
  const handleCloseDialog = () => {
    viewEventSummaryDialog.onFalse();
    setEvent(null);
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Events Archieves"
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Events' },
          { name: 'Events Archieves' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <CustomizableTable
        tableId="events-archieves-table"
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
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    viewEventSummaryDialog.onTrue();
                    setEvent(row as IEvent);
                  }}
                />
              );
            },
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
                <Typography variant="body1">{event.description}</Typography>
              </Box>
            </Scrollbar>
          </Box>
        )}
      </CustomDialog>
    </Box>
  );
};

export default EventsArchieves;
