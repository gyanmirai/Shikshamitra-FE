'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetEventTypeOptionsQuery } from 'src/redux/communication/setting/eventTypeApi';

// Replace with actual API hook when available
import EventTypeForm from './Components/EventTypeForm';
import EventTypeTable from './Components/EventTypeTable';

import type { IEventType } from './type';

const EventTypeCreation = () => {
  // Custom hook to fetch event type data
  const { data: eventTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventTypeOptionsQuery,
  });

  // Dialog control states
  const deleteEventTypeDialog = useBoolean();
  const addEventTypeDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedEventType, setSelectedEventType] = useState<IEventType | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedEventType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addEventTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addEventTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedEventType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Event Type"
        description="Manage event types such as Workshop, Seminar, Sports Event, etc. Use actions to edit or delete existing types. Click ‘Add Event Type’ to create a new one."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Setting', href: '/communication/setting' },
          { name: 'Event Type', href: '/communication/event-type' },
        ]}
        action={
          <Button
            onClick={() => addEventTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Event Type
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <EventTypeTable
        onDelete={(data) => {
          setSelectedEventType(data);
          deleteEventTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedEventType(data);
          addEventTypeDialog.onTrue();
        }}
        onAddEventType={addEventTypeDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedEventType}
        data={eventTypeData}
      />

      <CustomDialog
        open={addEventTypeDialog.value}
        handleClose={() => {
          addEventTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedEventType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedEventType ? 'Update Event Type' : 'Add Event Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedEventType
                  ? 'Update the event type details including name and description.'
                  : 'Create a new event type by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <EventTypeForm
          open={addEventTypeDialog}
          onClose={handleClose}
          editData={selectedEventType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteEventTypeDialog.value}
        onClose={() => {
          setSelectedEventType(null);
          deleteEventTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete event type{' '}
            <strong>{selectedEventType?.eventType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteEventTypeDialog.onFalse();
              setSelectedEventType(null);
              shikshaMitraToast.success({
                message: `Event Type : ${selectedEventType?.eventType} deleted successfully`,
              });
              // handle delete API call here
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default EventTypeCreation;
