import type { LabelColor } from 'src/components/label';
import type { Meeting } from 'src/screens/communication/meetings/AllMeetings';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Card, Grid, Chip, Paper, Button, Typography, CircularProgress } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';
import { surveyData } from 'src/screens/communication/feedback/pastFeedback';
import { DetailRow } from 'src/screens/communication/announcement/schoolWiseAnnounsement';
import {
  AttendanceStatusType,
  AttendanceStatusOptions,
  AttendanceStatusTypeColors,
} from 'src/enums/attendance-type';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view';

import type { StudentTabsComponentType } from '.';

const meetings: Meeting[] = [
  {
    id: 1,
    title: 'Monthly Staff Meeting',
    status: 'Present',
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
    status: 'Absent',
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
    status: 'Present',
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
    status: 'Absent',
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
    status: 'Absent',
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

const Communication = (props: StudentTabsComponentType) => {
  const [meetingTableData, setMeetingTableData] = useState(meetings);
  const [surveyTableData, setSurveyTableData] = useState<any | null>(surveyData);
  const viewDetailsDialog = useBoolean();
  const viewSummaryDialog = useBoolean();

  const [viewSurvey, setViewSurvey] = useState<any | null>(null);

  const handleClose = () => {
    setViewSurvey(null);
    viewDetailsDialog.onFalse();
    viewSummaryDialog.onFalse();
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              display: 'flex',
              p: 1,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle2' }}>New Announcement</Box>
              <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    width: '100%',
                    padding: 0,
                  }}
                >
                  {[
                    'Student record updated',
                    'Student attendance updated',
                    'Student record updated',
                    'Student record updated',
                    'Student attendance updated',
                    'Student record updated',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              display: 'flex',
              p: 1,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle2' }}>Upcoming Events</Box>
              <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    width: '100%',
                    padding: 0,
                  }}
                >
                  {[
                    'Student record updated',
                    'Student attendance updated',
                    'Student record updated',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              display: 'flex',
              p: 1,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.info.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle2' }}>New Messages</Box>
              <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    width: '100%',
                    padding: 0,
                  }}
                >
                  {[
                    'Student record updated',
                    'Student attendance updated',
                    'Student record updated',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              display: 'flex',
              p: 1,
              width: '100%',
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ typography: 'subtitle2' }}>Pending Survey</Box>
              <Scrollbar sx={{ mt: 1.5, mb: 1, height: '150px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    width: '100%',
                    padding: 0,
                  }}
                >
                  {[
                    'Student record updated',
                    'Student attendance updated',
                    'Student record updated',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="h6">Past Survey</Typography>
      </Box>
      <CustomizableTable
        tableId="survey-table"
        columns={[
          { id: 'surveyTitle', label: 'Survey Title' },
          { id: 'description', label: 'Survey Description' },
          {
            id: 'endDate',
            label: 'Submit Date',
            align: 'left',
            filterType: 'date',
            minWidth: '180px',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'responseRate',
            label: 'Response Rate',
            align: 'left',
            filterType: 'number',
            minWidth: '180px',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex', ml: 2 }}>
                  <CircularProgress variant="determinate" value={value} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    viewDetailsDialog.onTrue();
                    setViewSurvey(row);
                  }}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={surveyTableData}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="h6">Previous Meetings</Typography>
      </Box>
      <CustomizableTable
        tableId="meeting-table"
        columns={[
          { id: 'title', label: 'Title' },
          { id: 'meetingType', label: 'Meeting Type', align: 'left', minWidth: '180px' },
          {
            id: 'meetingDate',
            label: 'Meeting Date',
            align: 'left',
            filterType: 'date',
            minWidth: '180px',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'meetingTime',
            label: 'Meeting Time',
            align: 'left',
            minWidth: '180px',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('HH:mm')}
              </Typography>
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
            filterType: 'enum',
            enumOptions: AttendanceStatusOptions,
            render(value, row) {
              const color = AttendanceStatusTypeColors[value as AttendanceStatusType] as LabelColor;
              return (
                <Label color={color}>{AttendanceStatusType[value as AttendanceStatusType]}</Label>
              );
            },
          },
        ]}
        data={meetingTableData}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="h6">Events</Typography>
      </Box>
      <CalendarView />
      <CustomDialog
        title="Survey Detail View"
        open={viewDetailsDialog.value}
        handleClose={handleClose}
        maxWidth="md"
      >
        <ViewSurveyDetail survey={viewSurvey} />
      </CustomDialog>
    </Box>
  );
};

export default Communication;

const response = [
  { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Excellent' },
  {
    id: 'q2',
    question: 'Are you satisfied with the course materials provided?',
    answer: 'Yes, very satisfied',
  },
  { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '2 hours' },
];

export const ViewSurveyDetail = ({ survey }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
    <Scrollbar sx={{ height: '400px' }}>
      <Box sx={{ display: 'flex' }}>
        <Card sx={{ p: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="h6" className="font-semibold">
              {survey?.surveyTitle}
            </Typography>
          </Box>
          <hr className="my-6 border-gray-200" />
          <DetailRow
            label="Description"
            icon="mdi:text-box-outline"
            value={
              <Typography variant="body2" className="text-gray-700">
                {survey?.description}
              </Typography>
            }
          />
        </Card>
      </Box>
      <Typography variant="h6" mb={1} mt={1}>
        Responses Details
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Scrollbar sx={{ height: '200px' }}>
          {response.map((val: any, index: any) => (
            <React.Fragment key={index}>
              <Box display="flex" alignItems="center" gap={2}>
                <Paper elevation={4} sx={{ p: 2, width: '100%', mt: 1 }}>
                  <Typography variant="body1">Question: {val.question}</Typography>
                  <Typography variant="body2">Answer: {val.answer}</Typography>
                </Paper>
              </Box>
            </React.Fragment>
          ))}
        </Scrollbar>
      </Box>
    </Scrollbar>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button variant="contained">Close Survey</Button>
    </Box>
  </Box>
);
