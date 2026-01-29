'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import scheduledSurveyData from 'src/json/communication/feedback/scheduledSurveyData.json';
import { Box, Chip, MenuItem, MenuList, Typography, CircularProgress } from '@mui/material';

import PublishSurveyDialog from './components/publishSurveyDialog';
import QuizSolutionComponent from './components/quizSolutionComponent';
import { ViewSurveyDetail } from '../scheduledSurvey/viewSurveyDetail';

import type { ISurvey } from '../type';

const ActiveSurvey = (props: TabComponentType) => {
  // Modal state for publishing survey
  const publish_modal = useBoolean();
  // State to store survey being published
  const [publishingSurvey, setPublishingSurvey] = useState<ISurvey | null>(null);
  // State to store all survey data
  const [surveyTableData, setSurveyTableData] = useState<ISurvey[]>(scheduledSurveyData);
  // Modal state for adding new survey
  // Modal state for viewing survey details
  const viewDetailsDialog = useBoolean();
  // State to store survey being viewed
  const [viewSurvey, setViewSurvey] = useState<ISurvey | null>(null);
  // Modal state for viewing survey responses
  const viewResponseDialog = useBoolean();
  // State to store survey whose responses are being viewed
  const [, setResponseSurvey] = useState<ISurvey | null>(null);

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
                    setPublishingSurvey(row as ISurvey);
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
                    setViewSurvey(row as ISurvey);
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

      <PublishSurveyDialog
        open={publish_modal.value}
        survey={publishingSurvey}
        onClose={handleClose}
        onPublish={handlePublish}
      />

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
            <QuizSolutionComponent />
          </Scrollbar>
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default ActiveSurvey;
