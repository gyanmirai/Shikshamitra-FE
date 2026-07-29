'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@mui/material';
import { useSelector } from 'react-redux';
import AddRounded from '@mui/icons-material/AddRounded';
import { hasGrantedPermission } from 'src/utils/permissions';
import { AdmissionCrmPipelineColumnKey } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { ApplicantWorklistWorkspace } from './applicant-worklist-workspace';

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
      <ApplicantWorklistWorkspace
        title="Registration"
        description="Invite eligible applicants, enter paper forms, verify documents, and confirm readiness."
        tableId="student-enrollment-registration"
        defaultColumn={AdmissionCrmPipelineColumnKey.RegistrationPending}
        columns={[
          { key: AdmissionCrmPipelineColumnKey.Eligible, label: 'Eligible' },
          { key: AdmissionCrmPipelineColumnKey.RegistrationPending, label: 'Registration pending' },
          { key: AdmissionCrmPipelineColumnKey.RegistrationDone, label: 'Registration done' },
        ]}
        applicantTab="registration"
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
