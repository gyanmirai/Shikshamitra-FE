'use client';

import type { Dayjs } from 'dayjs';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Paper,
  Button,
  MenuItem,
  MenuList,
  Typography,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { DetailRow } from '../announcement/schoolWiseAnnounsement';

interface Survey {
  id: number;
  surveyTitle: string;
  description: string;
  organization: string[];
  classes: string[];
  audience: string[];
  startDate: Dayjs;
  endDate: Dayjs;
  responseRate: number;
  status: 'Pending' | 'Active' | 'Closed';
}

const surveyData: Survey[] = [
  {
    id: 1,
    surveyTitle: 'Student Feedback Survey',
    description: 'Student Feedback Survey description',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Students', 'Parents'],
    startDate: dayjs('2024-10-20'),
    endDate: dayjs('2025-10-20'),
    responseRate: 45,
    status: 'Active',
  },
  {
    id: 2,
    surveyTitle: 'Teacher Evaluation Survey',
    description: 'Teacher Evaluation Survey description',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Teachers'],
    startDate: dayjs('2024-12-25'),
    endDate: dayjs('2026-05-10'),
    responseRate: 78,
    status: 'Pending',
  },
  {
    id: 3,
    surveyTitle: 'Parent Feedback Survey',
    description: 'Parent Feedback Survey description',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Parents'],
    startDate: dayjs('2023-12-23'),
    endDate: dayjs('2024-12-12'),
    responseRate: 92,
    status: 'Closed',
  },
  {
    id: 4,
    surveyTitle: 'Staff Satisfaction Survey',
    description: 'Staff Satisfaction Survey description',
    organization: ['Primary', 'Pre Primary'],
    classes: ['1'],
    audience: ['Staff', 'Administrators'],
    startDate: dayjs('2023-12-05'),
    endDate: dayjs('2025-02-04'),
    responseRate: 50,
    status: 'Active',
  },
];

