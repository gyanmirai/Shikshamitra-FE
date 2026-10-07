'use client';

import type { RootState } from 'src/redux/store';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentScope,
  AssessmentSession,
  AssessmentSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, Tooltip, IconButton, LinearProgress } from '@mui/material';
import {
  useCreateAssessmentSessionMutation,
  useUpdateAssessmentSessionMutation,
} from 'src/redux/student/admissions/admission-assessment-sessions-api';

import { AdmissionQueryError } from './admission-query-error';
import { AdmissionAcademicFilters } from './admission-academic-filters';
import { AssessmentSessionTable } from './assessments/assessment-session-table';
import { AssessmentActionDialog } from './assessments/assessment-action-dialog';
import { AssessmentSessionDialog } from './assessments/assessment-session-dialog';
import { useAssessmentPermissions } from './assessments/use-assessment-permissions';
import { AssessmentApplicantTable } from './assessments/assessment-applicant-table';
import { AssessmentContinueDialog } from './assessments/assessment-continue-dialog';
import { useAssessmentWorkbenchData } from './assessments/use-assessment-workbench-data';
import { assessmentScopeKey, assessmentScopeLabel } from './assessments/assessment-utils';
import { AssessmentWorkbenchControls } from './assessments/assessment-workbench-controls';
import { CancelAssessmentSessionDialog } from './assessments/cancel-assessment-session-dialog';
import {
  AssessmentInsightsDrawer,
  AssessmentApplicantDrawer,
} from './assessments/assessment-workbench-drawers';

import type { AssessmentAction } from './assessments/assessment-action-model';

