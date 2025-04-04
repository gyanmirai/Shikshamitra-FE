'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import { Box, Chip, Card, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewMeeting from './meetingForm';

import type { TMeeting } from './type';

const meetings: TMeeting[] = [
  {
    id: 1,
    title: 'Monthly Staff Meeting',
    status: 'Scheduled',
    audience: ['Teacher'],
    organization: ['ABC School'],
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
    audience: ['Parent'],
    organization: [],
    className: ['10'],
    division: ['A'],
    students: ['Student1', 'Student2'],
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
    audience: ['Student'],
    organization: [],
    className: ['8'],
    division: ['B'],
    students: ['Student3', 'Student4'],
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
    audience: ['Teacher'],
    organization: ['XYZ Education Trust'],
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
    audience: ['Parent'],
    organization: [],
    className: ['9'],
    division: ['C'],
    students: ['Student5', 'Student6'],
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
  // State to track whether we are in edit mode or create mode
  const [isEdit, setIsEdit] = useState(false);
  // State to control the visibility of the meeting dialog/modal
  const [params, setParams] = useSearchParam({ isForm: 'false' });

  /**
   * Handles closing the meeting dialog/form
   * Resets form state, selected meeting and edit mode
   */
  const handleCloseDialog = () => {
    setParams({ isForm: 'false' });
    setSelectedMeeting(null);
    setIsEdit(false);
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

  return (
    <Box>
      {params.isForm === 'true' ? (
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
          <Card>
            <AddNewMeeting
              initialValues={selectedMeeting}
              onSubmit={handleSubmit}
              isEdit={isEdit}
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
                  setParams({ isForm: 'true' });
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
                        // setOpen(true);
                        // setEditingEvent(row);
                      }}
                      handleDeleteClick={() => {
                        // confirm_dialog.onTrue();
                        // setDeleteEvent(row.id);
                      }}
                      handleViewClick={() => {
                        // handleEyeClick(row.id);
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
    </Box>
  );
};

export default AllMeetings;
