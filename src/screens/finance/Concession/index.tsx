'use client';

import { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetConcessionsQuery } from 'src/redux/feeConcession/feeConcession';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ConcessionRequestForm from './Components/ConcessionRequestForm';
import StudentConcessionTable from './Components/StudentConcessionTable';
import ViewStudentAllConcession from './Components/ViewStudentAllConcession';
import ViewConcessionRequest from '../ConcessionAdmin/ConcessionAdminViewForm';

import type { IStudentInfo } from './type';
import type { IViewConcessionRequestProps } from '../ConcessionAdmin/type';

const Concession = () => {
  // Boolean state to control the visibility of add concession request modal/form
  const addConcessionRequest = useBoolean();
  const viewConcessionRequest = useBoolean();
  const onViewAllConcession = useBoolean();

  const { data: concessionData, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionsQuery,
  });

  // State to store th  e selected student concession data
  // null when no student is selected
  const [selectedConcessionForView, setSelectedConcessionForView] =
    useState<IViewConcessionRequestProps | null>(null);

  // State to store th  e selected student concession data
  // null when no student is selected
  const [selectedConcession, setSelectedConcession] = useState<IStudentInfo | null>(null);
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Concession"
        description="View and manage student concession requests."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Concession', href: '/finance/concession-type' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <StudentConcessionTable
        data={concessionData}
        onRequestConcession={(data) => {
          setSelectedConcession(data);
          addConcessionRequest.onTrue();
        }}
        onViewConcession={(data) => {
          setSelectedConcessionForView(data);
          viewConcessionRequest.onTrue();
        }}
        onViewAllConcession={(data) => {
          setSelectedConcession(data);
          onViewAllConcession.onTrue();
        }}
      />

      <CustomDialog
        open={addConcessionRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Request Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Submit a concession request by specifying details for the selected student."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          addConcessionRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <ConcessionRequestForm
          open={addConcessionRequest.value}
          onClose={(data, refresh) => {
            addConcessionRequest.onFalse();
            setSelectedConcession(null);
          }}
          student={selectedConcession as IStudentInfo}
        />
      </CustomDialog>

      <CustomDialog
        open={onViewAllConcession.value}
        title={`${selectedConcession?.studentName} concession`}
        handleClose={() => {
          setSelectedConcession(null);
          onViewAllConcession.onFalse();
        }}
        maxWidth="sm"
      >
        {selectedConcession && <ViewStudentAllConcession data={selectedConcession} />}
      </CustomDialog>

      <CustomDialog
        open={viewConcessionRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Review the student’s concession request and take action to approve or reject it."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          viewConcessionRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <ViewConcessionRequest
          viewConcessionRequest={viewConcessionRequest}
          onClose={() => {
            viewConcessionRequest.onFalse();
            setSelectedConcession(null);
          }}
          student={selectedConcessionForView as unknown as IStudentInfo}
          documents={selectedConcessionForView?.documents}
          onApprove={() => {
            // Handle approve logic
          }}
          onReject={() => {
            // Handle reject logic
          }}
          onMismatch={() => {
            // Handle mismatch logic
          }}
        />
      </CustomDialog>
    </Box>
  );
};

export default Concession;
