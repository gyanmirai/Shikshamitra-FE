'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetSchoolWiseAnnouncementsQuery } from 'src/redux/communication/announcement/schoolWiseAnnouncement';
import {
  Box,
  Card,
  Button,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import AnnouncementForm from './schoolannouncementForm';
import SchoolWiseAnnouncementTable from './components/schoolWiseAnnouncementTable';
import SchoolManagementViewDetails from './components/SchoolWiseDetails/SchoolManagementViewDetails';

import type { ISchoolWiseAnnouncement } from './type';

const SchoolWiseAnnounsement = (props: TabComponentType) => {
  // Controls form visibility through URL search parameters
  const [open, setOpen] = useState(false);
  const { data: announcementData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSchoolWiseAnnouncementsQuery,
  });

  // Stores the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<ISchoolWiseAnnouncement | null>(
    null
  );
  // Stores the announcement being viewed in detail
  const [viewAnnouncement, setViewAnnouncement] = useState<ISchoolWiseAnnouncement | null>(null);
  // Controls the visibility of view announcement dialog
  const view_dialog = useBoolean();
  // Stores the ID of announcement to be deleted
  const [deleteAnnouncement, setDeleteAnnouncement] = useState('');
  // Controls the visibility of delete confirmation dialog
  const confirm_dialog = useBoolean();
  // Controls the visibility of publish modal
  const publish_modal = useBoolean();
  // Stores the announcement being published
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [publishingAnnouncement, setPublishingAnnouncement] =
    useState<ISchoolWiseAnnouncement | null>(null);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  /**
   * Closes all dialogs and resets form-related states
   * Clears editing announcement, publishing announcement and closes modals
   */
  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditingAnnouncement(null);
        setOpen(false);
        publish_modal.onFalse();
        setPublishingAnnouncement(null);
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
          heading="School Announcement"
          description="Create or update school-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            { name: 'School Announcement' },
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
          heading="School Announcement"
          description="View and manage all school-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            { name: 'School Announcement' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              School Announcement
            </Button>
          }
        />
      )}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AnnouncementForm
            initialValues={editingAnnouncement}
            isEdit={!!editingAnnouncement}
            onClose={handleCloseDialog}
          />
        </Card>
      ) : (
        <SchoolWiseAnnouncementTable
          data={announcementData}
          onEdit={(row) => {
            setOpen(true);
            setEditingAnnouncement(row);
          }}
          handleSwitchChange={(row) => {
            setEditingAnnouncement(row);
          }}
          onDelete={(id) => {
            confirm_dialog.onTrue();
            setDeleteAnnouncement(id);
          }}
          onView={(row) => {
            view_dialog.onTrue();
            setViewAnnouncement(row);
          }}
          onPublish={(row) => {
            publish_modal.onTrue();
            setPublishingAnnouncement(row);
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
          <Button variant="contained" color="error" onClick={() => {}} size="small">
            Yes
          </Button>
        }
      />

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {
          publish_modal.onFalse();
          setPublishingAnnouncement(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish announcement{' '}
            <strong>{publishingAnnouncement?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publish_modal.onFalse();
              shikshaMitraToast.success({
                message: `Announcement "${publishingAnnouncement?.title}" published successfully.`,
              });
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />

      <CustomDialog
        title={`${viewAnnouncement?.title}`}
        open={view_dialog.value}
        handleClose={() => {
          setViewAnnouncement(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        <SchoolManagementViewDetails announcement={viewAnnouncement} />
      </CustomDialog>
    </Box>
  );
};

export default SchoolWiseAnnounsement;
