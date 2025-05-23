'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import { Box, Chip, Card, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import meetingData from 'src/json/communication/meetings/meetingData.json';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewMeeting from './meetingForm';
import ViewMeetingDialog from './viewDialog';

import type { IMeeting } from './type';

const AllMeetings = (props: TabComponentType) => {
  // State to store and manage the meetings data table
  const [meetingTableData, setMeetingTableData] = useState<IMeeting[]>(meetingData);
  // State to store the currently selected meeting for editing or viewing
  const [selectedMeeting, setSelectedMeeting] = useState<IMeeting | null>(null);
  // State to track whether the form is in edit mode (true) or create mode (false)
  const [isEdit, setIsEdit] = useState(false);
  // State to control the visibility of the confirmation dialog
  const confirmDialog = useBoolean();
  const viewDialog = useBoolean();
  // // State to control the visibility of the meeting dialog/modal
  // const [params, setParams] = useSearchParam({ isForm: 'false' });
  const [open, setOpen] = useState(false);
  /**
   * Handles closing the meeting dialog/form
   * Resets form state, selected meeting and edit mode
   */
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedMeeting(null);
    setIsEdit(false);
    viewDialog.onFalse();
    confirmDialog.onFalse();
  };

  /**
   * Handles submission of meeting form
   * Updates existing meeting if in edit mode, adds new meeting if in create mode
   * @param values - The form values containing meeting details
   */
  const handleSubmit = (values: any) => {
    if (isEdit) {
      setMeetingTableData((prevData) =>
        prevData.map((meeting) =>
          meeting.id === selectedMeeting?.id
            ? { ...values, id: selectedMeeting?.id }
            : selectedMeeting
        )
      );
    } else {
      const newMeeting = {
        ...values,
        id: String(meetingTableData.length + 1),
      };
      setMeetingTableData((prevData) => [...prevData, newMeeting]);
    }
    handleCloseDialog();
  };

  const actions = useCallback(
    ({ popover: pop }: any) => (
      <>
        {' '}
        <MenuList>
          {/* {(row.status === 'Cancelled' || row.status === 'Scheduled') && ( */}
          <MenuItem onClick={() => {}}>
            <Iconify icon="mdi:bell" sx={{ mr: 1 }} />
            Notify Audience
          </MenuItem>
          {/* )} */}
        </MenuList>
      </>
    ),
    []
  );

  /**
   * Handles deletion of a meeting
   * Removes meeting with specified ID from the meeting table data
   * @param id - The ID of the meeting to delete
   */
  const handleDelete = (id: number | undefined) => {
    setMeetingTableData((prevData) => prevData.filter((meeting) => meeting.id !== id));
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
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleCloseDialog}
              >
                Back
              </Button>
            }
          />
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <AddNewMeeting
              initialValues={selectedMeeting}
              onSubmit={handleSubmit}
              isEdit={isEdit}
              onClose={handleCloseDialog}
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
            sx={{ px: 1, mb: 2 }}
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
          <CustomizableTable
            tableId="meetingTable"
            columns={[
              { id: 'title', label: 'Title' },
              { id: 'meetingType', label: 'Meeting Type', minWidth: '180px', align: 'left' },
              {
                id: 'meetingDate',
                label: 'Meeting Date',
                minWidth: '180px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
                ),
              },
              {
                id: 'meetingTime',
                label: 'Meeting Time',
                minWidth: '180px',
                align: 'left',
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('HH:mm')}
                  </Typography>
                ),
              },
              {
                id: 'audience',
                label: 'Audience',
                render: (value: any) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value.map((audience: string) => (
                      <Chip
                        key={audience}
                        label={audience}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ),
              },
              {
                id: 'organization',
                label: 'Organizations',
                render: (value: any) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value && value.length > 0
                      ? value.map((org: string) => (
                          <Chip key={org} label={org} size="small" variant="outlined" />
                        ))
                      : '-'}
                  </Box>
                ),
              },
              {
                id: 'className',
                label: 'Class',
                render: (value: any) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value && value.length > 0
                      ? value.map((org: string) => (
                          <Chip key={org} label={org} size="small" variant="outlined" />
                        ))
                      : '-'}
                  </Box>
                ),
              },
              {
                id: 'division',
                label: 'Division',
                render: (value: any) => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {value && value.length > 0
                      ? value.map((org: string) => (
                          <Chip key={org} label={org} size="small" variant="outlined" />
                        ))
                      : '-'}
                  </Box>
                ),
              },
              {
                id: 'status',
                label: 'Status',
                render: (value: any, row: any) => (
                  <Label
                    variant="soft"
                    color={
                      value === 'Scheduled'
                        ? 'secondary'
                        : value === 'Completed'
                          ? 'primary'
                          : value === 'Cancelled'
                            ? 'error'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                ),
              },
              {
                id: 'action',
                label: 'Action',
                sticky: true,
                isSort: false,
                isFilter: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      actions={(prop) => actions({ ...prop, row })}
                      placement="right-top"
                      showEditIcon
                      showDeleteIcon
                      showViewIcon
                      handleEditClick={() => {
                        setOpen(true);
                        setSelectedMeeting(row as IMeeting);
                        setIsEdit(true);
                      }}
                      handleDeleteClick={() => {
                        confirmDialog.onTrue();
                        setSelectedMeeting(row as IMeeting);
                      }}
                      handleViewClick={() => {
                        setSelectedMeeting(row as IMeeting);
                        viewDialog.onTrue();
                      }}
                    />
                  );
                },
              },
            ]}
            data={meetingTableData}
          />
        </>
      )}

      <ViewMeetingDialog
        open={viewDialog.value}
        onClose={handleCloseDialog}
        meeting={selectedMeeting}
      />
      <ConfirmDialog
        open={confirmDialog.value}
        onClose={() => {
          handleCloseDialog();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(selectedMeeting?.id);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default AllMeetings;
