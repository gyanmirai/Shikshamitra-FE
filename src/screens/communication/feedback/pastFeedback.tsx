'use client';

/* eslint-disable react/no-unescaped-entities */
import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState, useCallback } from 'react';

import {
  Box,
  Card,
  Chip,
  Grid,
  Button,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { ViewSurveyDetail } from './activeSurvey';

import type { TSurvey } from './type';

export const surveyData: TSurvey[] = [
  {
    id: 1,
    surveyTitle: 'Student Feedback Survey',
    description: 'A survey to gather feedback from students about their learning experience.',
    organization: ['Primary', 'Secondary'],
    classes: ['1', '2', '3'],
    audience: ['Students'],
    startDate: dayjs('2024-10-20'),
    endDate: dayjs('2025-10-20'),
    numberOfResponses: 200,
    responseRate: 80,
    status: 'Active',
  },
  {
    id: 2,
    surveyTitle: 'Parent Satisfaction Survey',
    description: 'Survey to assess parent satisfaction with school facilities and communication.',
    organization: ['Pre Primary', 'Primary'],
    classes: ['Nursery', 'KG', '1'],
    audience: ['Parents'],
    startDate: dayjs('2024-12-25'),
    endDate: dayjs('2026-05-10'),
    numberOfResponses: 120,
    responseRate: 60,
    status: 'Closed',
  },
];

const PastSurvey = (props: TabComponentType) => {
  // State to store and manage survey table data
  const [surveyTableData, setSurveyTableData] = useState<any | null>(surveyData);
  // Controls the visibility state of the survey details dialog/modal
  const viewDetailsDialog = useBoolean();
  // Controls the visibility state of the survey summary statistics dialog/modal
  const viewSummaryDialog = useBoolean();

  // State to store the currently selected survey for viewing
  const [viewSurvey, setViewSurvey] = useState<any | null>(null);

  /**
   * Handles closing of survey detail and summary dialogs
   * Resets the selected survey view and closes both dialogs
   */
  const handleClose = () => {
    setViewSurvey(null);
    viewDetailsDialog.onFalse();
    viewSummaryDialog.onFalse();
  };

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              viewSummaryDialog.onTrue();
            }}
          >
            <Iconify icon="mdi:eye" sx={{ mr: 1 }} />
            View Summary
          </MenuItem>
        </MenuList>
      </>
    ),
    [viewSummaryDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Past Survey"
        description="View and analyze past survey data"
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Survey' },
          { name: 'Past Survey' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomizableTable
        tableId="survey-table"
        columns={[
          { id: 'surveyTitle', label: 'Survey Title' },
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
            id: 'endDate',
            label: 'End Date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'responseRate',
            label: 'Response Rate',
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
            id: 'action',
            label: 'Action',
            sticky: true,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    viewDetailsDialog.onTrue();
                    setViewSurvey(row);
                  }}
                />
              );
            },
          },
        ]}
        data={surveyTableData}
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
        title="Summary Report"
        open={viewSummaryDialog.value}
        handleClose={handleClose}
        maxWidth="md"
      >
        <ViewSummary />
      </CustomDialog>
    </Box>
  );
};

export default PastSurvey;

// Component to display a summary view of survey responses including metadata, analytics, and insights
const ViewSummary = () => (
  <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', p: 2 }}>
    {/* Scrollable container for survey summary content */}
    <Scrollbar sx={{ height: '500px' }}>
      <Grid container spacing={2}>
        {/* Survey metadata section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Survey Metadata</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField size="small" label="Parent Satisfaction Survey - 2023" value="" />
              <TextField size="small" label="Audience" value="" />
              <TextField size="small" label="Term" value="" />
              <TextField size="small" label="Response Rate" />
            </Box>
            <Button
              variant="contained"
              sx={{ justifySelf: 'flex-end', alignSelf: 'flex-end', mt: 1 }}
            >
              Download Report
            </Button>
          </Card>
        </Grid>
        {/* Analytics visualization section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <AnalyticsCurrentVisits
              title="Multiple Choice Question"
              chart={{
                series: [
                  { label: '', value: 35 },
                  { label: '', value: 25 },
                  { label: '', value: 15 },
                  { label: '', value: 50 },
                ],
              }}
              sx={{ boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Qualitative responses analysis section */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Qualitative responses analysis
              </Typography>
              <Typography variant="body1" gutterBottom>
                Question: What suggestions do you have for improving school events?
              </Typography>
              <Typography variant="body1" gutterBottom>
                Type: Open-ended question
              </Typography>
              <Typography variant="body1" gutterBottom>
                Word Cloud: "more sports events," "cultural programs," and "parent involvement."
              </Typography>
              <Typography variant="body1" gutterBottom>
                Response List:
              </Typography>
              <Typography variant="body2" gutterBottom>
                "It would be great if parents could participate in sports day activities."
              </Typography>
              <Typography variant="body2" gutterBottom>
                "More interactive cultural events would be appreciated."
              </Typography>
              <Typography variant="body1" gutterBottom>
                Insight: e.g., "Plan more cultural events based on parent feedback"
              </Typography>
            </Card>
          </Grid>

          {/* Overall survey insights section */}
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Overall Survey Insights
              </Typography>
              <Typography variant="body1" gutterBottom>
                Positive Feedback : What suggestions do you have for improving school events?
              </Typography>
              <Typography variant="body1" gutterBottom>
                Areas for Improvement: Open-ended question
              </Typography>
              <Typography variant="body1" gutterBottom>
                Actionable Suggestions : "more sports events," "cultural programs," and "parent
                involvement."
              </Typography>
              <Typography variant="body1" gutterBottom>
                Recommendation :
              </Typography>
              <Typography variant="body2" gutterBottom>
                "It would be great if parents could participate in sports day activities."
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Scrollbar>
  </Box>
);