export default function AdmissionAssessmentsScreen() {
  const permissions = useAssessmentPermissions();
  const granted = useSelector((state: RootState) => state.auth.permissions);
  const canViewApplication = hasGrantedPermission(granted, 'Students.Admissions.Applications.View');
  const canAdvance =
    canViewApplication && hasGrantedPermission(granted, 'Students.Admissions.Applications.Advance');
  const [insights, setInsights] = useState(false);
  const [showAcademicFilters, setShowAcademicFilters] = useState(false);
  const [details, setDetails] = useState<AssessmentRosterItem | null>(null);
  const [action, setAction] = useState<{
    row: AssessmentRosterItem;
    action: AssessmentAction | 'continue';
    offeringId: string;
    definitionId: string;
    sessionId: string;
  } | null>(null);
  const workbench = useAssessmentWorkbenchData(permissions.view, insights);
  const {
    academic,
    scopes,
    scopeKey,
    setScope,
    visibleScopes,
    visibleScope,
    state,
    href,
    updateWorkbench,
    sessions,
    sessionId,
    invalidSession,
    sessionLookupUnavailable,
    applicants,
  } = workbench;
  const [editing, setEditing] = useState<{
    session: AssessmentSession | null;
    scope: AssessmentScope;
  } | null>(null);
  const [cancelling, setCancelling] = useState<AssessmentSession | null>(null);
  const [create] = useCreateAssessmentSessionMutation();
  const [update] = useUpdateAssessmentSessionMutation();
  const save = async (body: AssessmentSessionInput) => {
    if (editing?.session) await update({ id: editing.session.id, body }).unwrap();
    else await create(body).unwrap();
    shikshaMitraToast.success({
      message: editing?.session ? 'Assessment session updated' : 'Assessment session created',
    });
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Assessments"
        description="Schedule sessions, manage applicant assessments and continue completed steps."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.applications },
          { name: 'Assessments' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:chart-box-outline" />}
              disabled={
                !visibleScope || invalidSession || sessionLookupUnavailable || scopes.isError
              }
              onClick={() => setInsights(true)}
            >
              View all insights
            </Button>
            {permissions.manageSessions && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                disabled={!visibleScope?.schedulingEnabled || scopes.isFetching || scopes.isError}
                onClick={() => visibleScope && setEditing({ session: null, scope: visibleScope })}
              >
                Create session
              </Button>
            )}
          </Stack>
        }
      />
      <Box
        id="assessment-academic-filters"
        sx={{ display: { xs: showAcademicFilters ? 'block' : 'none', lg: 'block' }, flexShrink: 0 }}
      >
        <AdmissionAcademicFilters
          boardId={academic.boardId}
          mediumId={academic.mediumId}
          standardId={academic.standardId}
          onClear={academic.clear}
          onChange={academic.update}
        />
      </Box>
      {scopes.isError ? (
        <AdmissionQueryError onRetry={scopes.refetch} />
      ) : (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CustomSelect
              label="Offering and assessment stage"
              value={visibleScope ? scopeKey : ''}
              isLoading={scopes.isLoading}
              onChange={(value) => setScope(String(value))}
              options={visibleScopes.map((item) => ({
                value: assessmentScopeKey(item),
                label: assessmentScopeLabel(item),
              }))}
              noOptionsMessage="No assessment stages enabled for your offerings."
            />
          </Box>
          <Tooltip
            title={`Academic filters${academic.boardId || academic.mediumId || academic.standardId ? ' (active)' : ''}`}
          >
            <IconButton
              size="small"
              aria-label={`Academic filters${academic.boardId || academic.mediumId || academic.standardId ? ' (active)' : ''}`}
              aria-expanded={showAcademicFilters}
              aria-controls="assessment-academic-filters"
              color={
                showAcademicFilters || academic.boardId || academic.mediumId || academic.standardId
                  ? 'primary'
                  : 'default'
              }
              onClick={() => setShowAcademicFilters((open) => !open)}
              sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
            >
              <Iconify icon="mdi:filter-variant" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
      {!scopes.isLoading && !scopes.isError && !visibleScopes.length && (
        <Alert severity="info">
          {!academic.academicYearId
            ? 'Choose an academic year to view assessment offerings and stages.'
            : academic.boardId || academic.mediumId || academic.standardId
              ? 'No assessment stages match these academic filters.'
              : 'Enable assessment management in a workflow stage and assign its published workflow to an offering to start.'}
        </Alert>
      )}
      <AssessmentWorkbenchControls data={workbench} />
      <Box
        role="tabpanel"
        id={`assessment-panel-${state.tab}`}
        aria-labelledby={`assessment-tab-${state.tab}`}
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {((state.tab === 'applicants' && applicants.isFetching && !!applicants.currentData) ||
          (state.tab === 'sessions' && sessions.isFetching && !!sessions.currentData)) && (
          <LinearProgress
            aria-label={
              state.tab === 'applicants'
                ? 'Refreshing assessment applicants'
                : 'Refreshing assessment sessions'
            }
            sx={{ flexShrink: 0 }}
          />
        )}
        {state.tab === 'sessions' && visibleScope?.schedulingEnabled && (
          <AssessmentSessionTable
            sessions={sessions.currentData ?? []}
            loading={sessions.isFetching && !sessions.currentData}
            canManage={permissions.manageSessions && visibleScope.schedulingEnabled}
            onEdit={(session) => visibleScope && setEditing({ session, scope: visibleScope })}
            onCancel={setCancelling}
            onRoster={(session) =>
              updateWorkbench({
                assessmentTab: 'applicants',
                assessmentSession: session.id,
                assessmentQueue: undefined,
                assessmentSearch: undefined,
                assessmentPage: 0,
              })
            }
            errorContent={
              sessions.isError ? <AdmissionQueryError onRetry={sessions.refetch} /> : undefined
            }
          />
        )}
        {state.tab === 'sessions' && visibleScope && !visibleScope.schedulingEnabled && (
          <Alert severity="info">
            This stage runs without scheduled sessions. Use Applicants to start assessments and
            record results.
          </Alert>
        )}
        {state.tab === 'applicants' && (
          <AssessmentApplicantTable
            items={
              visibleScope && !invalidSession && !applicants.isError
                ? (applicants.currentData?.items ?? [])
                : []
            }
            selectedSessionId={sessionId}
            canAdvance={canAdvance}
            onAction={(row, nextAction) =>
              visibleScope &&
              setAction({
                row,
                action: nextAction,
                offeringId: visibleScope.admissionOfferingId,
                definitionId: visibleScope.workflowStageDefinitionId,
                sessionId,
              })
            }
            onDetails={setDetails}
            isLoading={!!visibleScope && applicants.isFetching && !applicants.currentData}
            errorContent={
              visibleScope && applicants.isError ? (
                <AdmissionQueryError onRetry={applicants.refetch} />
              ) : undefined
            }
            page={state.page}
            rowsPerPage={state.size}
            defaultRowsPerPage={25}
            rowsPerPageOptions={[10, 25, 100]}
            totalCount={applicants.currentData?.totalCount ?? 0}
            searchTerm={state.search}
            sorts={[{ column: state.sort, direction: state.direction }]}
            onServerSearch={workbench.updateSearch}
            onServerPagination={(page, size) =>
              updateWorkbench({ assessmentPage: Math.max(0, page - 1), assessmentSize: size })
            }
            onServerSort={(_, sorts) =>
              updateWorkbench({
                assessmentSort: sorts[0]?.column ?? 'enteredAt',
                assessmentDirection: sorts[0]?.direction ?? 'desc',
                assessmentPage: 0,
              })
            }
            noDataText={
              !visibleScope
                ? 'Choose an offering and assessment stage to view applicants.'
                : invalidSession
                  ? 'Clear the unavailable session filter to view applicants.'
                  : state.search || state.queue !== 'all' || sessionId
                    ? 'No applicants match these filters.'
                    : 'No applicants have reached this assessment stage yet.'
            }
          />
        )}
        {!visibleScope && !!visibleScopes.length && state.tab === 'sessions' && (
          <Alert severity="info">
            Choose an offering and assessment stage to view its sessions.
          </Alert>
        )}
      </Box>
      {insights && visibleScope && !invalidSession && (
        <AssessmentInsightsDrawer
          scope={visibleScope}
          sessionName={sessions.currentData?.find((item) => item.id === sessionId)?.name}
          counts={sessionLookupUnavailable ? undefined : applicants.currentData?.counts}
          loading={sessionLookupUnavailable || applicants.isFetching || applicants.isUninitialized}
          error={applicants.isError || (!!state.sessionId && sessions.isError)}
          onRetry={state.sessionId && sessions.isError ? sessions.refetch : applicants.refetch}
          onClose={() => setInsights(false)}
        />
      )}
      {details && (
        <AssessmentApplicantDrawer
          row={details}
          canViewApplication={canViewApplication}
          returnUrl={href({})}
          onClose={() => setDetails(null)}
        />
      )}
      {action?.action === 'continue' && (
        <AssessmentContinueDialog row={action.row} onClose={() => setAction(null)} />
      )}
      {action && action.action !== 'continue' && action.row.assessment.policy && (
        <AssessmentActionDialog
          action={action.action}
          assessment={{ ...action.row.assessment, policy: action.row.assessment.policy }}
          admissionOfferingId={action.offeringId}
          workflowStageDefinitionId={action.definitionId}
          initialSessionId={action.sessionId}
          onClose={() => setAction(null)}
        />
      )}
      {editing && (
        <AssessmentSessionDialog
          scope={editing.scope}
          session={editing.session}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {cancelling && (
        <CancelAssessmentSessionDialog session={cancelling} onClose={() => setCancelling(null)} />
      )}
    </Box>
  );
}
