'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { useDispatch, useSelector } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  Box,
  Card,
  Button,
  Typography,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';
import {
  useGetAnnouncementsQuery,
  schoolWiseAnnouncementApi,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
} from 'src/redux/communication/announcement/schoolWiseAnnouncement';

import AnnouncementForm from './AnnouncementForm';
import AnnouncementRemoveReasonForm from './removePublishForm';
import AnnouncementTable from './components/announcementTable';
import SchoolManagementViewDetails from './components/SchoolWiseDetails/SchoolManagementViewDetails';

import type { ISchoolWiseAnnouncement } from './type';

const Announcement = (props: TabComponentType) => {
  // Controls form visibility through URL search parameters
  const [open, setOpen] = useState(false);

  // Stores the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<ISchoolWiseAnnouncement | null>(
    null
  );
  // Stores the announcement being viewed in detail
  const [viewAnnouncement, setViewAnnouncement] = useState<ISchoolWiseAnnouncement | null>(null);
  // Controls the visibility of view announcement dialog
  const view_dialog = useBoolean(false);

  const [, setRemoveAnnouncement] = useState<ISchoolWiseAnnouncement | null>(null);
  // Controls the visibility of delete confirmation dialog
  const confirm_dialog = useBoolean();
  // Controls the visibility of publish modal
  const publish_modal = useBoolean();
  const delete_dialog = useBoolean();
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
  // Delete document mutation
  const [deleteAnnouncement, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAnnouncementMutation,
  });

  const [publishAnnouncement, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishAnnouncementMutation,
  });

  const {
    data: announcementData,
    isLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAnnouncementsQuery,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

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
            {
              name: 'Announcements',
              onClick(e) {
                setOpen(false);
                setEditingAnnouncement(null);
              },
            },

            { name: editingAnnouncement ? 'Update Announcement' : 'Add Announcement' },
          ]}
          // sx={{ px: 2 }}
          isBack
          onBack={() => {
            handleCloseDialog(null, false);
          }}
        />
      ) : view_dialog.value ? (
        <CustomBreadcrumbs
          heading="View Announcement"
          description="View and manage all school-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
            { name: 'View Announcement' },
          ]}
          isBack
          onBack={() => {
            view_dialog.onFalse();
          }}
          // sx={{ px: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Announcement"
          description="View and manage all school-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Announcements' },
          ]}
          // sx={{ px: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              variant="contained"
              onClick={() => setOpen(true)}
              sx={{ px: '32px' }}
            >
              Announcement
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
      ) : view_dialog.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <SchoolManagementViewDetails announcement={viewAnnouncement} />
        </Card>
      ) : (
        <AnnouncementTable
          data={announcementData?.data}
          isLoading={isLoading}
          setOpen={setOpen}
          onEdit={(row) => {
            setOpen(true);
            setEditingAnnouncement(row);
          }}
          handleSwitchChange={(row) => {
            setEditingAnnouncement(row);
          }}
          onDelete={(row) => {
            delete_dialog.onTrue();
            setEditingAnnouncement(row);
          }}
          onRemove={(row) => {
            confirm_dialog.onTrue();
            setRemoveAnnouncement(row);
          }}
          onView={(row) => {
            view_dialog.onTrue();
            setOpen(false);
            setViewAnnouncement(row);
          }}
          onPublish={(row) => {
            publish_modal.onTrue();
            setPublishingAnnouncement(row);
          }}
        />
      )}

      <ConfirmDialog
        open={delete_dialog.value}
        onClose={() => {
          setEditingAnnouncement(null);
          delete_dialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete the{' '}
            <strong>&apos;{editingAnnouncement?.title}&apos;</strong> announcement?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: editingAnnouncement,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    schoolWiseAnnouncementApi.util.updateQueryData(
                      'getAnnouncements',
                      undefined,
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === editingAnnouncement?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => deleteAnnouncement(editingAnnouncement?.id || ''),
              });
              delete_dialog.onFalse();
              setEditingAnnouncement(null);
            }}
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
          <LoadingButton
            loading={isPublishLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: publishingAnnouncement,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    schoolWiseAnnouncementApi.util.updateQueryData(
                      'getAnnouncements',
                      undefined,
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === publishingAnnouncement?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) => refetch(),
                onCommit: () => publishAnnouncement(publishingAnnouncement?.id || ''),
              });
              publish_modal.onFalse();
              setPublishingAnnouncement(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

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

export default Announcement;
