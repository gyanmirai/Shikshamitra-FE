import type { AppDispatch } from 'src/redux/store';

import { studentOnboardingApi } from 'src/redux/student/onboarding/student-onboarding-api';

/** Prepare existing reads only; the page retains all save/activation preflights. */
export function preloadStudentSetup(dispatch: AppDispatch, id: string) {
  dispatch((readDispatch, getState) => {
    const { auth } = getState();
    const item = readDispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingCase.initiate(id, { subscribe: false })
    );
    readDispatch(
      studentOnboardingApi.endpoints.getStudentOnboardingFeeStructure.initiate(id, {
        subscribe: false,
      })
    );
    // Match the page's case-success prerequisite for account/document summaries.
    item
      .then((result) => {
        if (getState().auth !== auth || !result.isSuccess || result.data?.id !== id) return;
        readDispatch(
          studentOnboardingApi.endpoints.getStudentOnboardingCredentials.initiate(id, {
            subscribe: false,
          })
        );
        readDispatch(
          studentOnboardingApi.endpoints.getStudentOnboardingWorkflowDocuments.initiate(id, {
            subscribe: false,
          })
        );
      })
      .catch(() => undefined);
  });
}
