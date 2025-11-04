'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetEventAnnouncementsQuery } from 'src/redux/communication/announcement/eventDataApi';

import AddEvent from './addeventForm';
import EventAnnouncementTable from './components/EventTable';
import UploadFileUploadForm from './components/EventUploadGallery';
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
  const viewGalleryDialog = useBoolean();
  const uploadPhotoVideoDialog = useBoolean();
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
        uploadPhotoVideoDialog.onFalse();
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
          heading={editingEvent ? 'Update Event' : 'Add Event'}
          description={
            editingEvent
              ? 'Update school events with revised details, schedules, and notifications. Ensure accurate information is shared with students, teachers, and staff.'
              : 'Create new school events with important details, schedules, and notifications. Share event information efficiently with students, teachers, and staff.'
          }
          links={[
            { name: 'Calendar', href: '/calendar/dashboard' },
            { name: 'Events' },
            { name: editingEvent ? 'Update Event' : 'Add Event' },
          ]}
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
          links={[{ name: 'Calendar', href: '/calendar/dashboard' }, { name: 'Events' }]}
          sx={{ px: 1, mb: 1 }}
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
          setOpen={setOpen}
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
          onUploadPhotoVideo={(row) => {
            uploadPhotoVideoDialog.onTrue();
            setEditingEvent(row);
            // TODO: Implement upload photo/video logic
          }}
          onViewGallery={(row) => {
            viewGalleryDialog.onTrue();
            setEditingEvent(row);
            // TODO: Implement view gallery logic
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
            Are you sure you want to remove <strong>&apos;{editingEvent?.title}&apos;</strong>{' '}
            Event?
          </>
        }
        title="Delete"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm_dialog.onFalse();
              shikshaMitraToast.success({
                message: `Event : "${editingEvent?.title}" removed successfully.`,
              });
            }}
            size="small"
          >
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        icon="success"
        open={publish_modal.value}
        onClose={() => {
          publish_modal.onFalse();
          setEditingEvent(null);
        }}
        title="Active"
        content={
          <>
            Are you sure you want to active <strong>&apos;{editingEvent?.title}&apos;</strong>{' '}
            Event?
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
            Active
          </Button>
        }
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{editingEvent?.title}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View detailed information about this school-wide event, including schedule, venue, and target audience."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={view_dialog.value}
        handleClose={() => {
          setEditingEvent(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        <EventDetailsComponent event={editingEvent} />
      </CustomDialog>

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Upload Photos & Videos</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Upload media files for this event to share with students, teachers, and staff."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={uploadPhotoVideoDialog.value}
        handleClose={() => {
          setEditingEvent(null);
          uploadPhotoVideoDialog.onFalse();
        }}
        maxWidth="sm"
      >
        <UploadFileUploadForm event={editingEvent} onClose={handleCloseDialog} />
      </CustomDialog>
    </Box>
  );
};

export default UpcomingEvents;
