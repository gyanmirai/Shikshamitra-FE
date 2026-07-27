'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import AddRounded from '@mui/icons-material/AddRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { registrationQueues } from './operations-queue-config';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { OperationsQueueWorkspace } from './operations-queue-workspace';

const DirectRegistrationDialog = dynamic(() =>
  import('./direct-registration-dialog').then((module) => module.DirectRegistrationDialog)
);

export function RegistrationsWorkspace() {
  const [directRegistrationOpen, setDirectRegistrationOpen] = useState(false);
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const { openApplicant } = useEnrollmentWorkspace();
  const canCreateDirectRegistration =
    hasGrantedPermission(permissions, 'Students.Enrollment.AdmissionsCrm.Add') &&
    hasGrantedPermission(permissions, 'Students.Enrollment.AdmissionsCrm.IssueRegistrationForm');

  return (
    <>
      <OperationsQueueWorkspace
        title="Registration"
        description="Invite eligible applicants, enter paper forms, verify documents, and confirm readiness."
        defaultQueue={AdmissionCrmOperationsQueueType.RegistrationInvitationPending}
        allowedQueues={registrationQueues}
        applicantTab="registration"
        variant="registration"
        headerActions={
          canCreateDirectRegistration ? (
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setDirectRegistrationOpen(true)}
            >
              Enter Paper Registration
            </Button>
          ) : null
        }
      />
      {directRegistrationOpen ? (
        <DirectRegistrationDialog
          open
          onClose={() => setDirectRegistrationOpen(false)}
          onCreated={(leadId) => {
            setDirectRegistrationOpen(false);
            openApplicant(leadId, 'registration');
          }}
        />
      ) : null}
    </>
  );
}
