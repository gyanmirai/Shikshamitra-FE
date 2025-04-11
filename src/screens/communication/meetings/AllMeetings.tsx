'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Chip,
  Card,
  Button,
  MenuItem,
  MenuList,
  Typography,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewMeeting from './meetingForm';
import ViewMeetingDialog from './viewDialog';

import type { TMeeting } from './type';

const meetings: TMeeting[] = [
  {
    id: 1,
    title: 'Monthly Staff Meeting',
    status: 'Scheduled',
    audience: ['Teachers'],
    organization: ['Secondary'],
    className: [],
    division: [],
    students: [],
    meetingDate: dayjs('2024-12-15'),
    meetingTime: dayjs('2024-12-15T10:00'),
    meetingAgenda: 'Discuss curriculum updates and training schedules.',
    link: '',
    meetingType: 'Offline',
    classRoom: 'Conference Room 1',
    isRecurring: true,
    repeatFrequency: 'Monthly',
    repeatUntil: dayjs('2025-06-15'),
  },
  {
    id: 2,
    title: 'Parent-Teacher Interaction',
    status: 'Completed',
    audience: ['Parents'],
    organization: ['Secondary'],
    className: ['2'],
    division: ['A'],
    students: ['student1', 'student2'],
    meetingDate: dayjs('2024-12-18'),
    meetingTime: dayjs('2024-12-18T09:30'),
    meetingAgenda: 'Discuss individual student progress.',
    link: 'https://example.com/meeting-link',
    meetingType: 'Virtual',
    classRoom: '',
    isRecurring: false,
  },
  {
    id: 3,
    title: 'Class Orientation',
    status: 'Completed',
    audience: ['Students'],
    organization: ['Primary'],
    className: ['1'],
    division: ['B'],
    students: ['student3', 'student4'],
    meetingDate: dayjs('2024-12-10'),
    meetingTime: dayjs('2024-12-10T12:00'),
    meetingAgenda: 'Orientation for new students.',
    link: '',
    meetingType: 'Offline',
    classRoom: 'Auditorium',
    isRecurring: false,
  },
  {
    id: 4,
    title: 'School Board Meeting',
    status: 'Scheduled',
    audience: ['Teachers'],
    organization: ['Higher Secondary'],
    className: [],
    division: [],
    students: [],
    meetingDate: dayjs('2024-12-20'),
    meetingTime: dayjs('2024-12-20T14:00'),
    meetingAgenda: 'Discuss budget and infrastructure plans.',
    link: 'https://example.com/board-meeting',
    meetingType: 'Virtual',
    classRoom: '',
    isRecurring: false,
  },
  {
    id: 5,
    title: 'Weekly Parent Discussion',
    status: 'Scheduled',
    audience: ['Parents'],
    organization: ['Primary'],
    className: ['1'],
    division: ['C'],
    students: ['student1', 'student4'],
    meetingDate: dayjs('2024-12-14'),
    meetingTime: dayjs('2024-12-14T16:00'),
    meetingAgenda: "Discuss weekly updates on students' performance.",
    link: '',
    meetingType: 'Offline',
    classRoom: 'Room 202',
    isRecurring: true,
    repeatFrequency: 'Weekly',
    day: 'Tuesday',
    repeatUntil: dayjs('2025-03-14'),
  },
];

const AllMeetings = (props: TabComponentType) => {
  // State to store and manage the meetings data table
  const [meetingTableData, setMeetingTableData] = useState(meetings);
  // State to store the currently selected meeting for editing or viewing
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
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
          meeting.id === selectedMeeting.id
            ? { ...values, id: selectedMeeting.id }
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
  const handleDelete = (id: number) => {
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
                        setSelectedMeeting(row);
                        setIsEdit(true);
                      }}
                      handleDeleteClick={() => {
                        confirmDialog.onTrue();
                        setSelectedMeeting(row);
                      }}
                      handleViewClick={() => {
                        setSelectedMeeting(row);
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

      <CustomDialog
        title="Confirm Delete"
        open={confirmDialog.value}
        handleClose={() => {
          handleCloseDialog();
        }}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Announcement?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirmDialog.onFalse} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedMeeting.id);
            }}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default AllMeetings;
