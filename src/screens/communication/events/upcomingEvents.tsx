'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetEventAnnouncementsQuery } from 'src/redux/communication/announcement/eventDataApi';

import AddEvent from './addeventForm';
import EventAnnouncementTable from './components/EventTable';
import EventDetailsComponent from './components/EventDetails/EventDetailsComponent';

import type { IEventAnnouncement } from './type';

const UpcomingEvents = (props: TabComponentType) => {
  // State to store the selected event details
  const { data: eventTableData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventAnnouncementsQuery,
  });

  // State to store the event being edited
  const [editingEvent, setEditingEvent] = useState<IEventAnnouncement | null>(null);

  const confirm_dialog = useBoolean();
  const view_dialog = useBoolean();
  const publish_modal = useBoolean();
  // State to control add/edit event form dialog
  const [open, setOpen] = useState(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  /**
   * Closes all dialogs and resets form-related states
   * Clears editing event and closes modal
   */
  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditingEvent(null);
        setOpen(false);
        dispatch(setIsChanges(false));
      }, 200); // Delay for dialog transition
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      resetState();
    } else if (!isChanges) {
      resetState();
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {open ? (
        <CustomBreadcrumbs
          heading="Events"
          description="Create or update school events with important details, schedules, and notifications. Share event information efficiently with students, teachers, and staff."
          links={[{ name: 'Communication', href: '/communication/dashboard' }, { name: 'Events' }]}
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={() => {
            handleCloseDialog(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Events"
          description="View and manage all school events, including event details, schedules, and status. Add new events, update existing ones, or remove them as needed."
          links={[{ name: 'Communication', href: '/communication/dashboard' }, { name: 'Events' }]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Event
            </Button>
          }
        />
      )}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddEvent
            initialValues={editingEvent}
            onClose={handleCloseDialog}
            isEdit={!!editingEvent}
          />
        </Card>
      ) : (
        <EventAnnouncementTable
          data={eventTableData}
          onEdit={(row) => {
            setOpen(true);
            setEditingEvent(row);
          }}
          onDelete={(id) => {
            confirm_dialog.onTrue();
            setEditingEvent(id);
          }}
          onView={(row) => {
            view_dialog.onTrue();
            setEditingEvent(row);
          }}
          onPublish={(row) => {
            publish_modal.onTrue();
            setEditingEvent(row);
          }}
        />
      )}

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          setEditingEvent(null);
          confirm_dialog.onFalse();
        }}
        content={
          <>
            Are you sure you want to delete <strong>{editingEvent?.title}</strong>?
          </>
        }
        title="Delete"
        action={
          <Button variant="contained" color="error" onClick={() => {}} size="small">
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {
          publish_modal.onFalse();
          setEditingEvent(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish event <strong>{editingEvent?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publish_modal.onFalse();
              shikshaMitraToast.success({
                message: `Event "${editingEvent?.title}" published successfully.`,
              });
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />

      <CustomDialog
        title={`${editingEvent?.title}`}
        open={view_dialog.value}
        handleClose={() => {
          setEditingEvent(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        <EventDetailsComponent event={editingEvent} />
      </CustomDialog>
    </Box>
  );
};

export default UpcomingEvents;
