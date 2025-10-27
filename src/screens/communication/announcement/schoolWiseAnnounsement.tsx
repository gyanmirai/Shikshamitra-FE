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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetSchoolWiseAnnouncementsQuery } from 'src/redux/communication/announcement/schoolWiseAnnouncement';
import {
  Box,
  Card,
  Button,
  Typography,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import AnnouncementForm from './schoolannouncementForm';
import AnnouncementRemoveReasonForm from './removePublishForm';
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
  const [deleteAnnouncement, setDeleteAnnouncement] = useState<ISchoolWiseAnnouncement | null>(
    null
  );
  const [removeAnnouncement, setRemoveAnnouncement] = useState<ISchoolWiseAnnouncement | null>(
    null
  );
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
        confirm_dialog.onFalse();
        setPublishingAnnouncement(null);
        setRemoveAnnouncement(null);
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
          heading={editingAnnouncement ? 'Update Announcement' : 'Add Announcement'}
          description={
            editingAnnouncement
              ? 'Update this school-wide announcement with revised messages, event details, or notifications. Efficiently share updated information with students, teachers, and staff.'
              : 'Create or update school-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
          }
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            {
              name: 'School Announcement',
              href: '/communication/announcement/schoolWiseAnnounsement',
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
          setOpen={setOpen}
          data={announcementData}
          onEdit={(row) => {
            setOpen(true);
            setEditingAnnouncement(row);
          }}
          handleSwitchChange={(row) => {
            setEditingAnnouncement(row);
          }}
          onDelete={(row) => {
            confirm_dialog.onTrue();
            setDeleteAnnouncement(row);
          }}
          onRemove={(row) => {
            confirm_dialog.onTrue();
            setRemoveAnnouncement(row);
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
          setDeleteAnnouncement(null);
          confirm_dialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete the{' '}
            <strong>&apos;{deleteAnnouncement?.title}&apos;</strong> announcement?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm_dialog.onFalse();
              setDeleteAnnouncement(null);
              shikshaMitraToast.success({
                message: `Announcement : ${deleteAnnouncement?.title} deleted successfully.`,
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
              title="View detailed information about this school-wide announcement, including message content, target audience, and publication status."
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
        <SchoolManagementViewDetails announcement={viewAnnouncement} />
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

export default SchoolWiseAnnounsement;
