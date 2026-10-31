import { useMemo, useEffect } from 'react';
import { readAcademicFilterIds } from 'src/utils/student-academic-filter-query';
import { useGetAssessmentScopesQuery } from 'src/redux/student/admissions/admission-assessment-sessions-api';
import { useGetAssessmentApplicantsQuery } from 'src/redux/student/admissions/admission-assessment-roster-api';
import {
  useGetAssessmentSessionByIdQuery,
  useGetAssessmentSessionWorkbenchQuery,
} from 'src/redux/student/admissions/admission-assessment-planning-api';

import { assessmentScopeKey } from './assessment-utils';
import { useAssessmentScope } from './use-assessment-scope';
import { useAssessmentWorkbench } from './use-assessment-workbench';
import { useAdmissionAcademicFilters } from '../admission-academic-filters';
import {
  readAssessmentColumnFilters,
  serializeAssessmentColumnFilters,
} from './assessment-column-filters';

export function useAssessmentWorkspaceData(canView: boolean, pauseReads = false) {
  const academic = useAdmissionAcademicFilters();
  const scopes = useGetAssessmentScopesQuery(undefined, { skip: !canView || pauseReads });
  const { scopeKey, setScope } = useAssessmentScope();
  const { state, href, update: updateWorkbench } = useAssessmentWorkbench();
  const studentPanel = state.tab === 'applicants';
  const standardIds = useMemo(
    () => readAcademicFilterIds(academic.standardId),
    [academic.standardId]
  );
  const context = {
    academicYearId: academic.academicYearId,
    boardId: academic.boardId || undefined,
    mediumId: academic.mediumId || undefined,
    standardId: standardIds.length === 1 ? standardIds[0] : undefined,
    standardIds: standardIds.length > 1 ? standardIds.join(',') : undefined,
  };
  const visibleScopes = useMemo(
    () =>
      (scopes.currentData ?? []).filter(
        (item) =>
          !!academic.academicYearId &&
          item.academicYearId === academic.academicYearId &&
          (!academic.boardId || item.boardId === academic.boardId) &&
          (!academic.mediumId || item.mediumId === academic.mediumId) &&
          (!standardIds.length || standardIds.includes(item.standardId ?? ''))
      ),
    [scopes.currentData, academic.academicYearId, academic.boardId, academic.mediumId, standardIds]
  );
  const visibleScope = visibleScopes.find((item) => assessmentScopeKey(item) === scopeKey);
  const invalidScope = !!scopeKey && !!scopes.currentData && !visibleScope;
  const ready =
    canView &&
    !!academic.academicYearId &&
    !!academic.boardId &&
    !!academic.mediumId &&
    !scopes.isError &&
    !!scopes.currentData &&
    !invalidScope;
  const selectedSession = useGetAssessmentSessionByIdQuery(state.sessionId, {
    skip:
      pauseReads ||
      !studentPanel ||
      !canView ||
      !academic.academicYearId ||
      scopes.isError ||
      !scopes.currentData ||
      invalidScope ||
      !state.sessionId,
    refetchOnMountOrArgChange: true,
    pollingInterval: 60000,
    skipPollingIfUnfocused: true,
  });
  const sessionScopeDetails = selectedSession.currentData?.scopeDetails;
  const sessionLinks = sessionScopeDetails?.length
    ? sessionScopeDetails
    : selectedSession.currentData
      ? [selectedSession.currentData]
      : [];
  const selectedSessionInContext =
    !state.sessionId ||
    (!!selectedSession.currentData &&
      sessionLinks.some((link) =>
        visibleScopes.some(
          (scope) =>
            scope.admissionOfferingId === link.admissionOfferingId &&
            scope.workflowStageDefinitionId === link.workflowStageDefinitionId &&
            (!visibleScope || assessmentScopeKey(scope) === assessmentScopeKey(visibleScope))
        )
      ));
  const invalidSession =
    !!state.sessionId &&
    (selectedSession.isError || (!!selectedSession.currentData && !selectedSessionInContext));
  const sessionLookupUnavailable = !!state.sessionId && !selectedSession.currentData;
  const queryScope = {
    ...context,
    admissionOfferingId: visibleScope?.admissionOfferingId,
    workflowStageDefinitionId: visibleScope?.workflowStageDefinitionId,
  };
  const sessions = useGetAssessmentSessionWorkbenchQuery(
    { ...queryScope, includeCancelled: true, skipCount: 0, maxResultCount: 50 },
    {
      skip: pauseReads || !studentPanel || !ready,
      pollingInterval: 60000,
      skipPollingIfUnfocused: true,
    }
  );
  const applicants = useGetAssessmentApplicantsQuery(
    {
      ...queryScope,
      sessionId: state.sessionId || undefined,
      search: state.search || undefined,
      columnFilters: serializeAssessmentColumnFilters(
        readAssessmentColumnFilters(state.columnFilters)
      ),
      status: state.status === 'all' ? undefined : state.status,
      sorting: `${state.sort} ${state.direction}`,
      skipCount: state.page * state.size,
      maxResultCount: state.size,
    },
    {
      skip: pauseReads || !studentPanel || !ready || invalidSession || sessionLookupUnavailable,
      refetchOnMountOrArgChange: true,
      pollingInterval: 60000,
      skipPollingIfUnfocused: true,
    }
  );
  useEffect(() => {
    if (!studentPanel || applicants.isFetching || applicants.isError || !applicants.currentData)
      return;
    const lastPage = Math.max(0, Math.ceil(applicants.currentData.totalCount / state.size) - 1);
    if (state.page > lastPage) updateWorkbench({ assessmentPage: lastPage }, true);
  }, [
    state.page,
    state.size,
    applicants.currentData,
    applicants.isFetching,
    applicants.isError,
    updateWorkbench,
    studentPanel,
  ]);
  const updateSearch = (value: string) => {
    if (value !== state.search)
      updateWorkbench({ assessmentSearch: value, assessmentPage: 0 }, true);
  };
  // Shared academic defaults normally clear dependent filters. Restore a direct
  // assessment/session link atomically instead, so its identity is never lost.
  const updateAcademic: typeof academic.update = (key, value) => {
    const restoring =
      (key === 'board' && !academic.boardId) || (key === 'medium' && !academic.mediumId);
    if (!restoring || (!scopeKey && !state.sessionId)) {
      academic.update(key, value);
      return;
    }
    if (!scopes.currentData || scopes.isError) return;
    if (studentPanel && state.sessionId && !selectedSession.currentData && !selectedSession.isError)
      return;
    const linkedScope = visibleScopes.find((scope) => {
      if (scopeKey) return assessmentScopeKey(scope) === scopeKey;
      return sessionLinks.some(
        (link) =>
          link.admissionOfferingId === scope.admissionOfferingId &&
          link.workflowStageDefinitionId === scope.workflowStageDefinitionId
      );
    });
    updateWorkbench(
      linkedScope?.boardId && linkedScope.mediumId
        ? { board: linkedScope.boardId, medium: linkedScope.mediumId }
        : { [key]: value },
      true
    );
  };
  const sessionChoices = [...(sessions.currentData?.items ?? [])];
  if (selectedSession.currentData && !sessionChoices.some((item) => item.id === state.sessionId))
    sessionChoices.unshift(selectedSession.currentData);
  return {
    academic: { ...academic, update: updateAcademic },
    scopes,
    context,
    visibleScopes,
    visibleScope,
    scopeKey,
    setScope,
    invalidScope,
    state,
    href,
    updateWorkbench,
    updateSearch,
    sessions,
    selectedSession,
    sessionChoices,
    invalidSession,
    sessionLookupUnavailable,
    applicants,
    ready,
  };
}
