'use client';

import type {
  AssessmentSession,
  AssessmentSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetAssessmentScopesQuery,
  useGetAssessmentSessionsQuery,
  useCreateAssessmentSessionMutation,
  useUpdateAssessmentSessionMutation,
} from 'src/redux/student/admissions/admission-assessment-sessions-api';

import { AdmissionQueryError } from './admission-query-error';
import { assessmentScopeKey } from './assessments/assessment-utils';
import { useAssessmentScope } from './assessments/use-assessment-scope';
import { AssessmentSessionTable } from './assessments/assessment-session-table';
import { AssessmentSessionDialog } from './assessments/assessment-session-dialog';
import { useAssessmentPermissions } from './assessments/use-assessment-permissions';
import { CancelAssessmentSessionDialog } from './assessments/cancel-assessment-session-dialog';

export default function AdmissionAssessmentsScreen() {
  const permissions = useAssessmentPermissions();
  const scopes = useGetAssessmentScopesQuery();
  const { scopeKey, setScope } = useAssessmentScope();
  const [editing, setEditing] = useState<AssessmentSession | null | undefined>(undefined);
  const [cancelling, setCancelling] = useState<AssessmentSession | null>(null);
  const scope = scopes.data?.find((item) => assessmentScopeKey(item) === scopeKey);
  const sessions = useGetAssessmentSessionsQuery(
    {
      admissionOfferingId: scope?.admissionOfferingId ?? '',
      workflowStageDefinitionId: scope?.workflowStageDefinitionId ?? '',
    },
    { skip: !scope?.schedulingEnabled }
  );
  const [create] = useCreateAssessmentSessionMutation();
  const [update] = useUpdateAssessmentSessionMutation();
  const save = async (body: AssessmentSessionInput) => {
    if (editing) await update({ id: editing.id, body }).unwrap();
    else await create(body).unwrap();
    shikshaMitraToast.success({
      message: editing ? 'Assessment session updated' : 'Assessment session created',
    });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Assessments"
        description="Manage assessment sessions. Book applicants and record results from their application."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Applications', href: studentPaths.enrollment.applications },
          { name: 'Assessments' },
        ]}
        action={
          permissions.manageSessions && (
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={!scope?.schedulingEnabled || scopes.isFetching || scopes.isError}
              onClick={() => setEditing(null)}
            >
              Create session
            </Button>
          )
        }
      />
      {scopes.isError ? (
        <AdmissionQueryError onRetry={scopes.refetch} />
      ) : (
        <CustomSelect
          label="Offering and assessment stage"
          value={scopeKey}
          isLoading={scopes.isLoading}
          onChange={(value) => setScope(String(value))}
          options={(scopes.data ?? []).map((item) => ({
            value: assessmentScopeKey(item),
            label: `${item.offeringName} · ${item.stageName} · Workflow v${item.workflowVersion}`,
          }))}
          noOptionsMessage="No assessment stages enabled for your offerings."
        />
      )}
      {!scopes.isLoading && !scopes.isError && !scopes.data?.length && (
        <Alert severity="info">
          Enable assessment management in a workflow stage and assign its published workflow to an
          offering to start.
        </Alert>
      )}
      {scope && !scope.schedulingEnabled && (
        <Alert severity="info">
          This stage records results without scheduled sessions. Start the assessment from an
          applicant&apos;s application.
        </Alert>
      )}
      {sessions.isError && scope?.schedulingEnabled && (
        <AdmissionQueryError onRetry={sessions.refetch} />
      )}
      {scope?.schedulingEnabled && (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <AssessmentSessionTable
            sessions={sessions.currentData ?? []}
            loading={sessions.isFetching}
            canManage={permissions.manageSessions && scope.schedulingEnabled}
            onEdit={setEditing}
            onCancel={setCancelling}
          />
        </Box>
      )}
      {!scope && !!scopes.data?.length && (
        <Alert severity="info">Choose an offering and assessment stage to view its sessions.</Alert>
      )}
      {editing !== undefined && scope && (
        <AssessmentSessionDialog
          scope={scope}
          session={editing}
          onSave={save}
          onClose={() => setEditing(undefined)}
        />
      )}
      {cancelling && (
        <CancelAssessmentSessionDialog session={cancelling} onClose={() => setCancelling(null)} />
      )}
    </Box>
  );
}
