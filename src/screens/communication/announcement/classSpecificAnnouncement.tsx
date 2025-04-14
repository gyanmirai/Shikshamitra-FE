'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Card, Button, DialogContent, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import classWiseAnnouncementData from 'src/json/communication/announcement/classWiseAnnouncementData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AnnouncementForm from './components/classWiseAnnouncementForm';
import AnnouncementDetails from './components/classAnnouncementDetails';
import ClassWiseAnnouncementTable from './components/classAnnouncementTable';

import type { IClassAnnouncement } from './type';

const ClassWiseAnnounsement = (props: TabComponentType) => {
  // Query hook to fetch class data
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Modal state for publish announcement dialog
  const publish_modal = useBoolean();
  // State to store the announcement being published
  const [publishingAnnouncement, setPublishingAnnouncement] = useState<any | null>(null);
  // State to store the ID of announcement to be deleted
  const [deleteAnnouncement, setDeleteAnnouncement] = useState('');
  // State to store the announcement being edited
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  // State to store the selected class filter
  const [selectedClass, setSelectedClass] = useState<string>('All Classes');
  // Modal state for confirmation dialog
  const confirm_dialog = useBoolean();

  const [open, setOpen] = useState(false);
  // State to store the announcement being viewed
  const [viewAnnouncement, setViewAnnouncement] = useState<any | null>(null);
  // Modal state for view announcement dialog
  const view_dialog = useBoolean();
  const [announcementTableData, setAnnouncementTableData] =
    useState<IClassAnnouncement[]>(classWiseAnnouncementData);
  /**
   * Handles the deletion of an announcement by its ID
   * Removes the announcement from the table data and closes the confirmation dialog
   * @param id - The ID of the announcement to delete
   */
  const handleDelete = (id: string) => {
    setAnnouncementTableData((prevData) =>
      prevData.filter((announcement) => announcement.id !== id)
    );
    confirm_dialog.onFalse();
  };

  /**
   * Handles the submission of announcement form data
   * Updates existing announcement if editing, or creates a new announcement
   * @param values - The form values containing announcement data
   */
  const handleSubmit = (values: any) => {
    if (editingAnnouncement) {
      setAnnouncementTableData((prevData) =>
        prevData.map((announcement) =>
          announcement.id === editingAnnouncement.id
            ? { ...values, id: editingAnnouncement.id }
            : announcement
        )
      );
    } else {
      const newAnnouncement = {
        ...values,
        id: String(announcementTableData.length + 1),
      };
      setAnnouncementTableData((prevData) => [...prevData, newAnnouncement]);
    }
    handleCloseDialog();
  };

  /**
   * Handles closing of dialogs and resetting related states
   * Resets editing announcement, form params, publishing announcement and modal
   */
  const handleCloseDialog = () => {
    setEditingAnnouncement(null);
    setOpen(false);
    setPublishingAnnouncement(null);
    publish_modal.onFalse();
  };

  /**
   * Handles publishing of an announcement
   * Updates the announcement status to Published and sets current publish date
   * @param announcement - The announcement object to be published
   */
  const handlePublish = (announcement: any) => {
    setAnnouncementTableData((prevData) =>
      prevData.map((item) =>
        item.id === announcement.id
          ? {
              ...item,
              status: 'Published',
              publishDate: dayjs(),
              isScheduled: false,
            }
          : item
      )
    );
    publish_modal.onFalse();
    setPublishingAnnouncement(null);
  };

  const links = open
    ? [
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Announcements' },
        { name: 'Class Wise Announcement' },
        { name: 'Announcement Form' },
      ]
    : [
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Announcements' },
        { name: 'Class Wise Announcement' },
      ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Class Wise Announcement"
        description={
          open
            ? 'Create or update class-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
            : 'View and manage all class-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleCloseDialog()
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Class Wise Announcement'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AnnouncementForm
            initialValues={editingAnnouncement}
            onSubmit={handleSubmit}
            isEdit={!!editingAnnouncement}
          />
        </Card>
      ) : (
        <ClassWiseAnnouncementTable
          data={announcementTableData}
          onEdit={(announcement) => {
            setOpen(true);
            setEditingAnnouncement(announcement);
          }}
          onDelete={(id) => {
            confirm_dialog.onTrue();
            setDeleteAnnouncement(id);
          }}
          onView={(announcement) => {
            view_dialog.onTrue();
            setViewAnnouncement(announcement);
          }}
          onRequestPublish={(announcement) => {
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
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(deleteAnnouncement);
            }}
          >
            Delete
          </Button>
        }
      />

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure want to Publish?"
        action={
          <Button
            variant="contained"
            color="success"
            onClick={() => handlePublish(publishingAnnouncement)}
          >
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
        <DialogContent>
          <AnnouncementDetails announcement={viewAnnouncement} />
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={view_dialog.onFalse}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default ClassWiseAnnounsement;
