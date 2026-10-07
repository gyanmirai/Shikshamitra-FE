import { useEffect } from 'react';
import { useGetAssessmentApplicantsQuery } from 'src/redux/student/admissions/admission-assessment-roster-api';
import {
  useGetAssessmentScopesQuery,
  useGetAssessmentSessionsQuery,
} from 'src/redux/student/admissions/admission-assessment-sessions-api';

import { assessmentScopeKey } from './assessment-utils';
import { useAssessmentScope } from './use-assessment-scope';
import { useAssessmentWorkbench } from './use-assessment-workbench';
import { useAdmissionAcademicFilters } from '../admission-academic-filters';

export function useAssessmentWorkbenchData(canView: boolean, insights: boolean) {
  const academic = useAdmissionAcademicFilters();
  const scopes = useGetAssessmentScopesQuery(undefined, { skip: !canView });
  const { scopeKey, setScope } = useAssessmentScope();
  const { state, href, update: updateWorkbench } = useAssessmentWorkbench();
  const visibleScopes = (scopes.currentData ?? []).filter(
    (item) =>
      !!academic.academicYearId &&
      item.academicYearId === academic.academicYearId &&
      (!academic.boardId || item.boardId === academic.boardId) &&
      (!academic.mediumId || item.mediumId === academic.mediumId) &&
      (!academic.standardId || item.standardId === academic.standardId)
  );
  const visibleScope = visibleScopes.find((item) => assessmentScopeKey(item) === scopeKey);
  const sessions = useGetAssessmentSessionsQuery(
    {
      admissionOfferingId: visibleScope?.admissionOfferingId ?? '',
      workflowStageDefinitionId: visibleScope?.workflowStageDefinitionId ?? '',
    },
    {
      skip: !canView || !visibleScope?.schedulingEnabled,
      pollingInterval: 60000,
      skipPollingIfUnfocused: true,
    }
  );
  // Never silently broaden an unavailable selected session to all applicants.
  const sessionId = sessions.currentData?.some((item) => item.id === state.sessionId)
    ? state.sessionId
    : '';
  const invalidSession =
    !!state.sessionId &&
    !!visibleScope &&
    (!visibleScope.schedulingEnabled || (!!sessions.currentData && !sessionId));
  const sessionLookupUnavailable = !!(
    state.sessionId &&
    visibleScope?.schedulingEnabled &&
    (!sessions.currentData || sessions.isError)
  );
  const applicants = useGetAssessmentApplicantsQuery(
    {
      admissionOfferingId: visibleScope?.admissionOfferingId ?? '',
      workflowStageDefinitionId: visibleScope?.workflowStageDefinitionId ?? '',
      sessionId: sessionId || undefined,
      search: state.search || undefined,
      queue: state.queue === 'all' ? undefined : state.queue,
      sorting: `${state.sort} ${state.direction}`,
      skipCount: state.page * state.size,
      maxResultCount: state.size,
    },
    {
      skip:
        !visibleScope ||
        invalidSession ||
        sessionLookupUnavailable ||
        !canView ||
        (state.tab !== 'applicants' && !insights),
      refetchOnMountOrArgChange: true,
      pollingInterval: 60000,
      skipPollingIfUnfocused: true,
    }
  );
  useEffect(() => {
    if (
      state.tab !== 'applicants' ||
      applicants.isFetching ||
      applicants.isError ||
      !applicants.currentData
    )
      return;
    const lastPage = Math.max(0, Math.ceil(applicants.currentData.totalCount / state.size) - 1);
    if (state.page > lastPage) updateWorkbench({ assessmentPage: lastPage }, true);
  }, [
    state.tab,
    state.page,
    state.size,
    applicants.currentData,
    applicants.isFetching,
    applicants.isError,
    updateWorkbench,
  ]);
  const updateSearch = (value: string) => {
    // The shared table emits its restored search on mount. Keep deep-linked pages intact.
    if (value !== state.search)
      updateWorkbench({ assessmentSearch: value, assessmentPage: 0 }, true);
  };
  return {
    academic,
    scopes,
    scopeKey,
    setScope,
    visibleScopes,
    visibleScope,
    state,
    href,
    updateWorkbench,
    updateSearch,
    sessions,
    sessionId,
    invalidSession,
    sessionLookupUnavailable,
    applicants,
  };
}
