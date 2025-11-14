'use client';

/* eslint-disable react/no-unescaped-entities */
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useState, useCallback } from 'react';
import CustomDialog from 'src/components/customDialog';
import { Box, MenuList, MenuItem } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import scheduledSurveyData from 'src/json/communication/feedback/scheduledSurveyData.json';

import ViewSummary from './viewSummary';
import PastSurveyTable from './pastSurveyTable';
import { ViewSurveyDetail } from '../activeSurvey/components/viewDetails';

const PastSurvey = (props: TabComponentType) => {
  // State to store and manage survey table data
  const [surveyTableData, setSurveyTableData] = useState<any | null>(scheduledSurveyData);
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
        sx={{ mb: 2 }}
      />
      <PastSurveyTable
        data={surveyTableData}
        onViewDetails={(survey) => {
          setViewSurvey(survey);
          viewDetailsDialog.onTrue();
        }}
        onViewSummary={() => viewSummaryDialog.onTrue()}
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
