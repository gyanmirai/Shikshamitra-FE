'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Box,
  Card,
  Button,
  DialogActions,
  DialogContent,
  // eslint-disable-next-line import/no-duplicates
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Label } from 'src/components/label';
import SchoolWiseAnnouncementInitialData from 'src/json/communication/announcement/SchoolWiseAnnouncementInitialData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AnnouncementForm from './schoolannouncementForm';
import AnnouncementDetails from './components/announcementDetail';
import SchoolWiseAnnouncementTable from './components/schoolWiseAnnouncementTable';

import type { ISchoolWiseAnnouncement } from './type';

const SchoolWiseAnnounsement = (props: TabComponentType) => {
  // Controls form visibility through URL search parameters
  const [open, setOpen] = useState(false);

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
  const [publishingAnnouncement, setPublishingAnnouncement] =
    useState<ISchoolWiseAnnouncement | null>(null);

  // Stores the main table data for announcements
  const [announcementTableData, setAnnouncementTableData] = useState<ISchoolWiseAnnouncement[]>(
    SchoolWiseAnnouncementInitialData
  );
  /**
   * Deletes an announcement from the table data based on the provided ID
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
   * If editing, updates the existing announcement
   * If creating new, adds a new announcement to the table
   * @param values - The form values to be submitted
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
   * Closes all dialogs and resets form-related states
   * Clears editing announcement, publishing announcement and closes modals
   */
  const handleCloseDialog = () => {
    setEditingAnnouncement(null);
    setOpen(false);
    publish_modal.onFalse();
    setPublishingAnnouncement(null);
  };

  /**
   * Publishes an announcement by updating its status and related fields
   * @param announcement - The announcement object to be published
   */
  const handlePublish = (announcement: ISchoolWiseAnnouncement | null) => {
    setAnnouncementTableData((prevData) =>
      prevData.map((item) =>
        item.id === announcement?.id
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
        { name: 'School Wise Announcement' },
        { name: 'Announcement Form' },
      ]
    : [
        { name: 'Communication', href: '/communication/dashboard' },
        { name: 'Announcements' },
        { name: 'School Wise Announcement' },
      ];

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="School Wise Announcement"
        description={
          open
            ? 'Create or update school-wide announcements with important messages, event details, or notifications. Share information efficiently with students, teachers, and staff.'
            : 'View and manage all school-wide announcements, including message content, target audience, and publication status. Add new announcements, update existing ones, or remove them as needed.'
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
            {open ? 'Back' : 'School Wise Announcement'}
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
        <SchoolWiseAnnouncementTable
          data={announcementTableData}
          onEdit={(row) => {
            setOpen(true);
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

export default SchoolWiseAnnounsement;
