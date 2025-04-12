'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import scheduledSurveyData from 'src/json/communication/feedback/scheduledSurveyData.json';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewSurvey from '../surveyForm';
import ScheduledSurveyTable from './scheduledSurveyTable';

import type { ISurvey } from '../type';

const ScheduledSurvey = (props: TabComponentType) => {
  // Modal state for publishing survey
  const publish_modal = useBoolean();
  const [publishingSurvey, setPublishingSurvey] = useState<ISurvey | null>(null);
  // Table data state for surveys
  const [surveyTableData, setSurveyTableData] = useState<ISurvey[]>(scheduledSurveyData);
  // Dialog state for viewing survey details
  const viewDetailsDialog = useBoolean();
  const [viewSurvey, setViewSurvey] = useState<ISurvey | null>(null);
  const [params, setParams] = useSearchParam({ isForm: 'false' });

  // Dialog state for viewing survey responses
  const viewResponseDialog = useBoolean();

  /**
   * Handles closing the survey form and resetting all related states
   */
  const handleClose = () => {
    setParams({ isForm: 'false' });
    setPublishingSurvey(null);
    publish_modal.onFalse();
    setViewSurvey(null);
    viewDetailsDialog.onFalse();
    viewResponseDialog.onFalse();
  };

  /**
   * Handles closing a specific survey by updating its status and end date
   * @param id - The ID of the survey to close
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

  return (
    <Box>
      {params.isForm === 'true' ? (
        <>
          <CustomBreadcrumbs
            heading="Scheduled Survey"
            description="Create or edit a survey with questions and options, and schedule it for your desired audience."
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Survey' },
              { name: 'Scheduled Survey' },
              { name: 'Survey Form' },
            ]}
            sx={{ px: 1, mb: 2 }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={handleClose}
              >
                Back
              </Button>
            }
          />
          <Card>
            <AddNewSurvey />
          </Card>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Scheduled Survey"
            description="View all scheduled surveys, track their status, and manage existing surveys efficiently."
            links={[
              { name: 'Communication', href: '/communication/dashboard' },
              { name: 'Survey' },
              { name: 'Scheduled Survey' },
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
                Survey
              </Button>
            }
          />
          <ScheduledSurveyTable
            data={surveyTableData}
            onDelete={handleCloseSurvey}
            onEdit={(survey) => {
              // setEditingSurvey(survey);
              // setParams({ isForm: 'true' });
            }}
            onView={(survey) => {
              setViewSurvey(survey);
              viewDetailsDialog.onTrue();
            }}
          />
        </>
      )}
    </Box>
  );
};

export default ScheduledSurvey;
