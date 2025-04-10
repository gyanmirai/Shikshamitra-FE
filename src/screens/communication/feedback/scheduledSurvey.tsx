'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import dayjs from 'dayjs';
import React, { useState } from 'react';

import {
  Box,
  Card,
  Chip,
  Button,
  Typography,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AddNewSurvey from './surveyForm';
import SurveyDetailsView from './surveyDetails';

import type { TSurvey } from './type';

const surveyData: TSurvey[] = [
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
    status: 'Scheduled',
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

const ScheduledSurvey = (props: TabComponentType) => {
  // Modal state for publishing survey
  const publish_modal = useBoolean();
  const [publishingSurvey, setPublishingSurvey] = useState<TSurvey | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  const [selectedSurvey, setSelectedSurvey] = useState<TSurvey | null>(null);
  // Table data state for surveys
  const [surveyTableData, setSurveyTableData] = useState<TSurvey[] | null>(surveyData);
  // Dialog state for viewing survey details
  const viewDetailsDialog = useBoolean();
  const [viewSurvey, setViewSurvey] = useState<TSurvey | null>(null);
  const [open, setOpen] = useState(false);
  // Dialog state for viewing survey responses
  const viewResponseDialog = useBoolean();
  // Dialog state for viewing survey details
  const viewDialog = useBoolean();
  // Dialog state for confirming survey deletion
  const confirm_delete = useBoolean();
  // State for storing the survey whose responses are being viewed
  const [responseSurvey, setResponseSurvey] = useState<TSurvey | null>(null);

  /**
   * Handles closing the survey form and resetting all related states
   */
  const handleClose = () => {
    confirm_delete.onFalse();
    setOpen(false);
    setPublishingSurvey(null);
    publish_modal.onFalse();
    setViewSurvey(null);
    viewDetailsDialog.onFalse();
    viewResponseDialog.onFalse();
    setResponseSurvey(null);
  };

  /**
   * Handles closing a specific survey by updating its status and end date
   * @param id - The ID of the survey to close
   */
  const handleDelete = (id: number | undefined) => {
    setSurveyTableData((surveyTableData || []).filter((survey: TSurvey) => survey.id !== id));
    handleClose();
  };

  return (
    <Box>
      {open ? (
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
                  setOpen(true);
                }}
              >
                Survey
              </Button>
            }
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
                render: (value, row) => (
                  <Typography fontSize="12px" gutterBottom>
                    {dayjs(value).format('DD MMM YYYY')}
                  </Typography>
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
                id: 'action',
                sticky: true,
                label: 'Action',
                isSort: false,
                render(value, row) {
                  return (
                    <ThreeDotsActions
                      // actions={(prop) => actions({ ...props, row })}
                      placement="right-top"
                      showEditIcon
                      showDeleteIcon
                      showViewIcon
                      showThreeDots={false}
                      handleViewClick={() => {
                        viewDialog.onTrue();
                        setSelectedSurvey(row as TSurvey);
                      }}
                      handleEditClick={() => {
                        setIsEdit(true);
                        setOpen(true);
                      }}
                      handleDeleteClick={() => {
                        confirm_delete.onTrue();
                        setSelectedSurvey(row as TSurvey);
                      }}
                    />
                  );
                },
              },
            ]}
            data={surveyTableData || []}
          />
        </>
      )}

      <CustomDialog
        title="Confirm Delete"
        open={confirm_delete.value}
        handleClose={() => {
          handleClose();
        }}
        maxWidth="sm"
      >
        <DialogContent>
          <DialogContentText>Are you sure to delete this Survey?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose();
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDelete(selectedSurvey?.id);
            }}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        title="Survey Details"
        open={viewDialog.value}
        handleClose={() => {
          setSelectedSurvey(null);
          viewDialog.onFalse();
        }}
        maxWidth="md"
      >
        <DialogContent>
          <SurveyDetailsView survey={selectedSurvey} />
        </DialogContent>
        <DialogActions>
          <Button onClick={viewDialog.onFalse} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default ScheduledSurvey;
