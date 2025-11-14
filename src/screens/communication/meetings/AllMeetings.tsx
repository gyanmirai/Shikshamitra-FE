'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetMeetingDetailsQuery } from 'src/redux/communication/meeting/meetingDataApi';

import AddNewMeeting from './meetingForm';
import MeetingTable from './MeetingTable';
import MeetingDetails from './meetingDetails';

import type { IMeeting } from './type';

const AllMeetings = (props: TabComponentType) => {
  const { data: meetingData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMeetingDetailsQuery,
  });

  // State to store the currently selected meeting for editing or viewing
  const [selectedMeeting, setSelectedMeeting] = useState<IMeeting | null>(null);
  // State to track whether the form is in edit mode (true) or create mode (false)
  const [isEdit, setIsEdit] = useState(false);
  // State to control the visibility of the confirmation dialog
  const confirmDialog = useBoolean();
  const viewDialog = useBoolean();
  // Controls the visibility of publish modal
  const publish_modal = useBoolean();
  // // State to control the visibility of the meeting dialog/modal
  // const [params, setParams] = useSearchParam({ isForm: 'false' });
  const [open, setOpen] = useState(false);
  /**
   * Handles closing the meeting dialog/form
   * Resets form state, selected meeting and edit mode
   */
  const handleCloseDialog = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedMeeting(null);
        setIsEdit(false);
        viewDialog.onFalse();
        confirmDialog.onFalse();
      }, 200); // Delay for dialog transition
    };

    if (isSubmit) {
      resetState();
    } else {
      // Check if there are unsaved changes
      const hasUnsavedChanges = selectedMeeting !== null || isEdit;

      if (hasUnsavedChanges && !window.confirm('Are you sure you want to leave this page?')) {
        return;
      }
      resetState();
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {open ? (
        <>
          <CustomBreadcrumbs
            heading="Meetings"
            description="Create or edit a meeting with details like title, date, time, and audience."
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Meetings' },
              { name: 'Meeting Form' },
            ]}
            sx={{ mb: 2 }}
            isBack
            onBack={() => {
              handleCloseDialog(null, false);
            }}
          />
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <AddNewMeeting
              initialValues={selectedMeeting}
              isEdit={isEdit}
              onClose={() => {
                handleCloseDialog(null, false);
              }}
            />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Meetings"
            description="View and manage meetings with details like title, date, time, and audience."
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Meetings' },
            ]}
            sx={{ mb: 2 }}
            action={
              <Button
                startIcon={<Iconify icon="mdi:plus" />}
                variant="contained"
                size="small"
                onClick={() => {
                  setOpen(true);
                  setIsEdit(false);
                }}
              >
                Meeting
              </Button>
            }
          />
          <MeetingTable
            data={meetingData}
            onEdit={(row) => {
              setOpen(true);
              setSelectedMeeting(row);
            }}
            onDelete={(row) => {
              confirmDialog.onTrue();
              setSelectedMeeting(row);
            }}
            onView={(row) => {
              viewDialog.onTrue();
              setSelectedMeeting(row);
            }}
            onPublish={(row) => {
              setSelectedMeeting(row);
            }}
          />
        </>
      )}

      <CustomDialog
        title="Meeting Details"
        open={viewDialog.value}
        handleClose={() => {
          setSelectedMeeting(null);
          viewDialog.onFalse();
        }}
        maxWidth="md"
      >
        <MeetingDetails meeting={selectedMeeting} />
      </CustomDialog>

      <ConfirmDialog
        open={confirmDialog.value}
        onClose={() => {
          setSelectedMeeting(null);
          confirmDialog.onFalse();
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
          setSelectedMeeting(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish announcement <strong>{selectedMeeting?.title}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={() => {
              publish_modal.onFalse();
              shikshaMitraToast.success({
                message: `Announcement "${selectedMeeting?.title}" published successfully.`,
              });
            }}
            size="small"
          >
            Publish
          </Button>
        }
      />
    </Box>
  );
};

export default AllMeetings;
