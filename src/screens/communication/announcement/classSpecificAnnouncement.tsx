'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetClassWiseAnnouncementsQuery } from 'src/redux/communication/announcement/classWiseAnnouncement';

import AnnouncementRemoveReasonForm from './removePublishForm';
import AnnouncementForm from './components/classWiseAnnouncementForm';
import ClassWiseAnnouncementTable from './components/classAnnouncementTable';
import ClassManagementViewDetails from './components/ClassWiseDetails/ClassWiseAnnouncementDetails';

import type { IClassWiseAnnouncement } from './type';

const ClassWiseAnnounsement = (props: TabComponentType) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();
  // Modal state for publish announcement dialog
  const publish_modal = useBoolean();
  // State to store the announcement being published
  const [publishingAnnouncement, setPublishingAnnouncement] =
    useState<IClassWiseAnnouncement | null>(null);
  const [removeAnnouncement, setRemoveAnnouncement] = useState<IClassWiseAnnouncement | null>(null);
  // State to store the ID of announcement to be deleted
  const [deleteAnnouncement, setDeleteAnnouncement] = useState<IClassWiseAnnouncement | null>(null);
  // State to store the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<IClassWiseAnnouncement | null>(
    null
  );
  // Modal state for confirmation dialog
  const confirm_dialog = useBoolean();

  const [open, setOpen] = useState(false);
  // State to store the announcement being viewed
  const [viewAnnouncement, setViewAnnouncement] = useState<IClassWiseAnnouncement | null>(null);
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
        setRemoveAnnouncement(null);
        setPublishingAnnouncement(null);
        publish_modal.onFalse();
        confirm_dialog.onFalse();
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
          heading={editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
          description={
            editingAnnouncement
              ? 'Update the selected class-wide announcement with revised messages, event details, or notifications. Ensure accurate and timely information for students, teachers, and staff.'
              : 'Create a new class-wide announcement with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
          }
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            {
              name: 'Class Announcement',
              href: '/communication/announcement/classSpecificAnnouncement',
              onClick(e) {
                setOpen(false);
                setEditingAnnouncement(null);
              },
            },
            { name: editingAnnouncement ? 'Update Announcement' : 'Add Announcement' },
          ]}
          sx={{ px: 1, mb: 2 }}
          isBack
          onBack={() => {
            handleCloseDialog(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Class Announcement"
          description="View and manage all class-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            { name: 'Class Announcement' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Class Announcement
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
          setOpen={setOpen}
          data={announcementData}
          onEdit={(announcement) => {
            setOpen(true);
            setEditingAnnouncement(announcement);
          }}
          handleSwitchChange={(announcement) => {
            // toggle active/inactive etc.
            console.log('Switch changed:', announcement);
          }}
          onRemove={(row) => {
            confirm_dialog.onTrue();
            setRemoveAnnouncement(row);
          }}
          onDelete={(row) => {
            confirm_dialog.onTrue();
            setDeleteAnnouncement(row);
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
          setDeleteAnnouncement(null);
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>&apos;{deleteAnnouncement?.title}&apos;</strong>{' '}
            announcement?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              confirm_dialog.onFalse();
              setDeleteAnnouncement(null);
              shikshaMitraToast.success({
                message: `Announcement : ${deleteAnnouncement?.title} deleted successfully.`,
              });
            }}
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
          setPublishingAnnouncement(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish{' '}
            <strong>&apos;{publishingAnnouncement?.title}&apos; </strong>announcement?
            {publishingAnnouncement?.endDate && (
              <>
                <br />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {(() => {
                    const now = dayjs();
                    const end = dayjs(publishingAnnouncement.endDate);
                    if (end.isSame(now, 'day')) {
                      const hours = end.diff(now, 'hour');
                      return `This announcement will be published for ${hours} hour${hours !== 1 ? 's' : ''} until ${end.format('MMM D, YYYY h:mm A')}.`;
                    }
                    const days = end.diff(now, 'day');
                    return `This announcement will be published for ${days} day${days !== 1 ? 's' : ''} until ${end.format('MMM D, YYYY h:mm A')}.`;
                  })()}
                </Typography>
              </>
            )}
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publish_modal.onFalse();
              setPublishingAnnouncement(null);
              shikshaMitraToast.success({
                message: `Announcement : ${publishingAnnouncement?.title} published successfully.`,
              });
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{viewAnnouncement?.title}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View detailed information about this class-wise announcement, including message content, target audience, and publication status."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={view_dialog.value}
        handleClose={() => {
          setViewAnnouncement(null);
          view_dialog.onFalse();
        }}
        maxWidth="md"
      >
        <ClassManagementViewDetails announcement={viewAnnouncement} />
      </CustomDialog>

      <CustomDialog
        open={confirm_dialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Remove Annnouncement</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Remove announcement from the system. This action will permanently delete the announcement and it will no longer be visible to users."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          confirm_dialog.onFalse();
          setRemoveAnnouncement(null);
        }}
        maxWidth="xs"
      >
        <AnnouncementRemoveReasonForm onClose={handleCloseDialog} />
      </CustomDialog>
    </Box>
  );
};

export default ClassWiseAnnounsement;
