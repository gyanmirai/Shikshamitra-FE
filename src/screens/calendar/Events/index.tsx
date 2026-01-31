'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
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
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  eventApi,
  useGetEventsQuery,
  useDeleteEventMutation,
} from 'src/redux/calendar/events/eventApi';

import AddEvent from './addeventForm';
import EventAnnouncementTable from './components/EventTable';
import UploadFileUploadForm from './components/EventUploadGallery';
import EventDetailsComponent from './components/EventDetails/EventDetailsComponent';

import type { IEventAnnouncement } from './type';

const Events = (props: TabComponentType) => {
  // State to store the selected event details
  const [status, setStatus] = useState('All');

  const {
    data: eventTableData,
    refetch: refetchEventTableData,
    isLoading: isEventTableLoading,
    isFetching: isEventTableFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEventsQuery,
    params: { status: status === 'All' ? undefined : status },
    options: { skip: !status },
  });
  const { confirmWithUndo } = useConfirmWithUndo();

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

  // Delete mutation and undo hook
  const [deleteEvent, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEventMutation,
  });
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
          sx={{ px: 1 }}
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
          sx={{ px: 1 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{ px: '32px' }}
            >
              Event
            </Button>
          }
        />
      )}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-10)', minHeight: 0 }}>
          <AddEvent
            initialValues={editingEvent}
            onClose={handleCloseDialog}
            isEdit={!!editingEvent}
          />
        </Card>
      ) : (
        <EventAnnouncementTable
          status={status}
          setStatus={setStatus}
          isLoading={isEventTableLoading || isEventTableFetching}
          setOpen={setOpen}
          data={eventTableData?.items}
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
          setTimeout(() => {
            setEditingEvent(null);
          }, 200);
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
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            onClick={async () => {
              confirmWithUndo({
                item: editingEvent,
                message: `Event: ${editingEvent?.title} deleted successfully`,
                onOptimisticRemove: (dispatchFn) =>
                  dispatchFn(
                    eventApi.util.updateQueryData(
                      'getEvents',
                      { status: status === 'All' ? undefined : status },
                      (draft: any) => {
                        const index = draft.items.findIndex(
                          (item: any) => item.id === editingEvent?.id
                        );
                        if (index !== -1) draft.items.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: () => refetchEventTableData(),
                onCommit: () => deleteEvent(editingEvent?.id || ''),
              });

              confirm_dialog.onFalse();
              setEditingEvent(null);
            }}
            size="small"
          >
            Yes
          </LoadingButton>
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

      <EventDetailsComponent
        event={editingEvent}
        open={view_dialog.value}
        onClose={() => {
          setEditingEvent(null);
          view_dialog.onFalse();
        }}
      />

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

export default Events;
