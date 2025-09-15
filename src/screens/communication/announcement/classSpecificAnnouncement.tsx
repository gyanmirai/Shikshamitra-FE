'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetClassWiseAnnouncementsQuery } from 'src/redux/communication/announcement/classWiseAnnouncement';

import AnnouncementForm from './components/classWiseAnnouncementForm';
import ClassWiseAnnouncementTable from './components/classAnnouncementTable';
import ClassManagementViewDetails from './components/ClassWiseDetails/ClassWiseAnnouncementDetails';

const ClassWiseAnnounsement = (props: TabComponentType) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();
  // Modal state for publish announcement dialog
  const publish_modal = useBoolean();
  // State to store the announcement being published
  const [publishingAnnouncement, setPublishingAnnouncement] = useState<any | null>(null);
  // State to store the ID of announcement to be deleted
  const [deleteAnnouncement, setDeleteAnnouncement] = useState('');
  // State to store the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  // Modal state for confirmation dialog
  const confirm_dialog = useBoolean();

  const [open, setOpen] = useState(false);
  // State to store the announcement being viewed
  const [viewAnnouncement, setViewAnnouncement] = useState<any | null>(null);
  // Modal state for view announcement dialog
  const view_dialog = useBoolean();
  const { data: announcementData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassWiseAnnouncementsQuery,
  });

  /**
   * Handles closing of dialogs and resetting related states
   * Resets editing announcement, form params, publishing announcement and modal
   */
  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditingAnnouncement(null);
        setOpen(false);
        setPublishingAnnouncement(null);
        publish_modal.onFalse();
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {open ? (
        <CustomBreadcrumbs
          heading="Class Wise Announcement"
          description="Create or update class-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            { name: 'Class Wise Announcement' },
            { name: 'Announcement Form' },
          ]}
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={() => {
            handleCloseDialog(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Class Wise Announcement"
          description="View and manage all class-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            { name: 'Class Wise Announcement' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Class Wise Announcement
            </Button>
          }
        />
      )}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AnnouncementForm
            onClose={handleCloseDialog}
            initialValues={editingAnnouncement}
            onSubmit={() => {}}
            isEdit={!!editingAnnouncement}
          />
        </Card>
      ) : (
        <ClassWiseAnnouncementTable
          data={announcementData}
          onEdit={(announcement) => {
            setOpen(true);
            setEditingAnnouncement(announcement);
          }}
          handleSwitchChange={(announcement) => {
            // toggle active/inactive etc.
            console.log('Switch changed:', announcement);
          }}
          onDelete={(id) => {
            confirm_dialog.onTrue();
            setDeleteAnnouncement(id);
          }}
          onView={(announcement) => {
            view_dialog.onTrue();
            setViewAnnouncement(announcement);
          }}
          onPublish={(announcement) => {
            publish_modal.onTrue();
            setPublishingAnnouncement(announcement);
          }}
        />
      )}

      <ConfirmDialog
        open={confirm_dialog.value}
        onClose={() => {
          setDeleteAnnouncement('');
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {}}
        title="Publish"
        content="Are you sure want to Publish?"
        action={
          <Button variant="contained" color="success" onClick={() => {}}>
            Publish
          </Button>
        }
      />

      <CustomDialog
        title="Announcement Details"
        open={view_dialog.value}
        handleClose={() => {
          setViewAnnouncement(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        <ClassManagementViewDetails announcement={viewAnnouncement} />
      </CustomDialog>
    </Box>
  );
};

export default ClassWiseAnnounsement;