const ActiveSurvey = (props: TabComponentType) => {
  // Modal state for publishing survey
  const publish_modal = useBoolean();
  // State to store survey being published
  const [publishingSurvey, setPublishingSurvey] = useState<any | null>(null);
  // State to store all survey data
  const [surveyTableData, setSurveyTableData] = useState(surveyData);
  // Modal state for adding new survey
  const addNewSurveyDialog = useBoolean();
  // Modal state for viewing survey details
  const viewDetailsDialog = useBoolean();
  // State to store survey being viewed
  const [viewSurvey, setViewSurvey] = useState<any | null>(null);
  // Modal state for viewing survey responses
  const viewResponseDialog = useBoolean();
  // State to store survey whose responses are being viewed
  const [responseSurvey, setResponseSurvey] = useState<any | null>(null);

  /**
   * Handles closing of all modals and resets related state variables
   */
  const handleClose = () => {
    setPublishingSurvey(null);
    publish_modal.onFalse();
    setViewSurvey(null);
    viewDetailsDialog.onFalse();
    viewResponseDialog.onFalse();
    setResponseSurvey(null);
  };

  /**
   * Handles publishing of a survey by updating its status to 'Active'
   * @param survey - The survey object to be published
   */
  const handlePublish = (survey: any) => {
    setSurveyTableData((prevData) =>
      prevData.map((item) =>
        item.id === survey.id
          ? {
              ...item,
              status: 'Active',
              publishDate: dayjs(),
            }
          : item
      )
    );
    publish_modal.onFalse();
    setPublishingSurvey(null);
  };

  /**
   * Handles closing of a survey by updating its status to 'Closed'
   * @param id - The ID of the survey to be closed
   */
  const handleCloseSurvey = (id: number) => {
    setSurveyTableData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Closed',
              endDate: dayjs(),
            }
          : item
      )
    );
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              viewResponseDialog.onTrue();
              setResponseSurvey(row);
            }}
          >
            <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
            View Responses
          </MenuItem>

          {row.status === 'Pending' && (
            <MenuItem
              onClick={() => {
                //   addAnounsmentDialog.onTrue();
                //   setEditingAnnouncement(row);
              }}
            >
              <Iconify icon="mdi:bell" sx={{ mr: 1 }} />
              Send Reminder
            </MenuItem>
          )}
          {row.status === 'Active' && (
            <MenuItem
              onClick={() => {
                handleCloseSurvey(row.id);
              }}
            >
              <Iconify icon="mdi:delete" sx={{ mr: 1 }} />
              Close Survey
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewResponseDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Active Survey"
        description="Browse all currently active surveys that are live and open for responses."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Survey' },
          { name: 'Active Survey' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />

      <CustomizableTable
        tableId="survey"
        columns={[
          { id: 'surveyTitle', label: 'Survey Title', minWidth: '180px', align: 'left' },
          {
            id: 'audience',
            label: 'Audience',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((audience: string) => (
                  <Chip key={audience} label={audience} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'organization',
            label: 'Organizations',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((org: string) => (
                  <Chip key={org} label={org} size="small" variant="outlined" />
                ))}
              </Box>
            ),
          },
          {
            id: 'classes',
            label: 'Class',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((className: string) => (
                  <Chip
                    key={className}
                    label={className}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            ),
          },
          {
            id: 'startDate',
            label: 'Start Date',
            minWidth: '180px',
            align: 'left',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'endDate',
            label: 'End Date',
            minWidth: '180px',
            align: 'left',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'responseRate',
            label: 'Response Rate',
            minWidth: '180px',
            align: 'left',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
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
            id: 'status',
            label: 'Response Status',
            minWidth: '200px',
            align: 'left',
            render: (value, row) =>
              value === 'Pending' ? (
                <Label
                  variant="soft"
                  color="warning"
                  onClick={() => {
                    publish_modal.onTrue();
                    setPublishingSurvey(row);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  {value}
                </Label>
              ) : value === 'Active' ? (
                <Label variant="soft" color="primary">
                  {value}
                </Label>
              ) : (
                <Label variant="soft" color="error">
                  {value}
                </Label>
              ),
          },
          {
            id: 'action',
            sticky: true,
            label: 'Action',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showEditIcon
                  showViewIcon
                  handleViewClick={() => {
                    viewDetailsDialog.onTrue();
                    setViewSurvey(row);
                  }}
                  handleEditClick={() => {
                    // addAnounsmentDialog.onTrue();
                    // setEditingAnnouncement(row);
                  }}
                />
              );
            },
          },
        ]}
        data={surveyTableData}
      />

      <CustomDialog
        title="Do you want to Active this Survey ?"
        open={publish_modal.value}
        handleClose={handleClose}
        maxWidth="sm"
      >
        <DialogContent>
          {publishingSurvey && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h5">Survey Details</Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Title</Typography>
                <Typography>{publishingSurvey.title}</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography>{publishingSurvey.description}</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Audience</Typography>
                <Typography>{publishingSurvey.audience}</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2">Scheduled Date</Typography>
                <Typography>
                  {dayjs(publishingSurvey.startDate).format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => handlePublish(publishingSurvey)}
            variant="contained"
            color="primary"
          >
            Publish Now
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Survey Detail View"
        open={viewDetailsDialog.value}
        handleClose={handleClose}
        maxWidth="md"
      >
        <ViewSurveyDetail survey={viewSurvey} />
      </CustomDialog>

      <CustomDialog
        title="Survey Detail View"
        open={viewResponseDialog.value}
        handleClose={handleClose}
        maxWidth="md"
      >
        <Box sx={{ p: 2 }}>
          <Scrollbar sx={{ height: '400px' }}>
            <ResponseComponent />
          </Scrollbar>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default ActiveSurvey;

/**
 * Interface representing a single question and its answer in a survey response
 */
interface questionData {
  id: string; // Unique identifier for the question
  question: string; // The actual question text
  answer: string; // The respondent's answer to the question
}

/**
 * Interface representing a complete survey response from a participant
 */
interface responseData {
  id: string; // Unique identifier for the response
  responsendedName: string; // Name of the person who responded
  role: string; // Role of the respondent (e.g., Student, Parent)
  responsendedEmail: string; // Email address of the respondent
  response: questionData[]; // Array of questions and answers submitted
}

const responseTableData: responseData[] = [
  {
    id: '1',
    responsendedName: 'John Doe',
    role: 'Student',
    responsendedEmail: 'john.doe@student.edu',
    response: [
      { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Excellent' },
      {
        id: 'q2',
        question: 'Are you satisfied with the course materials provided?',
        answer: 'Yes, very satisfied',
      },
      { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '2 hours' },
    ],
  },
  {
    id: '2',
    responsendedName: 'Mary Smith',
    role: 'Parent',
    responsendedEmail: 'mary.smith@parent.edu',
    response: [
      {
        id: 'q1',
        question: 'How do you feel about the school’s communication with parents?',
        answer: 'Good, but can improve',
      },
      {
        id: 'q2',
        question: 'Are you satisfied with the academic progress of your child?',
        answer: 'Yes',
      },
      {
        id: 'q3',
        question: 'How involved are you in your child’s studies?',
        answer: 'I help with homework regularly',
      },
    ],
  },
  {
    id: '3',
    responsendedName: 'Alice Brown',
    role: 'Student',
    responsendedEmail: 'alice.brown@student.edu',
    response: [
      { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Good' },
      {
        id: 'q2',
        question: 'Are you satisfied with the course materials provided?',
        answer: 'Mostly, but some materials need updating',
      },
      { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '1 hour' },
    ],
  },
  {
    id: '4',
    responsendedName: 'Robert Johnson',
    role: 'Parent',
    responsendedEmail: 'robert.johnson@parent.edu',
    response: [
      {
        id: 'q1',
        question: 'How do you feel about the school’s communication with parents?',
        answer: 'Excellent',
      },
      {
        id: 'q2',
        question: 'Are you satisfied with the academic progress of your child?',
        answer: 'Very satisfied',
      },
      {
        id: 'q3',
        question: 'How involved are you in your child’s studies?',
        answer: 'I monitor assignments and grades',
      },
    ],
  },
  {
    id: '5',
    responsendedName: 'Linda White',
    role: 'Student',
    responsendedEmail: 'linda.white@student.edu',
    response: [
      { id: 'q1', question: 'How do you rate the quality of the teaching?', answer: 'Fair' },
      {
        id: 'q2',
        question: 'Are you satisfied with the course materials provided?',
        answer: 'No, some materials are outdated',
      },
      { id: 'q3', question: 'How much time do you spend on homework daily?', answer: '3 hours' },
    ],
  },
];

const ResponseComponent = () => {
  // Initialize table data state with response data - setTableData is currently unused
  const [tableData, setTableData] = useState<any>(responseTableData);

  return (
    <CustomizableTable
      tableId="responseTable"
      columns={[
        {
          id: 'responsendedName',
          label: 'Respodent Name',
          children(row) {
            return (
              <>
                {row.response.length > 0 && (
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Scrollbar sx={{ height: '200px' }}>
                      {row.response.map((val: any, index: any) => (
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
                )}
              </>
            );
          },
        },
        {
          id: 'role',
          label: 'Role',
        },
        {
          id: 'responsendedEmail',
          label: 'Email',
        },
      ]}
      data={tableData}
    />
  );
};

export const ViewSurveyDetail = ({ survey }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
    <Scrollbar sx={{ height: '500px' }}>
      <Typography variant="h6" mb={1}>
        Audience Details
      </Typography>
      <Box sx={{ display: 'flex' }}>
        <Card sx={{ p: 1, width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Iconify icon="mdi:bullhorn-outline" className="text-gray-500 w-6 h-6" />
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
          <DetailRow
            label="Audience"
            icon="mdi:account-group-outline"
            value={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {survey?.audience?.map((aud: any) => (
                  <Chip key={aud} label={aud} size="small" variant="outlined" />
                ))}
              </Box>
            }
          />

          <DetailRow
            label="Response Rate"
            icon="mdi:information-outline"
            value={
              <Label
                variant="soft"
                color={
                  survey?.status === 'Active'
                    ? 'primary'
                    : survey?.status === 'Pending'
                      ? 'warning'
                      : survey?.status === 'Closed'
                        ? 'error'
                        : 'default'
                }
              >
                {survey?.responseRate}
              </Label>
            }
          />
        </Card>
      </Box>
      <Typography variant="h6" mb={1} mt={1}>
        Responses Details
      </Typography>
      <ResponseComponent />
      <AnalyticsCurrentVisits
        title="Analysis Chart"
        chart={{
          series: [
            { label: 'Question 1', value: 35 },
            { label: 'Question 2', value: 25 },
            { label: 'Question 3', value: 15 },
            { label: 'Question 4', value: 50 },
          ],
        }}
        sx={{ boxShadow: 'none' }}
      />
    </Scrollbar>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button variant="contained">Download Responses</Button>
    </Box>
  </Box>
);
