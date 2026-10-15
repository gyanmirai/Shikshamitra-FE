'use client';

import type { RootState } from 'src/redux/store';
import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';
import type {
  AssessmentSession,
  AssessmentSelectedBooking,
  AssessmentSharedSessionInput,
} from 'src/redux/student/admissions/admission-assessment-types';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Alert, Button, Typography, LinearProgress } from '@mui/material';
import {
  usePreviewAssessmentSessionMutation,
  useConfirmAssessmentSessionMutation,
  useGetAssessmentSessionResourcesQuery,
  useGetAssessmentSessionWorkbenchQuery,
  useLazyGetAssessmentInterviewersQuery,
  useUpdateSharedAssessmentSessionMutation,
  useCancelSharedAssessmentSessionMutation,
} from 'src/redux/student/admissions/admission-assessment-planning-api';

import { AdmissionQueryError } from './admission-query-error';
import { AssessmentBatchDialog } from './assessments/assessment-batch-dialog';
import { AssessmentActionDialog } from './assessments/assessment-action-dialog';
import { AssessmentApplicantTable } from './assessments/assessment-applicant-table';
import { AssessmentContinueDialog } from './assessments/assessment-continue-dialog';
import { AssessmentApplicantDrawer } from './assessments/assessment-workbench-drawers';
import { ADMISSION_APPLICATION_PERMISSIONS } from './admission-application-permissions';
import { useAssessmentWorkspaceData } from './assessments/use-assessment-workspace-data';
import { AssessmentWorkspaceControls } from './assessments/assessment-workspace-controls';
import { AssessmentSessionSetupDrawer } from './assessments/assessment-session-setup-drawer';
import { AssessmentManageSessionsDrawer } from './assessments/assessment-manage-sessions-drawer';
import {
  useAssessmentPermissions,
  canAdvanceAssessmentApplications,
} from './assessments/use-assessment-permissions';

import type { AssessmentAction } from './assessments/assessment-action-model';
import type { AssessmentBatchAction } from './assessments/assessment-batch-model';

export default function AdmissionAssessmentsScreen() {
  const permissions = useAssessmentPermissions();
  const granted = useSelector((state: RootState) => state.auth.permissions);
  const canViewApplication = hasGrantedPermission(granted, ADMISSION_APPLICATION_PERMISSIONS.view);
  const canAdvance = canAdvanceAssessmentApplications(granted);
  const [batch, setBatch] = useState<{
    action: AssessmentBatchAction;
    rows: AssessmentRosterItem[];
  } | null>(null);
  const workbench = useAssessmentWorkspaceData(permissions.view, !!batch);
  const { academic, scopes, state, applicants, updateWorkbench } = workbench;
  const manage = useBoolean(state.manageSessions);
  const [managePage, setManagePage] = useState(0);
  const [manageSize, setManageSize] = useState(25);
  const [manageSearch, setManageSearch] = useState('');
  const [details, setDetails] = useState<AssessmentRosterItem | null>(null);
  const [action, setAction] = useState<{
    row: AssessmentRosterItem;
    action: AssessmentAction | 'continue';
  } | null>(null);
  const [editing, setEditing] = useState<{
    session: AssessmentSession | null;
    mode: 'create' | 'edit' | 'book';
  } | null>(null);
  const [selection, setSelection] = useState<AssessmentRosterItem[]>([]);
  const selectedIds = new Set(selection.map((row) => row.stageInstanceId));
  const academicContextKey = JSON.stringify(workbench.context);
  useEffect(() => {
    setManagePage(0);
  }, [academicContextKey]);
  const contextKey = JSON.stringify([
    workbench.context,
    workbench.scopeKey,
    state.sessionId,
    state.status,
    state.search,
    state.page,
    state.size,
  ]);
  useEffect(() => {
    setSelection([]);
  }, [contextKey]);
  const resources = useGetAssessmentSessionResourcesQuery(undefined, {
    skip:
      !editing ||
      !permissions.view ||
      !(editing.mode === 'book' ? permissions.book : permissions.manageSessions),
  });
  const managedSessions = useGetAssessmentSessionWorkbenchQuery(
    {
      ...workbench.context,
      skipCount: managePage * manageSize,
      maxResultCount: manageSize,
      search: manageSearch || undefined,
      includeCancelled: true,
    },
    {
      skip: !manage.value || !permissions.view || !academic.academicYearId,
      refetchOnMountOrArgChange: true,
    }
  );
  useEffect(() => {
    if (managedSessions.isFetching || managedSessions.isError || !managedSessions.currentData)
      return;
    const lastPage = Math.max(
      0,
      Math.ceil(managedSessions.currentData.totalCount / manageSize) - 1
    );
    if (managePage > lastPage) setManagePage(lastPage);
  }, [
    managedSessions.currentData,
    managedSessions.isFetching,
    managedSessions.isError,
    managePage,
    manageSize,
  ]);
  const [preview] = usePreviewAssessmentSessionMutation();
  const [confirm] = useConfirmAssessmentSessionMutation();
  const [update] = useUpdateSharedAssessmentSessionMutation();
  const [cancel] = useCancelSharedAssessmentSessionMutation();
  const [searchInterviewers] = useLazyGetAssessmentInterviewersQuery();
  const confirmationKey = useRef<{ payload: string; key: string } | null>(null);
  const openSetup = (session: AssessmentSession | null, mode: 'create' | 'edit' | 'book') => {
    confirmationKey.current = null;
    setEditing({ session, mode });
    manage.onFalse();
  };
  const sessionIdForBooking = editing?.mode === 'book' ? editing.session?.id : undefined;
  const submitSession = async (
    session: AssessmentSharedSessionInput,
    previewFingerprint: string,
    bookings: AssessmentSelectedBooking[]
  ) => {
    const body = {
      session,
      sessionId: sessionIdForBooking,
      sessionConcurrencyStamp:
        editing?.mode === 'book' ? editing.session?.concurrencyStamp : undefined,
      previewFingerprint,
      bookings: bookings.map(
        ({ applicationId, stageInstanceId, concurrencyStamp, slotStartsAt }) => ({
          applicationId,
          stageInstanceId,
          concurrencyStamp,
          slotStartsAt,
        })
      ),
    };
    const payload = JSON.stringify(body);
    if (confirmationKey.current?.payload !== payload)
      confirmationKey.current = { payload, key: crypto.randomUUID() };
    const result = await confirm({ ...body, idempotencyKey: confirmationKey.current.key }).unwrap();
    shikshaMitraToast.success({
      message:
        (result.bookedCount
          ? `${result.bookedCount} applicants booked`
          : editing?.mode === 'book'
            ? 'No applicants booked'
            : 'Assessment session created') +
        (result.session.roomReservationStatus === 2 ? '. Room approval is pending' : ''),
    });
  };
  const onSelection = (rows: AssessmentRosterItem[], checked: boolean) =>
    setSelection((current) => {
      const ids = new Set(rows.map((row) => row.stageInstanceId));
      if (!checked) return current.filter((row) => !ids.has(row.stageInstanceId));
      const next = [
        ...current.filter((row) => !ids.has(row.stageInstanceId)),
        ...rows.filter((row) => row.isActive && row.assessment.policy),
      ];
      return next.slice(0, 100);
    });
  const batchRows = (kind: AssessmentBatchAction) =>
    selection.filter(
      (row) =>
        row.isActive &&
        (kind === 'attendance'
          ? row.assessment.canRecordAttendance
          : kind === 'result'
            ? row.assessment.canRecordResult
            : row.assessment.canComplete)
    );
  const filtered =
    state.search ||
    state.status !== 'all' ||
    state.sessionId ||
    workbench.scopeKey ||
    academic.boardId ||
    academic.mediumId ||
    academic.standardId;
  const clearFilters = () =>
    updateWorkbench({
      assessmentSearch: undefined,
      assessmentQueue: undefined,
      assessmentStatus: undefined,
      assessmentSession: undefined,
      assessmentScope: undefined,
      assessmentPage: 0,
      board: undefined,
      medium: undefined,
      class: undefined,
      division: undefined,
    });
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        height: 1,
        minHeight: 0,
        '& .MuiButton-root': { minHeight: { xs: 44, sm: 32 } },
      }}
    >
      <CustomBreadcrumbs
        heading="Assessments"
        description="Schedule shared sessions, assess applicants and continue their admission journeys."
        links={[
          { name: 'Students', href: studentPaths.dashboard },
          { name: 'Admissions', href: studentPaths.enrollment.applications },
          { name: 'Assessments' },
        ]}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:calendar-outline" />}
              disabled={!permissions.view || !academic.academicYearId}
              onClick={manage.onTrue}
            >
              Manage Sessions
            </Button>
            {permissions.manageSessions && (
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                disabled={
                  scopes.isFetching ||
                  scopes.isError ||
                  !workbench.visibleScopes.some((scope) => scope.schedulingEnabled)
                }
                onClick={() => openSetup(null, 'create')}
              >
                Create Session
              </Button>
            )}
          </Stack>
        }
      />
      {!permissions.view ? (
        <Alert severity="info">You do not have permission to view assessments.</Alert>
      ) : (
        <>
          <AssessmentWorkspaceControls data={workbench} />
          {scopes.isError && <AdmissionQueryError onRetry={scopes.refetch} />}
          {!!selection.length && (
            <Stack
              direction="row"
              alignItems="center"
              flexWrap="wrap"
              spacing={1}
              sx={{ px: 1, flexShrink: 0 }}
            >
              <Typography variant="body2">{selection.length} selected</Typography>
              {permissions.attendance && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!batchRows('attendance').length}
                  onClick={() => setBatch({ action: 'attendance', rows: batchRows('attendance') })}
                >
                  Record Attendance ({batchRows('attendance').length})
                </Button>
              )}
              {permissions.results && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!batchRows('result').length}
                  onClick={() => setBatch({ action: 'result', rows: batchRows('result') })}
                >
                  Record Results ({batchRows('result').length})
                </Button>
              )}
              {canAdvance && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!batchRows('continue').length}
                  onClick={() => setBatch({ action: 'continue', rows: batchRows('continue') })}
                >
                  Continue ({batchRows('continue').length})
                </Button>
              )}
              <Button size="small" onClick={() => setSelection([])}>
                Clear Selection
              </Button>
            </Stack>
          )}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {applicants.isFetching && !!applicants.currentData && (
              <LinearProgress
                aria-label="Refreshing assessment applicants"
                sx={{ flexShrink: 0 }}
              />
            )}
            <AssessmentApplicantTable
              items={
                !workbench.invalidSession && !workbench.invalidScope && !applicants.isError
                  ? (applicants.currentData?.items ?? [])
                  : []
              }
              selectedSessionId={state.sessionId}
              selectedIds={selectedIds}
              onSelectionChange={
                permissions.attendance || permissions.results || canAdvance
                  ? onSelection
                  : undefined
              }
              canAdvance={canAdvance}
              onAction={(row, nextAction) => setAction({ row, action: nextAction })}
              onDetails={setDetails}
              isLoading={
                scopes.isLoading ||
                (scopes.isFetching && !scopes.currentData) ||
                (workbench.sessionLookupUnavailable && !workbench.invalidSession) ||
                (applicants.isFetching && !applicants.currentData)
              }
              errorContent={
                applicants.isError ? (
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
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="body2">
                    {!academic.academicYearId
                      ? 'Choose an academic year to view assessments.'
                      : workbench.invalidSession
                        ? 'Clear the unavailable session filter to view applicants.'
                        : workbench.invalidScope
                          ? 'Clear the unavailable offering filter to view applicants.'
                          : !workbench.visibleScopes.length
                            ? 'No assessment stages are configured for this academic context.'
                            : filtered
                              ? 'No applicants match these filters.'
                              : 'No applicants have reached an assessment stage yet.'}
                  </Typography>
                  {!!filtered && (
                    <Button size="small" variant="outlined" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </Stack>
              }
            />
          </Box>
        </>
      )}
      {details && (
        <AssessmentApplicantDrawer
          row={details}
          canViewApplication={canViewApplication}
          canAdvance={canAdvance}
          onAction={(row, next) => {
            setDetails(null);
            setAction({ row, action: next });
          }}
          returnUrl={workbench.href({})}
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
          admissionOfferingId={
            action.row.admissionOfferingId ?? workbench.visibleScope?.admissionOfferingId ?? ''
          }
          workflowStageDefinitionId={
            action.row.workflowStageDefinitionId ??
            workbench.visibleScope?.workflowStageDefinitionId ??
            ''
          }
          initialSessionId={state.sessionId}
          onClose={() => setAction(null)}
        />
      )}
      {editing && (
        <AssessmentSessionSetupDrawer
          key={`${editing.mode}:${editing.session?.id ?? 'new'}`}
          open
          mode={editing.mode}
          readOnly={
            !permissions.view ||
            !(editing.mode === 'book' ? permissions.book : permissions.manageSessions)
          }
          scopes={(scopes.currentData ?? []).filter(
            (scope) => scope.academicYearId === academic.academicYearId && scope.schedulingEnabled
          )}
          rooms={resources.currentData?.rooms ?? []}
          interviewers={resources.currentData?.interviewers ?? []}
          onSearchInterviewers={(query) => searchInterviewers(query, false).unwrap()}
          session={editing.session}
          resourcesLoading={resources.isFetching}
          resourcesError={
            resources.isError ? 'Unable to load Institute rooms and interviewers.' : undefined
          }
          onRetryResources={resources.refetch}
          onClose={() => setEditing(null)}
          onPreview={(session, query) =>
            preview({
              session,
              sessionId: sessionIdForBooking,
              sessionConcurrencyStamp:
                editing.mode === 'book' ? editing.session?.concurrencyStamp : undefined,
              ...query,
            }).unwrap()
          }
          onSubmit={submitSession}
          onSave={async (body) => {
            if (!editing.session) return;
            await update({ id: editing.session.id, body }).unwrap();
            shikshaMitraToast.success({ message: 'Assessment session updated' });
          }}
        />
      )}
      {manage.value && (
        <AssessmentManageSessionsDrawer
          open
          sessions={managedSessions.currentData?.items ?? []}
          totalCount={managedSessions.currentData?.totalCount ?? 0}
          page={managePage}
          pageSize={manageSize}
          isLoading={managedSessions.isFetching && !managedSessions.currentData}
          isFetching={managedSessions.isFetching}
          error={managedSessions.isError ? 'Unable to load assessment sessions.' : undefined}
          canManage={permissions.view && permissions.manageSessions}
          canBook={permissions.view && permissions.book}
          selectedSessionId={state.sessionId}
          onClose={manage.onFalse}
          onRetry={managedSessions.refetch}
          onSelect={(session) => {
            updateWorkbench({
              assessmentSession: session.id,
              assessmentScope: undefined,
              assessmentQueue: undefined,
              assessmentStatus: undefined,
              assessmentPage: 0,
            });
            manage.onFalse();
          }}
          onEdit={(session) => openSetup(session, 'edit')}
          onBook={(session) => openSetup(session, 'book')}
          onCancel={async (session, notes) => {
            await cancel({
              id: session.id,
              concurrencyStamp: session.concurrencyStamp,
              cancelPendingBookings: true,
              notes,
            }).unwrap();
            shikshaMitraToast.success({ message: 'Session cancelled and room released' });
          }}
          onPage={(page, size) => {
            setManagePage(page);
            setManageSize(size);
          }}
          onSearch={(value) => {
            setManageSearch(value);
            setManagePage(0);
          }}
        />
      )}
      {batch && (
        <AssessmentBatchDialog
          action={batch.action}
          rows={batch.rows}
          onClose={() => {
            setBatch(null);
            setSelection([]);
          }}
        />
      )}
    </Box>
  );
}
